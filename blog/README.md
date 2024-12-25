# Building Resume Creator Using Multi-agent AI System

![cover](images/joao-ferrao-4YzrcDNcRVg-unsplash.jpg)

Photo by <a href="https://unsplash.com/@joaofferrao?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">João Ferrão</a> on <a href="https://unsplash.com/photos/white-printer-paper-on-macbook-pro-4YzrcDNcRVg?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

In this blog, we will build an AI-powered resume creation system that automates the tedious and time-consuming tasks involved in manual resume creation. By leveraging multi-agent AI systems, we will streamline the process of information gathering, and content writing to produce resumes with minimal human intervention.

## Limitations of Manual Resume Processing

### Inefficient Information Gathering

The manual process of collecting and organizing information is time-consuming and requires significant effort.

### Inconsistent Formatting

Manual resume creation often leads to formatting inconsistencies. The process requires manual adjustments to maintain professional formatting standards, which can be error-prone and time-consuming.

### Content Writing and Rewriting Challenges

The manual process requires significant effort in crafting and editing content. Writing compelling and well-structured content by hand is labor-intensive, requiring multiple revisions and edits.

## Automating Resume Creation using AI

Creating a resume manually involves several steps:

1. **Information Gathering**: Collecting and organizing your personal details, job history, skills, and education.
2. **Formatting**: Ensuring the resume looks attractive and professional, often without clear guidelines.
3. **Content Writing**: Crafting and refining content to make it concise, compelling, and relevant.
4. **Proofreading and Editing**: Checking for errors and polishing the resume to a professional standard.

With the AI system, we can automate these steps using multi-agent systems. Each agent performs a specific task, such as extracting information, generating content, or formatting the resume. By coordinating these agents, we can create a fully automated resume creation system.

## How it Works?

In this blog, we automate the **information gathering** and **content writing** for the resume, tasks that are usually manual and time-consuming.

This system diagram illustrates the resume creation process discussed in this blog, showcasing the collaboration between two main AI agents:

![agent diagram](images/ai-agents-diagram.png)

Here's a brief description:

- The system starts with **User Input** and requires an environment setup that includes **Team Initialization** and **OpenAI API Key**.

- Two AI agents work together:
  - **Profile Analyst (Agent AI 1)**: Handles data extraction from user input, breaking down information into categories like **Name**, **Experience**, **Skills**, **Education**, and **Job History**.
  - **Resume Writer (Agent AI 2)**: Takes the structured information and handles the writing aspect.

- The workflow follows these key steps:
  - **Data Extraction**: Organizes raw user input into. structured categories. This the information gathering step.
  - **Structured Information**: Stores the organized data into the GridDB Cloud database.
  - **Resume Crafting**: Combines the structured data with writing capabilities. This the content writing step.
  - **Create Resume**: Generates the content.
  - **Final Resume**: Produces the completed document.

## User Interface

![user interface](images/resume-creator.png)
