import { Agent, Task, Team } from 'kaibanjs';

const bioDefault = `
My name is Alex Navarro.
Go Developer for 6 years.
I worked for four years at Stripe, where I built scalable back-end microservices for their payment processing platform, focusing on distributed systems and API development using Go. Before Stripe, I was a Back-End Engineer at DigitalOcean, where I developed internal tools and improved the performance of customer-facing APIs.

Portfolio:
1. Real-Time Event Streaming Platform - Developed a real-time event streaming service using Kafka and Go, processing millions of events daily.
2. Cloud Cost Optimization Tool - Built a Go-based CLI for analyzing and reducing cloud infrastructure costs.
3. E-commerce Platform API - Designed and implemented RESTful APIs for a high-traffic online marketplace with Go and PostgreSQL.
4. Load Balancer for Microservices - Created a custom lightweight load balancer with Go to manage high-availability and request distribution.
5. CI/CD Pipeline Optimizer - Automated CI/CD workflows with Go-based scripts, reducing deployment times by 40%.

I earned a Bachelor of Science in Computer Science from UC Berkeley in 2017 and have been actively contributing to the open-source Go community.
`;

// Define agents
const profileAnalyst = new Agent({
  name: 'Zoe',
  role: 'Profile Analyst',
  goal: 'Extract structured information from conversational user input.',
  background: 'Data Processor',
  tools: []  // Tools are omitted for now
});

const resumeWriter = new Agent({
  name: 'Alex Mercer',
  role: 'Resume Writer',
  goal: `Craft compelling, well-structured resumes 
    that effectively showcase job seekers qualifications and achievements.`,
  background: `Extensive experience in recruiting, 
    copywriting, and human resources, enabling 
    effective resume design that stands out to employers.`,
  tools: []
});

// Define tasks
const processingTask = new Task({
  description: `Extract relevant details such as name, 
  experience, skills, and job history from the user's 'aboutMe' input. 
  aboutMe: {aboutMe}`,
  expectedOutput: 'Structured data ready to be used for a resume creation.',
  agent: profileAnalyst
});

const resumeCreationTask = new Task({
  description: `Utilize the structured data to create 
    a detailed and attractive resume. 
    Enrich the resume content by inferring additional details from the provided information.
    Include sections such as a personal summary, detailed work experience, skills, and educational background.`,
  expectedOutput: `A professionally formatted resume in raw markdown format, 
    ready for submission to potential employers.`,
  agent: resumeWriter
});

// Create a team
const team = new Team({
  name: 'Resume Creation Team',
  agents: [profileAnalyst, resumeWriter],
  tasks: [processingTask, resumeCreationTask],
  inputs: { aboutMe: bioDefault },
  env: { OPENAI_API_KEY: process.env.OPENAI_API_KEY }
});

export { team as TeamResumeAgent, bioDefault };

/******************************************************************
 *                                                                  *
 *        🚀 Ready to supercharge your JavaScript AI Agents? 🚀    *
 *                                                                *
 * This is just a starting point, but if you're ready to flex:     *
 *                                                                *
 *   💡 Build a custom UI and control your agents like a boss.     *
 *   🛠️ Equip your agents with tools (APIs, databases—you name it).*
 *   🧠 Integrate different AI models (OpenAI, Anthropic, etc.).   *
 *   🔮 Create setups so advanced, even you'll be impressed.       *
 *                                                                *
 * JavaScript AI Agents are here to stay!                       *
 *                                                                *
 * Head to https://kaibanjs.com                                *
 * 
 * PS: It's way cooler than this basic example. 😎                 *
 *                                                                *
 ******************************************************************/
