import { getOpenAIUsageSummary } from "./openai-usage.js";

function formatBucket(name, bucket) {
  const percent = bucket.limit
    ? ((bucket.totalTokens / bucket.limit) * 100).toFixed(2)
    : "0.00";

  console.log(`${name}:`);
  console.log(`  tokens: ${bucket.totalTokens}/${bucket.limit} (${percent}%)`);
  console.log(`  requests: ${bucket.requests}`);
  console.log(`  remaining before hard limit: ${bucket.remainingBeforeBuffer}`);

  for (const [model, usage] of Object.entries(bucket.models || {})) {
    console.log(
      `  ${model}: ${usage.totalTokens} tokens across ${usage.requests} request(s)`
    );
  }
}

const summary = await getOpenAIUsageSummary();

if (!summary.available) {
  console.error(`OpenAI cloud usage unavailable: ${summary.reason}`);
  console.error("Set OPENAI_API_KEY_ADMIN in .env with organization usage permission.");
  process.exitCode = 1;
} else {
  console.log(`OpenAI cloud usage for ${summary.day} (${summary.timezone})`);
  console.log(`Primary model: ${summary.primaryModel}`);
  console.log(`Fallback model: ${summary.fallbackModel}`);
  console.log(`Safety buffer: ${summary.safetyBuffer} tokens`);
  console.log(`Grouped by model: ${summary.groupedByModel ? "yes" : "no"}`);
  formatBucket("Main bucket", summary.main);
  formatBucket("Mini bucket", summary.mini);
}
