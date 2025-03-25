import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// This is a placeholder for the LLaMA API endpoint
// You would replace this with your actual LLaMA implementation via Groq
const LLAMA_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const LLAMA_API_KEY = "your-groq-api-key"; // Replace with your actual API key

interface JobDescriptionRequest {
  jobTitle: string;
  seniority: string;
  employmentType: string;
  remoteOption: string;
  section: string;
  tone: string;
  currentContent?: string;
  teamSize?: string;
  reportingTo?: string;
  tools?: string;
  action?: "generate" | "enhance" | "rewrite";
  model?: string;
}

serve(async (req) => {
  // Handle preflight CORS request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Parse the request body
    const requestData: JobDescriptionRequest = await req.json();
    
    // Build a contextual message for the AI based on the request data
    const message = buildPrompt(requestData);

    // For demo purposes, we're mocking the response
    // In a real implementation, you would call the Groq API for LLaMA
    try {
      // Call the Groq API with LLaMA 3 model
      const groqResponse = await fetch(LLAMA_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${LLAMA_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are a professional job description writer. Create clear, concise, and effective job descriptions."
            },
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!groqResponse.ok) {
        throw new Error(`Groq API error: ${groqResponse.status} ${await groqResponse.text()}`);
      }

      const groqData = await groqResponse.json();
      const content = groqData.choices[0].message.content;

      return new Response(
        JSON.stringify({
          success: true,
          content: content,
          raw: groqData
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    } catch (error) {
      console.error("Error calling Groq:", error);

      // For demo/development purposes, return a mock response
      // In production, you would handle this error differently
      const mockContent = generateMockResponse(requestData);
      
      return new Response(
        JSON.stringify({
          success: true,
          content: mockContent,
          raw: { mock: true, error: error.message }
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
    
  } catch (error) {
    console.error("Error in edge function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});

function buildPrompt(data: JobDescriptionRequest): string {
  const { 
    jobTitle, 
    seniority, 
    employmentType, 
    remoteOption, 
    section, 
    tone, 
    currentContent, 
    teamSize, 
    reportingTo, 
    tools,
    action = "generate"
  } = data;

  // Build contextual information about the job
  let contextParts = [
    `Job Title: ${jobTitle}`,
    `Seniority: ${seniority}`,
    `Employment Type: ${employmentType}`,
    `Work Location: ${remoteOption}`,
  ];

  // Add optional information if provided
  if (teamSize) contextParts.push(`Team Size: ${teamSize}`);
  if (reportingTo) contextParts.push(`Reports To: ${reportingTo}`);
  if (tools) contextParts.push(`Tools & Technologies: ${tools}`);

  const context = contextParts.join("\n");

  // Map section name to a more readable format
  const sectionMap: Record<string, string> = {
    summary: "Role Summary",
    responsibilities: "Key Responsibilities",
    requiredQualifications: "Required Qualifications",
    preferredQualifications: "Preferred Qualifications",
    benefits: "Benefits & Perks",
    companyBlurb: "Company Description"
  };

  const sectionName = sectionMap[section] || section;

  // Build different prompts based on the action
  let prompt = "";
  switch (action) {
    case "generate":
      prompt = `Please write a concise and effective ${sectionName} section for a job description with the following details:\n\n${context}\n\nThe content should have a ${tone.toLowerCase()} tone. Focus on clarity and directness, as you're using LLaMA 3.3 70B for fast, efficient content generation.`;
      break;
    case "enhance":
      prompt = `Please enhance the following ${sectionName} section to make it more effective while keeping a ${tone.toLowerCase()} tone. Focus on clarity and directness, as you're using LLaMA 3.3 70B:\n\n${context}\n\nCurrent content:\n${currentContent}`;
      break;
    case "rewrite":
      prompt = `Please rewrite the following ${sectionName} section with a ${tone.toLowerCase()} tone, maintaining the same information but improving clarity. Keep it straightforward and direct, as you're using LLaMA 3.3 70B:\n\n${context}\n\nCurrent content:\n${currentContent}`;
      break;
    default:
      prompt = `Please write a concise and effective ${sectionName} section for a job description with the following details:\n\n${context}\n\nThe content should have a ${tone.toLowerCase()} tone. Make it clear, direct, and easy to understand, as you're using LLaMA 3.3 70B.`;
  }

  return prompt;
}

// This is a mock function for demonstration purposes only
function generateMockResponse(data: JobDescriptionRequest): string {
  const { jobTitle, seniority, section, tone } = data;
  
  const mockResponses: Record<string, string[]> = {
    summary: [
      `We're seeking a ${seniority} ${jobTitle} to join our team. In this role, you'll develop solutions, collaborate with team members, and drive results. You'll need to balance analytical thinking with practical implementation to deliver on our business objectives.`,
      `Join our company as a ${seniority} ${jobTitle}. You'll work on challenging projects, contribute to team success, and grow your skills. This position requires strong expertise in the field and the ability to adapt to changing priorities.`
    ],
    responsibilities: [
      `• Develop and implement strategies for ${jobTitle} projects\n• Collaborate with cross-functional teams to achieve objectives\n• Analyze data to inform decision-making\n• Create documentation and reports\n• Manage resources effectively\n• Meet deadlines and quality standards`,
      `• Lead key initiatives in the ${jobTitle} domain\n• Solve complex problems using analytical approaches\n• Communicate with stakeholders about project status\n• Optimize processes for efficiency\n• Ensure compliance with standards and requirements`
    ],
    requiredQualifications: [
      `• ${seniority === 'Senior' ? '5+' : seniority === 'Mid-Level' ? '2-4' : '1-2'} years of experience in ${jobTitle.toLowerCase()} role\n• Bachelor's degree in relevant field\n• Proficiency with industry tools and software\n• Strong problem-solving abilities\n• Excellent communication skills\n• Ability to work independently and in teams`,
      `• Demonstrated experience in ${jobTitle.toLowerCase()} functions\n• Knowledge of industry best practices\n• Technical skills relevant to the position\n• Organizational and time management abilities\n• Adaptability to changing priorities`
    ],
    preferredQualifications: [
      `• Advanced degree or certifications\n• Experience with specific technologies in our stack\n• Knowledge of our industry\n• Project management experience\n• Leadership abilities\n• Experience working in similar company environments`,
      `• Additional specialized training\n• Track record of continuous learning\n• Experience with agile methodologies\n• Background in related disciplines\n• History of successful project completion`
    ],
    benefits: [
      `• Competitive salary\n• Health insurance\n• Retirement plan\n• Paid time off\n• Professional development opportunities\n• Flexible work arrangements\n• Team events`,
      `• Comprehensive benefits package\n• Performance bonuses\n• Career advancement paths\n• Work-life balance\n• Collaborative environment\n• Learning resources`
    ],
    companyBlurb: [
      `Our company delivers high-quality solutions to meet customer needs. We value efficiency, results, and teamwork. Join us to be part of a team that focuses on practical outcomes and continuous improvement.`,
      `We're a results-oriented organization committed to excellence. Our team works collaboratively to solve problems and deliver value. We offer a supportive environment where employees can develop their skills and contribute to our success.`
    ]
  };
  
  // Get the mock responses for the requested section
  const responsesForSection = mockResponses[section] || mockResponses.summary;
  
  // Select a random response
  const randomIndex = Math.floor(Math.random() * responsesForSection.length);
  const response = responsesForSection[randomIndex];
  
  // Add a LLaMA-specific touch for efficiency
  const llamaPrefix = `[Generated with LLaMA 3.3 70B for efficiency and clarity]\n\n`;
  
  return response;
}