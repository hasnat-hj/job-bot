import dotenv from "dotenv";

dotenv.config();

const ORGANIZATION_USAGE_COMPLETIONS_URL =
  "https://api.openai.com/v1/organization/usage/completions";

const DEFAULT_MAIN_DAILY_LIMIT = 250_000;
const DEFAULT_MINI_DAILY_LIMIT = 2_500_000;
const DEFAULT_SAFETY_BUFFER = 20_000;
const DEFAULT_OUTPUT_TOKEN_ESTIMATE = 6_000;

export const usageConfig = {
  primaryModel: process.env.OPENAI_RESUME_MODEL || "gpt-5.4",
  fallbackModel: process.env.OPENAI_RESUME_FALLBACK_MODEL || "gpt-5.4-mini",
  mainDailyLimit: readNumberEnv("OPENAI_DAILY_MAIN_TOKEN_LIMIT", DEFAULT_MAIN_DAILY_LIMIT),
  miniDailyLimit: readNumberEnv("OPENAI_DAILY_MINI_TOKEN_LIMIT", DEFAULT_MINI_DAILY_LIMIT),
  safetyBuffer: readNumberEnv("OPENAI_TOKEN_SAFETY_BUFFER", DEFAULT_SAFETY_BUFFER),
  outputTokenEstimate: readNumberEnv(
    "OPENAI_ESTIMATED_OUTPUT_TOKENS",
    DEFAULT_OUTPUT_TOKEN_ESTIMATE
  ),
};

function readNumberEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function startOfTodayUTCSeconds() {
  const now = new Date();
  const startOfDayUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );

  return Math.floor(startOfDayUTC.getTime() / 1000);
}

function modelBucket(model = "") {
  return /(?:mini|nano)/i.test(model) ? "mini" : "main";
}

function bucketLimit(bucket) {
  return bucket === "mini" ? usageConfig.miniDailyLimit : usageConfig.mainDailyLimit;
}

function emptyBucket(limit) {
  return {
    totalTokens: 0,
    promptTokens: 0,
    completionTokens: 0,
    requests: 0,
    models: {},
    limit,
    remainingBeforeBuffer: limit,
  };
}

function estimateTextTokens(value) {
  return Math.ceil(String(value || "").length / 4);
}

export function estimateMessagesTokens(messages) {
  const messageTokens = messages.reduce((sum, message) => {
    return sum + estimateTextTokens(message.role) + estimateTextTokens(message.content) + 8;
  }, 0);

  return messageTokens + usageConfig.outputTokenEstimate;
}

function addResultToBucket(bucket, model, result) {
  const promptTokens = Number(result.input_tokens || 0);
  const completionTokens = Number(result.output_tokens || 0);
  const totalTokens = promptTokens + completionTokens;
  const requests = Number(result.num_model_requests || 0);
  const modelName = model || "all_models";

  bucket.totalTokens += totalTokens;
  bucket.promptTokens += promptTokens;
  bucket.completionTokens += completionTokens;
  bucket.requests += requests;
  bucket.models[modelName] ||= {
    totalTokens: 0,
    promptTokens: 0,
    completionTokens: 0,
    requests: 0,
  };
  bucket.models[modelName].totalTokens += totalTokens;
  bucket.models[modelName].promptTokens += promptTokens;
  bucket.models[modelName].completionTokens += completionTokens;
  bucket.models[modelName].requests += requests;
}

function buildUsageUrl({ groupByModel }) {
  const url = new URL(ORGANIZATION_USAGE_COMPLETIONS_URL);
  url.searchParams.append("start_time", String(startOfTodayUTCSeconds()));

  if (groupByModel) {
    url.searchParams.append("group_by", "model");
  }

  return url;
}

async function requestOrganizationUsage(groupByModel) {
  const response = await fetch(buildUsageUrl({ groupByModel }), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY_ADMIN}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`HTTP ${response.status}${body ? `: ${body}` : ""}`);
  }

  return response.json();
}

export async function fetchOrganizationCompletionsUsage() {
  if (!process.env.OPENAI_API_KEY_ADMIN) {
    return {
      available: false,
      reason: "OPENAI_API_KEY_ADMIN is not set",
    };
  }

  let usageData;
  let groupedByModel = true;

  try {
    usageData = await requestOrganizationUsage(true);
  } catch (error) {
    groupedByModel = false;

    try {
      usageData = await requestOrganizationUsage(false);
    } catch (fallbackError) {
      return {
        available: false,
        reason: fallbackError.message,
        groupedByModel,
      };
    }
  }

  const main = emptyBucket(usageConfig.mainDailyLimit);
  const mini = emptyBucket(usageConfig.miniDailyLimit);

  for (const bucket of usageData.data || []) {
    for (const result of bucket.results || []) {
      const model = result.model || null;
      const bucketName = groupedByModel && model ? modelBucket(model) : "main";
      addResultToBucket(bucketName === "mini" ? mini : main, model, result);
    }
  }

  main.remainingBeforeBuffer = Math.max(0, main.limit - main.totalTokens);
  mini.remainingBeforeBuffer = Math.max(0, mini.limit - mini.totalTokens);

  return {
    available: true,
    source: "organization",
    day: new Date(startOfTodayUTCSeconds() * 1000).toISOString().slice(0, 10),
    timezone: "UTC",
    groupedByModel,
    main,
    mini,
    primaryModel: usageConfig.primaryModel,
    fallbackModel: usageConfig.fallbackModel,
    safetyBuffer: usageConfig.safetyBuffer,
  };
}

export async function chooseResumeModel(messages) {
  const estimatedTokens = estimateMessagesTokens(messages);
  const organizationUsage = await fetchOrganizationCompletionsUsage();

  if (!organizationUsage.available) {
    throw new Error(
      `OpenAI cloud usage check failed: ${organizationUsage.reason}. Set OPENAI_API_KEY_ADMIN with organization usage permission before running the resume bot.`
    );
  }

  const primaryBucket = modelBucket(usageConfig.primaryModel);
  const primaryUsage = organizationUsage[primaryBucket];
  const primaryLimit = bucketLimit(primaryBucket);

  if (primaryUsage.totalTokens + estimatedTokens <= primaryLimit - usageConfig.safetyBuffer) {
    return {
      model: usageConfig.primaryModel,
      bucket: primaryBucket,
      estimatedTokens,
      usedToday: primaryUsage.totalTokens,
      limit: primaryLimit,
      fallback: false,
      usageSource: organizationUsage.source,
      groupedByModel: organizationUsage.groupedByModel,
    };
  }

  const fallbackBucket = modelBucket(usageConfig.fallbackModel);
  const fallbackUsage = organizationUsage[fallbackBucket];
  const fallbackLimit = bucketLimit(fallbackBucket);

  if (fallbackUsage.totalTokens + estimatedTokens <= fallbackLimit - usageConfig.safetyBuffer) {
    return {
      model: usageConfig.fallbackModel,
      bucket: fallbackBucket,
      estimatedTokens,
      usedToday: fallbackUsage.totalTokens,
      limit: fallbackLimit,
      fallback: true,
      usageSource: organizationUsage.source,
      groupedByModel: organizationUsage.groupedByModel,
    };
  }

  throw new Error(
    `OpenAI daily token guard stopped this run. Estimated ${estimatedTokens} tokens, main used ${organizationUsage.main.totalTokens}/${usageConfig.mainDailyLimit}, mini used ${organizationUsage.mini.totalTokens}/${usageConfig.miniDailyLimit}.`
  );
}

export async function getOpenAIUsageSummary() {
  return fetchOrganizationCompletionsUsage();
}
