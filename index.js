import fs from "fs";
import puppeteer from "puppeteer";
import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {
  company_name,
  Job_description as jobDescription,
  other_guideline,
} from "./data.js";
import { chooseResumeModel } from "./openai-usage.js";

// Load env variables
dotenv.config();

// ✅ Dynamically import pdf-parse (fixes ALL ESM issues)
const pdfParse = (await import("pdf-parse")).default;
const INPUT_PDF_PATH = "./Base_Resume.pdf";
const OUTPUT_PDF_PATH = "./resume.pdf";

const CANDIDATE = {
  name: "HASNAT SHABBIR",
  phone: "+447555857820",
  email: "hasnat5124@gmail.com",
  location: "London, UK",
};

// OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// const jobDescription = `
// We are looking for a Senior Full-Stack Engineer with strong experience in React, Node.js, and AWS. 
// The ideal candidate will have experience building scalable SaaS products, managing CI/CD pipelines, 
// and working with Docker. Experience with React Native is a huge plus.
// `;

// ---------------- MAIN ----------------


// Make sure your main function now takes companyName

async function main() {
  try {
    const dateStr = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

    // ---------------------------------------------------------
    // STEP 1: Setup Tracking Folders & Prevent Overwriting
    // ---------------------------------------------------------
    const baseDir = path.join(process.cwd(), "Job_Applications");
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir); // Create base directory if it doesn't exist
    }
    const safeCompanyName =
      company_name.trim().replace(/[^\w.-]+/g, "_").replace(/^_+|_+$/g, "") ||
      "Company";

    let version = 1;
    let folderName = `${safeCompanyName}_${dateStr}`;
    let outputFolder = path.join(baseDir, folderName);

    // If you apply to the same company again on the same day, don't override!
    // This loop increments a version number (e.g., Google_2026-04-04_v2)
    while (fs.existsSync(outputFolder)) {
      version++;
      folderName = `${safeCompanyName}_${dateStr}_v${version}`;
      outputFolder = path.join(baseDir, folderName);
    }

    fs.mkdirSync(outputFolder); // Create the unique folder for this application

    const OUTPUT_PDF_PATH2 = path.join(outputFolder, `${safeCompanyName}_Resume.pdf`);
    const OUTPUT_HTML_PATH = path.join(outputFolder, `${safeCompanyName}_Resume.html`);
    const OUTPUT_JD_PATH = path.join(outputFolder, "Job_Description.txt");

    // Save the raw Job Description into the folder for future reference
    fs.writeFileSync(OUTPUT_JD_PATH, jobDescription);

    // ---------------------------------------------------------
    // STEP 2: Your Existing Resume Generation Logic
    // ---------------------------------------------------------
    console.log(`1. Reading and parsing base resume PDF for ${safeCompanyName}...`);
    const pdfBuffer = fs.readFileSync(INPUT_PDF_PATH); // Assuming this is defined globally
    const pdfData = await pdfParse(pdfBuffer);
    const baseResumeText = cleanResumeText(pdfData.text);

    console.log("2. Sending data to OpenAI to tailor resume...");
    const htmlResume = await tailorResumeWithOpenAI(
      baseResumeText,
      jobDescription,
      other_guideline
    );

    console.log("3. Generating ATS-friendly PDF with Puppeteer...");
    const finalHTML = await generatePDF(htmlResume, OUTPUT_PDF_PATH);
    fs.writeFileSync(OUTPUT_HTML_PATH, finalHTML, "utf8");

    console.log("Copying tailored resume to application folder...");
    // Instantly copy the file we just generated to the new path
    // OUTPUT_PDF_PATH2 is already an absolute path, so just use it directly!
    fs.copyFileSync(OUTPUT_PDF_PATH, OUTPUT_PDF_PATH2);

    console.log(`📄 Second copy saved to: ${OUTPUT_PDF_PATH2}`);
    // ---------------------------------------------------------
    // STEP 3: Update CSV Tracker (Preventing Duplicates)
    // ---------------------------------------------------------
    console.log("4. Logging application to CSV Tracker...");
    const csvPath = path.join(process.cwd(), "Application_Tracker.csv");
    const csvHeader = "Date,Company Name,Version,Resume Path\n";

    // We wrap strings in quotes in case company names have commas in them
    const newRecord = `${dateStr},${csvEscape(company_name)},${csvEscape(folderName)},${csvEscape(OUTPUT_PDF_PATH2)}\n`;

    if (!fs.existsSync(csvPath)) {
      // Create CSV with headers if it's the first time running
      fs.writeFileSync(csvPath, csvHeader + newRecord);
    } else {
      fs.appendFileSync(csvPath, newRecord);
    }

    console.log(`✅ Success! Tailored resume and JD saved in: ${outputFolder}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// ---------------- CLEAN TEXT ----------------

function cleanResumeText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{2,}/g, "\n\n")
    .replace(/[^\x00-\x7F]/g, "")
    .trim();
}

function csvEscape(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

// ---------------- OPENAI ----------------

async function tailorResumeWithOpenAI(resumeText, jobDesc,other_guideline) {
  const prompt = `
You are an expert resume writer and ATS-optimization specialist.

Your task:
- Tailor the resume to match the job description perfectly
- Highlight relevant skills, projects, and experience
- Improve wording using strong action verbs
- Preserve truthful details from the base resume. Do not fabricate employers, degrees, metrics, tools, dates, or achievements.
- Keep the finished resume polished and compact, similar to the original CV style: strong section rules, dense but readable spacing, and clear recruiter-facing hierarchy.

STRICT ATS RULES:
- Single column layout only
- No tables
- No icons or graphics
- Use standard fonts (Arial, Helvetica)
- Use semantic HTML only: <section>, <h2>, <h3>, <p>, <strong>, <ul>, <li>
- Clean, readable formatting

IMPORTANT:
Return ONLY raw HTML body sections. No markdown. No explanations.
Do not include <html>, <head>, <style>, <body>, candidate name, or contact header.
Start with the Summary section and keep sections in this order where possible:
Summary, Skills, Experience, Projects, Education.
Use the same content rhythm as the base CV:
- Summary: one concise paragraph, then a separate Work Authorization paragraph if relevant.
- Summary emphasis: use <strong> on 5-8 important phrases, similar to the base CV. Good emphasis targets are role title, years of experience, UK experience, main JavaScript stack, scalable/high-performance applications, AWS/Docker/cloud, clean/maintainable code, and no sponsorship required.
- Skills: use paragraph lines, not bullets. Include a "Technical Skills" line, then category paragraphs like <p><strong>Frontend Development:</strong> React, Next.js...</p>.
- Experience: each job should be <h3>Company | Location</h3>, then <p><strong>Title | Date</strong></p>, then concise bullets.
- Projects: each project should be <h3>Project Name | Short Context</h3>, then concise bullets.
Keep bullets concise and high-impact. Avoid long paragraphs and avoid keyword stuffing.
My Primary Stack is  Javascript technologies
like React, Node.js , Express.js Nextjs, Nest Js , react Native etc
and I have experience with aws , docker etc

Base Resume:
${resumeText}

Job Description:
${jobDesc}

Extra Guideline:
${other_guideline}
`;

  const messages = [
    {
      role: "system",
      content: "You are an expert resume writer and ATS optimization specialist."
    },
    {
      role: "user",
      content: prompt
    }
  ];

  const modelChoice = await chooseResumeModel(messages);

  if (modelChoice.fallback) {
    console.log(
      `OpenAI token guard (${modelChoice.usageSource}): using fallback ${modelChoice.model}. ${modelChoice.bucket} bucket used ${modelChoice.usedToday}/${modelChoice.limit}; estimated request ${modelChoice.estimatedTokens}.`
    );
  } else {
    console.log(
      `OpenAI token guard (${modelChoice.usageSource}): using ${modelChoice.model}. ${modelChoice.bucket} bucket used ${modelChoice.usedToday}/${modelChoice.limit}; estimated request ${modelChoice.estimatedTokens}.`
    );
  }

  const response = await client.chat.completions.create({
    // model: "gpt-4o-mini",
    // model: "gpt-4o",
    // messages: [{ role: "user", content: prompt }],
    // temperature: 0.1,

    // model: "gpt-5.2",
    model: modelChoice.model,

  messages,
  temperature: 0.3
  });

  let htmlContent = response.choices[0].message.content;

  // safety cleanup
  htmlContent = htmlContent
    .replace(/```html\n?/g, "")
    .replace(/```/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"');

  return htmlContent;
}

// ---------------- PDF GENERATION ----------------

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function sanitizeGeneratedHtml(htmlContent) {
  let bodyContent = String(htmlContent || "");
  const bodyMatch = bodyContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

  if (bodyMatch) {
    bodyContent = bodyMatch[1];
  }

  bodyContent = bodyContent
    .replace(/<!doctype[^>]*>/gi, "")
    .replace(/<head[\s\S]*?<\/head>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<link[^>]*>/gi, "")
    .replace(/<meta[^>]*>/gi, "")
    .replace(/<\/?(?:html|body)[^>]*>/gi, "")
    .replace(/^\s*<h1[^>]*>[\s\S]{0,120}?hasnat[\s\S]{0,120}?<\/h1>\s*/i, "")
    .replace(/^\s*<(p|div)[^>]*>[\s\S]{0,260}?(?:hasnat5124@gmail\.com|\+44\s*7555|London,\s*UK)[\s\S]{0,260}?<\/\1>\s*/i, "")
    .trim();

  return emphasizeSummarySection(normalizeSkillsSection(bodyContent));
}

function normalizeSkillsSection(htmlContent) {
  return htmlContent.replace(
    /(<section[^>]*>\s*<h2[^>]*>\s*(?:Core\s+)?Skills\s*<\/h2>)([\s\S]*?)(<\/section>)/i,
    (_match, openSection, sectionContent, closeSection) => {
      const normalizedContent = sectionContent
        .replace(
          /<h3[^>]*>\s*([^<:]+):?\s*<\/h3>\s*<ul[^>]*>\s*([\s\S]*?)\s*<\/ul>/gi,
          (_block, title, listItems) => {
            const items = Array.from(listItems.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi))
              .map((item) => item[1].trim())
              .filter(Boolean)
              .join(", ");

            return `<p><strong>${title.trim()}:</strong> ${items}</p>`;
          }
        )
        .replace(/<ul[^>]*>\s*([\s\S]*?)\s*<\/ul>/gi, (_block, listItems) => {
          const lines = Array.from(listItems.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi))
            .map((item) => `<p>${item[1].trim()}</p>`)
            .join("\n");

          return lines || "";
        });

      return `${openSection}${normalizedContent}${closeSection}`;
    }
  );
}

function emphasizeSummarySection(htmlContent) {
  return htmlContent.replace(
    /(<section[^>]*>\s*<h2[^>]*>\s*Summary\s*<\/h2>\s*)([\s\S]*?)(<\/section>)/i,
    (_match, openSection, sectionContent, closeSection) => {
      const emphasizedContent = sectionContent.replace(
        /<p[^>]*>([\s\S]*?)<\/p>/i,
        (paragraph, paragraphText) => {
          if (/<strong\b/i.test(paragraphText)) {
            return paragraph;
          }

          return `<p>${emphasizeSummaryText(paragraphText)}</p>`;
        }
      );

      return `${openSection}${emphasizedContent}${closeSection}`;
    }
  );
}

function emphasizeSummaryText(text) {
  const phrases = [
    /Software Engineer/gi,
    /\b5 years(?: of)?(?: hands-on)? experience\b/gi,
    /\b(?:almost|nearly)?\s*2 years? in the UK\b/gi,
    /JavaScript technologies/gi,
    /React,?\s+Next\.js,?\s+Node\.js,?\s+Express\.js,?\s+NestJS,?\s+(?:and\s+)?React Native/gi,
    /scalable(?:,\s*high-performance)? web and mobile applications/gi,
    /AWS(?: cloud services)?/gi,
    /Docker/gi,
    /containerized architectures?/gi,
    /clean,?\s+maintainable code/gi,
    /full-time role/gi,
    /no sponsorship required/gi,
  ];

  return phrases.reduce((result, phrase) => {
    return result.replace(phrase, (match) => `<strong>${match}</strong>`);
  }, text);
}

export function buildResumeDocument(htmlContent) {
  const bodyContent = sanitizeGeneratedHtml(htmlContent);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(CANDIDATE.name)} - Tailored Resume</title>
  <style>
    * {
      box-sizing: border-box;
    }

    @page {
      size: Letter;
      margin: 0.42in 0.47in 0.4in;
    }

    html,
    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #111111;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 13px;
      line-height: 1.23;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .resume {
      width: 100%;
      max-width: 7.54in;
      margin: 0 auto;
    }

    .name {
      margin: 0;
      padding: 0 0 2px;
      font-size: 20px;
      line-height: 1.05;
      font-weight: 700;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    .contact {
      margin: 0 0 23px;
      padding: 0 0 4px;
      border-bottom: 2px solid #9a9a9a;
      font-size: 13px;
      line-height: 1.1;
    }

    .resume-body > :first-child {
      margin-top: 0;
    }

    section {
      margin: 0;
      padding: 0;
    }

    .entry {
      margin: 0 0 8px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    h1 {
      margin: 0 0 7px;
      font-size: 15px;
      line-height: 1.15;
      font-weight: 700;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    h2 {
      margin: 14px 0 9px;
      padding: 0 0 7px;
      border-bottom: 2px solid #9a9a9a;
      font-size: 15px;
      line-height: 1.15;
      font-weight: 700;
      letter-spacing: 0;
      break-after: avoid;
      page-break-after: avoid;
    }

    h3,
    h4 {
      margin: 12px 0 2px;
      font-size: 13px;
      line-height: 1.15;
      font-weight: 700;
      letter-spacing: 0;
      break-after: avoid;
      page-break-after: avoid;
    }

    p {
      margin: 0 0 12px;
      padding: 0;
      orphans: 2;
      widows: 2;
    }

    p:empty {
      display: none;
    }

    ul {
      margin: 3px 0 12px 18px;
      padding: 0;
    }

    li {
      margin: 0 0 3px;
      padding-left: 1px;
      orphans: 2;
      widows: 2;
    }

    strong,
    b {
      font-weight: 700;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    hr {
      margin: 7px 0;
      border: 0;
      border-top: 1px solid #a8a8a8;
    }

    .resume-body > ul:first-child {
      margin-top: 0;
    }

    .resume-body section:nth-of-type(2) h3 {
      margin: 13px 0 2px;
    }

    .resume-body section:nth-of-type(2) ul {
      margin: 0 0 12px;
      list-style: none;
    }

    .resume-body section:nth-of-type(2) li {
      margin: 0 0 8px;
      padding-left: 0;
    }

    h3 + p {
      margin-top: 0;
      margin-bottom: 6px;
    }

    @media print {
      .resume {
        max-width: none;
      }
    }
  </style>
</head>
<body>
  <main class="resume">
    <header>
      <h1 class="name">${escapeHtml(CANDIDATE.name)}</h1>
      <div class="contact">${escapeHtml(CANDIDATE.phone)} | ${escapeHtml(CANDIDATE.email)} | ${escapeHtml(CANDIDATE.location)}</div>
    </header>
    <div class="resume-body">
      ${bodyContent}
    </div>
  </main>
</body>
</html>`;
}

export async function generatePDF(htmlContent, outputPath) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  const finalHTML = buildResumeDocument(htmlContent);

  await page.setContent(finalHTML, {
    waitUntil: "domcontentloaded",
  });

  await page.emulateMediaType("print");

  await page.pdf({
    path: outputPath,
    printBackground: true,
    preferCSSPageSize: true,
  });

  await browser.close();
  return finalHTML;
}

// ---------------- RUN ----------------

const isMainModule =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  main();
}
