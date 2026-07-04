import fs from "fs";
import path from "path";
import { buildResumeDocument, generatePDF } from "./index.js";

const OUTPUT_DIR = path.join(process.cwd(), "Generated_Manual_Resumes");

const workAuthorization =
  "Full right to work in the UK (Graduate Visa valid until Feb-2028, no sponsorship required)";

const education = [
  {
    school: "University of Hertfordshire",
    location: "Hatfield, England",
    degree: "MS Advanced Computer Science",
    date: "09/2025",
  },
  {
    school: "University of Sialkot",
    location: "Sialkot, Pakistan",
    degree: "BS Software Engineering",
    date: "08/2022",
  },
];

const resumes = [
  {
    fileBase: "01_Hasnat_Shabbir_Master_Base_Resume",
    summary:
      '<strong>Software Engineer</strong> with <strong>5 years of hands-on experience</strong>, including <strong>almost 2 years in the UK</strong>, building production web, mobile, backend, and cloud systems using <strong>React, Next.js, Node.js, Express.js, NestJS, React Native, .NET backend APIs, SQL Server, AWS, and Docker</strong>. Experienced across SaaS taxi dispatch platforms, real-time communication, dashboards, mobile apps, API integrations, SQL/NoSQL databases, CI/CD, Windows Server/IIS deployment support, and production troubleshooting. Known for clean, maintainable code, ownership, and reliable delivery across modern and legacy systems.',
    skills: [
      ["Frontend", "React, Next.js, JavaScript, TypeScript, Redux, HTML5, CSS, Bootstrap, responsive UI, dashboards"],
      ["Backend", "Node.js, Express.js, NestJS, .NET backend APIs, REST APIs, GraphQL APIs, authentication, role-based access"],
      ["Mobile", "React Native, driver/customer apps, mobile API integration, push notifications, location-aware workflows"],
      ["Databases", "SQL Server, MongoDB, PostgreSQL, SQL, Mongoose, Sequelize, LINQ query work"],
      ["Cloud & DevOps", "AWS Elastic Beanstalk, EC2, S3, Lambda, Route 53, Docker, Docker Compose, CI/CD, AWS CodePipeline, Windows Server/IIS deployment support"],
      ["Real-Time & Integration", "Socket.io, WebSockets, SignalR, API integrations, Swagger/OpenAPI, payment workflows, domain configuration"],
    ],
    experience: [
      {
        company: "CabDespatch LTD",
        location: "Kent, England",
        title: "Software Engineer",
        date: "08/2024 - Present",
        bullets: [
          "Develop and maintain SaaS taxi booking and dispatch systems using React Native mobile apps, React web dashboards, .NET backend APIs, SQL Server-backed workflows, and cloud deployment pipelines.",
          "Support legacy .NET backend projects and newer platform features, including booking workflows, dispatch logic, operator configuration, API integrations, and SQL Server data access.",
          "Work on LINQ query logic, database-backed workflows, and production troubleshooting for ride booking, customer, driver, and operator journeys.",
          "Implement and support real-time taxi system updates using SignalR/socket-based messaging for ride status, dispatch coordination, and operational visibility.",
          "Manage AWS Elastic Beanstalk, Docker, CI/CD, domain configuration, and Microsoft server deployment support for backend and frontend services.",
          "Contribute to multi-tenant SaaS architecture with client-specific configuration, zone-based access, and maintainable production release workflows.",
        ],
      },
      {
        company: "Fabulous Technology Solutions",
        location: "Sialkot, Pakistan",
        title: "Software Engineer",
        date: "02/2022 - 08/2024",
        bullets: [
          "Built full-stack web and mobile features using React, Next.js, React Native, Node.js, Express.js, JavaScript, TypeScript, MongoDB, PostgreSQL, AWS, and Docker.",
          "Developed backend services, API integrations, authentication flows, dashboard features, and database-driven workflows for production applications.",
          "Improved backend performance through query optimization, scalable API design, and cleaner service structure while keeping frontend features maintainable.",
          "Designed reusable components and backend patterns that reduced development effort by 50% across multiple projects.",
          "Promoted to Team Lead in 2024, supporting a team of 10 developers and driving delivery, code quality, and project execution.",
        ],
      },
      {
        company: "Logics Yard",
        location: "Lahore, Pakistan",
        title: "Associate Software Engineer",
        date: "07/2021 - 02/2022",
        bullets: [
          "Developed responsive web components using HTML, CSS, JavaScript, and React.",
          "Assisted with Node.js and Express.js backend functionality, server-side logic, and REST API integration.",
          "Collaborated on debugging, troubleshooting, and code reviews to improve reliability across frontend and backend layers.",
        ],
      },
    ],
    projects: [
      {
        name: "GPHTEST / Glacier Peak Holistics Test Platform",
        context: "Full-Stack Operations Platform",
        bullets: [
          "Led development of a production testing platform used to manage 50k+ workflows across registrations, barcode operations, sample tracking, technician reports, and customer result delivery.",
          "Built multi-role dashboards, backend workflows, PDF/report generation, barcode exports, role-based access, analytics aggregation, and operational reporting.",
          "Delivered React interfaces and Node.js/Express/MongoDB services that automated high-volume business processes and reduced manual handling.",
        ],
      },
      {
        name: "Topics Chat",
        context: "Social Media & Real-Time Communication Platform",
        bullets: [
          "Built scalable real-time communication features including 1-to-1 chat, group conversations, community messaging, multimedia sharing, push notifications, and Agora audio/video calling support.",
          "Contributed to personalised feed behavior, background location functionality, username marketplace flows, and early-stage scalable product architecture.",
        ],
      },
      {
        name: "Healthhop",
        context: "Full-Stack Medical Platform",
        bullets: [
          "Developed a multi-role healthcare platform supporting providers, patients, and administrators through dashboards, payment workflows, and real-time communication.",
          "Integrated Stripe payments and escrow workflows, Socket.io notifications, API-connected dashboards, and deployment/domain configuration using AWS and GoDaddy.",
        ],
      },
      {
        name: "CareFeedback",
        context: "Web & Mobile Feedback Platform",
        bullets: [
          "Developed geofencing-based feedback workflows, automated location-triggered prompts, and real-time analytics dashboards for operational insight.",
        ],
      },
    ],
  },
  {
    fileBase: "02_Hasnat_Shabbir_Backend_Node_Resume",
    summary:
      '<strong>Backend-focused Software Engineer</strong> with <strong>5 years of experience</strong> building scalable APIs, cloud-deployed services, authentication systems, database-driven platforms, and SaaS backend workflows using <strong>Node.js, TypeScript, Express.js, NestJS, AWS, Docker, MongoDB, PostgreSQL, and SQL</strong>. Experienced with real-time systems, Socket.io/WebSockets, role-based access, query optimization, CI/CD, production troubleshooting, and backend integrations for high-volume web and mobile products.',
    skills: [
      ["Backend", "Node.js, TypeScript, Express.js, NestJS, REST APIs, GraphQL APIs, Socket.io, WebSockets, microservices, event-driven architecture"],
      ["Databases", "MongoDB, PostgreSQL, SQL, Mongoose, Sequelize, query optimization, data modelling"],
      ["Cloud & DevOps", "AWS, Elastic Beanstalk, EC2, S3, Lambda, Route 53, Docker, Docker Compose, CI/CD, AWS CodePipeline"],
      ["Security & API Quality", "JWT, OAuth 2.0, role-based access control, API security, Swagger/OpenAPI, debugging, production support"],
      ["Secondary", "React, Next.js, React Native, .NET API integration, SQL Server"],
    ],
    experience: [
      {
        company: "CabDespatch LTD",
        location: "Kent, England",
        title: "Software Engineer",
        date: "08/2024 - Present",
        bullets: [
          "Support backend APIs and database-driven taxi booking workflows across SaaS dispatch systems used by operator, customer, and driver applications.",
          "Integrate React and React Native clients with .NET backend APIs, SQL Server-backed services, ride booking flows, dispatch logic, and real-time operational updates.",
          "Contribute to multi-tenant SaaS architecture including client-specific configuration, zone-based access, booking rules, and reliable production behavior.",
          "Work on real-time socket/SignalR-style messaging for ride status synchronization, dispatch coordination, and live transport workflows.",
          "Manage Docker-based releases, AWS Elastic Beanstalk deployments, CI/CD pipelines, domain configuration, and production troubleshooting.",
        ],
      },
      {
        company: "Fabulous Technology Solutions",
        location: "Sialkot, Pakistan",
        title: "Software Engineer",
        date: "02/2022 - 08/2024",
        bullets: [
          "Built backend services using Node.js, Express.js, JavaScript, TypeScript, MongoDB, PostgreSQL, REST APIs, and authentication workflows.",
          "Improved API performance and maintainability through query optimization, cleaner service design, reusable backend patterns, and secure access control.",
          "Implemented integrations, role-based workflows, API documentation, and database-driven product features for production applications.",
          "Supported AWS and Docker deployments including Elastic Beanstalk, Amplify, containerized applications, and release troubleshooting.",
          "Promoted to Team Lead in 2024, supporting 10 developers with delivery planning, code review, and backend implementation quality.",
        ],
      },
      {
        company: "Logics Yard",
        location: "Lahore, Pakistan",
        title: "Associate Software Engineer",
        date: "07/2021 - 02/2022",
        bullets: [
          "Assisted with Node.js and Express.js backend development, REST API integration, server-side logic, and application debugging.",
          "Collaborated with frontend developers to connect React interfaces with backend services and maintain reliable application behavior.",
        ],
      },
    ],
    projects: [
      {
        name: "GPHTEST / Glacier Peak Holistics Test Platform",
        context: "Backend & Operations Platform",
        bullets: [
          "Led backend workflows for a production platform managing 50k+ test processes, including registrations, barcode operations, sample tracking, report generation, and result delivery.",
          "Built Express.js/MongoDB services for role-based access, report regeneration, barcode exports, technician workflows, analytics aggregation, and operational reporting.",
          "Implemented PDF generation, CSV/PDF exports, duplicate detection support, and database-backed analytics for high-volume business operations.",
        ],
      },
      {
        name: "Topics Chat",
        context: "Real-Time Communication Backend",
        bullets: [
          "Built scalable real-time messaging capabilities including 1-to-1 chat, group chats, community messaging, multimedia sharing, push notifications, and Socket.io/WebSocket workflows.",
          "Supported Agora audio/video integration and communication architecture for a startup platform with growth-focused product requirements.",
        ],
      },
      {
        name: "Healthhop",
        context: "Backend Integrations & Payments",
        bullets: [
          "Developed backend functionality for a multi-role healthcare platform with provider, patient, and admin workflows.",
          "Integrated Stripe payments, escrow transaction workflows, Socket.io notifications, messaging-related workflows, and AWS/domain deployment support.",
        ],
      },
    ],
  },
  {
    fileBase: "03_Hasnat_Shabbir_FullStack_DotNet_React_Resume",
    summary:
      '<strong>Full Stack Developer</strong> with <strong>5 years of experience</strong> building production business systems with a strong focus on <strong>.NET backend APIs, C#, ASP.NET Core/Web API, SQL Server, LINQ, Entity Framework-style data access, SignalR, React, JavaScript/TypeScript, AWS, Docker, IIS, and Windows Server deployment</strong>. Current UK experience is heavily focused on SaaS taxi dispatch systems, legacy and new .NET backend workflows, operator dashboards, SQL-backed booking logic, real-time dispatch messaging, and React interfaces, with lighter React Native mobile exposure.',
    skills: [
      ["Backend", "C#, .NET backend APIs, ASP.NET Core/Web API, SQL Server, LINQ queries, Entity Framework-style data access, REST APIs, authentication, authorization, legacy backend support"],
      ["Database", "SQL Server, relational data modelling, SQL queries, LINQ-to-database workflows, booking data, dispatch data, reporting workflows"],
      ["Real-Time & Integration", "SignalR, WebSockets, REST integrations, taxi dispatch messaging, ride status updates, API debugging, service-to-service workflows"],
      ["Frontend", "React, TypeScript, JavaScript, Next.js, Redux, HTML5, CSS, operator dashboards, responsive UI"],
      ["Cloud & Deployment", "AWS Elastic Beanstalk, Docker, CI/CD, domain configuration, Windows Server/IIS, Microsoft server deployment support"],
      ["Secondary Exposure", "React Native mobile API integration, Node.js/Express.js exposure, MongoDB, PostgreSQL"],
    ],
    experience: [
      {
        company: "CabDespatch LTD",
        location: "Kent, England",
        title: "Software Engineer",
        date: "08/2024 - Present",
        bullets: [
          "Develop and maintain .NET backend APIs and SQL Server-backed workflows for SaaS taxi booking, dispatch coordination, operator configuration, ride status, and production support.",
          "Work across legacy .NET backend projects and new backend systems, improving API behavior, booking logic, database access, and reliability for live taxi operators.",
          "Build and troubleshoot LINQ queries, SQL Server data access, authentication/authorization flows, and database-backed booking workflows for customer, driver, and operator journeys.",
          "Implement and support SignalR-based real-time messaging for taxi dispatch, ride status updates, driver communication, and live operational visibility.",
          "Deliver React operator dashboards integrated with .NET APIs for booking management, dispatch views, customer workflows, reporting, and administrative tools.",
          "Support AWS Elastic Beanstalk, Docker, CI/CD, domain configuration, Windows Server/IIS deployment, and Microsoft server-based backend releases.",
          "Maintain lighter React Native integrations where mobile apps consume .NET APIs for customer booking, driver jobs, and ride updates.",
        ],
      },
      {
        company: "Fabulous Technology Solutions",
        location: "Sialkot, Pakistan",
        title: "Software Engineer",
        date: "02/2022 - 08/2024",
        bullets: [
          "Built production React and Next.js applications using JavaScript, TypeScript, reusable components, dashboards, responsive UI, and API-integrated workflows.",
          "Developed React dashboards, data-driven screens, authentication flows, and reusable UI patterns for business platforms.",
          "Improved frontend maintainability through cleaner component structure, reusable patterns, and consistent implementation practices.",
          "Designed reusable components and patterns that reduced development effort by 50% across multiple projects.",
          "Promoted to Team Lead in 2024, supporting delivery, code review, and React implementation quality across a team of 10 developers.",
        ],
      },
      {
        company: "Logics Yard",
        location: "Lahore, Pakistan",
        title: "Associate Software Engineer",
        date: "07/2021 - 02/2022",
        bullets: [
          "Developed React components, responsive web pages, JavaScript UI features, and API-integrated screens for production web applications.",
          "Collaborated on debugging, troubleshooting, and code reviews to maintain reliable React application releases.",
        ],
      },
    ],
    projects: [
      {
        name: "CabDespatch Taxi Systems",
        context: "SaaS Dispatch, Booking & Mobile Platform",
        bullets: [
          "Worked on taxi booking and dispatch workflows spanning .NET APIs, SQL Server-backed services, LINQ query work, SignalR real-time messaging, React dashboards, and deployment support.",
          "Supported legacy .NET backend maintenance and new system features including ride status updates, zone-based access, operator workflows, customer booking, driver job logic, and Windows Server/IIS release support.",
        ],
      },
      {
        name: "CareFeedback",
        context: "Web & Mobile Feedback Platform",
        bullets: [
          "Developed web and mobile feedback workflows using location-aware automation, API-integrated screens, and real-time analytics dashboards.",
          "Built automated prompts triggered by geofencing activity to improve feedback timing, accuracy, and operational visibility.",
        ],
      },
      {
        name: "Healthhop",
        context: "Full-Stack Healthcare Platform",
        bullets: [
          "Built multi-role dashboards and backend-connected workflows for providers, patients, and admins.",
          "Integrated Stripe payments, escrow transactions, real-time notifications, messaging workflows, and deployment/domain configuration.",
        ],
      },
      {
        name: "GPHTEST / Glacier Peak Holistics Test Platform",
        context: "Full-Stack Operations Platform",
        bullets: [
          "Built React dashboards, backend workflows, role-based access, barcode/report operations, PDF delivery, analytics views, and high-volume operational reporting.",
        ],
      },
    ],
  },
  {
    fileBase: "04_Hasnat_Shabbir_Frontend_React_Resume",
    summary:
      '<strong>Frontend-focused Software Engineer</strong> with <strong>5 years of experience</strong> building responsive, scalable web applications using <strong>React, Next.js, TypeScript, JavaScript, Redux, HTML5, CSS, and modern UI practices</strong>. Experienced in production dashboards, SaaS interfaces, API-integrated applications, reusable components, real-time user interfaces, responsive layouts, performance-focused UI delivery, and clean maintainable frontend code.',
    skills: [
      ["Frontend", "React, Next.js, TypeScript, JavaScript, Redux, HTML5, CSS, Bootstrap, responsive design"],
      ["UI Engineering", "Reusable components, dashboards, SaaS interfaces, API integration, real-time UI, cross-browser interfaces"],
      ["Quality", "Debugging, frontend performance, maintainable code, usability, accessibility awareness, code reviews"],
      ["Backend Awareness", "REST APIs, GraphQL APIs, Node.js, .NET APIs, authentication flows, WebSockets"],
      ["Cloud Awareness", "AWS, Docker, CI/CD, production deployment support"],
    ],
    experience: [
      {
        company: "CabDespatch LTD",
        location: "Kent, England",
        title: "Software Engineer",
        date: "08/2024 - Present",
        bullets: [
          "Build and maintain React web dashboards for taxi operators, supporting booking workflows, dispatch visibility, ride management, and operator-facing SaaS tools.",
          "Integrate frontend applications with .NET backend APIs and SQL Server-backed workflows for booking, ride updates, dispatch coordination, and operational data.",
          "Develop responsive, production-ready UI features with attention to usability, performance, maintainability, and reliable release behavior.",
          "Support real-time interfaces for taxi system updates using socket/SignalR-driven status changes and live operational workflows.",
          "Collaborate with product and engineering teams to deliver customer, driver, and operator-facing features across web and mobile touchpoints.",
        ],
      },
      {
        company: "Fabulous Technology Solutions",
        location: "Sialkot, Pakistan",
        title: "Software Engineer",
        date: "02/2022 - 08/2024",
        bullets: [
          "Built frontend features for production web applications using React, Next.js, JavaScript, TypeScript, HTML, CSS, Redux, and API integrations.",
          "Developed reusable components and UI patterns that improved consistency and reduced development effort across multiple projects.",
          "Created responsive dashboards and customer-facing interfaces with a focus on clean UI implementation, maintainable code, and usability.",
          "Integrated frontend applications with REST/GraphQL APIs to support data-driven workflows, real-time features, and interactive product screens.",
          "Promoted to Team Lead in 2024, supporting delivery, code reviews, and frontend implementation quality across a team of 10 developers.",
        ],
      },
      {
        company: "Logics Yard",
        location: "Lahore, Pakistan",
        title: "Associate Software Engineer",
        date: "07/2021 - 02/2022",
        bullets: [
          "Developed responsive web pages and React components using HTML, CSS, JavaScript, and API integrations.",
          "Participated in debugging, troubleshooting, and code reviews to maintain frontend quality and reliable browser-based experiences.",
        ],
      },
    ],
    projects: [
      {
        name: "GPHTEST / Glacier Peak Holistics Test Platform",
        context: "React Dashboards & Analytics UI",
        bullets: [
          "Built multi-role React dashboards for admins, sub-admins, technicians, and customers to manage registrations, barcode operations, sample tracking, reports, and result delivery.",
          "Developed analytics interfaces covering workflow status, registration trends, geographic distribution, customer insights, flagged reviews, and operational reporting.",
          "Created report submission, report regeneration, barcode management, export workflows, and reusable UI patterns for a high-volume production platform.",
        ],
      },
      {
        name: "Healthhop",
        context: "Healthcare Dashboards",
        bullets: [
          "Built React-based dashboards and API-integrated workflows for providers, patients, and administrators.",
          "Supported user-facing interfaces connected to payment, notification, messaging, and account workflows.",
        ],
      },
      {
        name: "Topics Chat",
        context: "User-Facing Communication UI",
        bullets: [
          "Developed user-facing screens for messaging, multimedia sharing, personalised feed behavior, push notification flows, and communication workflows.",
          "Contributed to mobile-friendly interaction patterns for audio/video calling, communities, and social platform engagement.",
        ],
      },
    ],
  },
  {
    fileBase: "05_Hasnat_Shabbir_React_Native_Resume",
    summary:
      '<strong>React Native Software Engineer</strong> with <strong>5 years of software development experience</strong> specializing in cross-platform mobile applications, driver/customer apps, API-integrated mobile workflows, location-based features, payments, push notifications, real-time communication, and production mobile app support. Experienced with <strong>React Native, JavaScript/TypeScript, REST APIs, .NET APIs, SQL Server-backed workflows, React, AWS, and Docker</strong>.',
    skills: [
      ["Mobile", "React Native, Android/iOS, cross-platform development, mobile UI, driver/customer apps"],
      ["Mobile Features", "Maps/location, push notifications, payments, authentication, ride booking flows, driver job handling"],
      ["API Integration", "REST APIs, .NET APIs, Node.js APIs, JSON, error handling, real-time updates, Socket.io, SignalR"],
      ["Frontend", "React, JavaScript, TypeScript, Redux, responsive interfaces"],
      ["Backend/Cloud Awareness", "SQL Server, Node.js, AWS, Docker, CI/CD, production support"],
    ],
    experience: [
      {
        company: "CabDespatch LTD",
        location: "Kent, England",
        title: "Software Engineer",
        date: "08/2024 - Present",
        bullets: [
          "Develop and maintain React Native driver and customer mobile applications for SaaS-based taxi booking and dispatch platforms.",
          "Integrate mobile apps with .NET backend APIs and SQL Server-backed booking workflows for customer trips, driver jobs, ride status, and operator-managed dispatch.",
          "Build and support ride booking, driver job handling, customer trip flows, authentication, payment-related workflows, and production mobile app features.",
          "Implement real-time mobile updates using socket/SignalR-driven messaging for ride status, dispatch coordination, and live transport workflows.",
          "Work on mobile API debugging, release support, app reliability improvements, and integration with React operator dashboards and backend services.",
          "Support AWS, Docker, CI/CD, and deployment workflows that keep mobile-connected backend services stable in production.",
        ],
      },
      {
        company: "Fabulous Technology Solutions",
        location: "Sialkot, Pakistan",
        title: "Software Engineer",
        date: "02/2022 - 08/2024",
        bullets: [
          "Built web and mobile features using React Native, React, JavaScript, TypeScript, Node.js, Express.js, APIs, and database-backed workflows.",
          "Integrated mobile and frontend applications with APIs to deliver user-facing workflows, data-driven screens, real-time behavior, and communication features.",
          "Created reusable application components that improved consistency and reduced development effort across multiple projects.",
          "Worked on production debugging, API integration issues, app reliability, and maintainable delivery across mobile and web applications.",
          "Promoted to Team Lead in 2024, supporting feature delivery and implementation quality across a team of 10 developers.",
        ],
      },
      {
        company: "Logics Yard",
        location: "Lahore, Pakistan",
        title: "Associate Software Engineer",
        date: "07/2021 - 02/2022",
        bullets: [
          "Built React and JavaScript application components and integrated REST APIs for responsive user-facing workflows.",
          "Collaborated on debugging and troubleshooting across client and backend layers to improve application stability.",
        ],
      },
    ],
    projects: [
      {
        name: "Topics Chat",
        context: "Social Media Mobile Application",
        bullets: [
          "Built a feature-rich social media app with personal, group, community, and channel messaging supporting text, audio, video, file sharing, polls, and push notifications.",
          "Integrated Agora SDK for audio/video calls, including paid interaction flows for celebrity-style experiences.",
          "Implemented engagement features including paid content, personalised home feed, background location tracking, profile picture carousel, verified badges, and username marketplace workflows.",
        ],
      },
      {
        name: "CareFeedback",
        context: "Geofencing Web & Mobile Feedback App",
        bullets: [
          "Developed a geofencing-based feedback app that detects when users enter or exit client office locations and prompts timely feedback collection.",
          "Connected mobile automation workflows with real-time web dashboards so clients could review actionable feedback analytics and location-based insights.",
        ],
      },
      {
        name: "Survey Builder",
        context: "Custom Survey Web & Mobile App",
        bullets: [
          "Built a customizable survey management platform for web and mobile users with 15+ question types, publishing workflows, and response analysis.",
          "Implemented survey creation, publishing, management, and analytics screens for admins and end users.",
        ],
      },
      {
        name: "RollingAdz",
        context: "Vehicle Advertising Campaign App",
        bullets: [
          "Developed app workflows for vehicle-based ad campaigns where users select vehicles, enter campaign details, and launch advertising campaigns.",
          "Built driver, agency, and admin dashboard flows to manage campaign activity, vehicle information, and operational visibility.",
        ],
      },
      {
        name: "iSentCare",
        context: "Healthcare Staff & Shift Management App",
        bullets: [
          "Built healthcare workforce workflows for monitoring shifts, staff logins, payroll calculations, attendance/activity tracking, and operational management.",
          "Supported role-based access for staff and administrators managing healthcare operations and shift-related data.",
        ],
      },
      {
        name: "KDR App",
        context: "Car Selling Marketplace",
        bullets: [
          "Developed marketplace app workflows for car listings, vehicle details, user browsing, and seller/customer interactions similar to Autotrader-style platforms.",
          "Built mobile-friendly listing and vehicle information flows with API-connected data handling and user-facing screens.",
        ],
      },
      {
        name: "CabDespatch Driver & Customer Apps",
        context: "Taxi Booking & Dispatch Mobile Workflows",
        bullets: [
          "Built and supported mobile workflows for customer booking, driver job handling, ride updates, dispatch coordination, authentication, and API-connected production features.",
          "Integrated React Native apps with .NET APIs, SQL Server-backed services, socket/SignalR messaging, and deployment-supported backend systems.",
        ],
      },
      {
        name: "Healthhop",
        context: "Mobile-Connected Healthcare Workflows",
        bullets: [
          "Supported API-connected healthcare workflows with real-time notifications, messaging, payment integration, role-based dashboards, and multi-platform setup.",
        ],
      },
    ],
  },
];

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderSummary(summary) {
  return `
<section>
  <h2>Summary</h2>
  <p>${summary}</p>
  <p><strong>Work Authorization:</strong> ${escapeHtml(workAuthorization)}</p>
</section>`;
}

function renderSkills(skills) {
  return `
<section>
  <h2>Skills</h2>
  ${skills.map(([title, items]) => `<p><strong>${escapeHtml(title)}:</strong> ${escapeHtml(items)}</p>`).join("\n  ")}
</section>`;
}

function renderExperience(experience) {
  return `
<section>
  <h2>Experience</h2>
  ${experience
    .map(
      (job) => `<div class="entry">
  <h3>${escapeHtml(job.company)} | ${escapeHtml(job.location)}</h3>
  <p><strong>${escapeHtml(job.title)} | ${escapeHtml(job.date)}</strong></p>
  <ul>
    ${job.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("\n    ")}
  </ul>
</div>`
    )
    .join("\n  ")}
</section>`;
}

function renderProjects(projects) {
  return `
<section>
  <h2>Projects</h2>
  ${projects
    .map(
      (project) => `<div class="entry">
  <h3>${escapeHtml(project.name)} | ${escapeHtml(project.context)}</h3>
  <ul>
    ${project.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("\n    ")}
  </ul>
</div>`
    )
    .join("\n  ")}
</section>`;
}

function renderEducation() {
  return `
<section>
  <h2>Education</h2>
  ${education
    .map(
      (item) => `<div class="entry">
  <h3>${escapeHtml(item.school)} | ${escapeHtml(item.location)}</h3>
  <p>${escapeHtml(item.degree)} | ${escapeHtml(item.date)}</p>
</div>`
    )
    .join("\n  ")}
</section>`;
}

function renderResumeBody(resume) {
  return [
    renderSummary(resume.summary),
    renderSkills(resume.skills),
    renderExperience(resume.experience),
    renderProjects(resume.projects),
    renderEducation(),
  ].join("\n");
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const resume of resumes) {
    const body = renderResumeBody(resume);
    const html = buildResumeDocument(body);
    const htmlPath = path.join(OUTPUT_DIR, `${resume.fileBase}.html`);
    const pdfPath = path.join(OUTPUT_DIR, `${resume.fileBase}.pdf`);

    fs.writeFileSync(htmlPath, html, "utf8");
    await generatePDF(body, pdfPath);
    console.log(`Generated ${pdfPath}`);
  }
}

main().catch((error) => {
  console.error("Focused resume generation failed:", error);
  process.exit(1);
});
