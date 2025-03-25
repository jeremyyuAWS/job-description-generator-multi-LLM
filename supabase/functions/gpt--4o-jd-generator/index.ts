import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// GPT-4o endpoint configuration using Lyzr AI
const LYZR_API_URL = "https://agent-dev.test.studio.lyzr.ai/v3/inference/chat/";
const LYZR_API_KEY = "sk-default-4oGju1PuWIBzOtgXrltS75fxTPO1AjEr";
const GPT4O_AGENT_ID = "67df490b8f451bb9b9b6cc8b";

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
  additionalContext?: string;
  user_id?: string;
  agent_id?: string;
  session_id?: string;
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

    // Parse the request body directly
    const requestData: JobDescriptionRequest = await req.json();
    
    if (!requestData.jobTitle) {
      return new Response(
        JSON.stringify({ error: "Job title is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Build the message text for the AI
    const messageText = buildPrompt(requestData);
    
    // Use the agent ID from the request or default to GPT-4o's agent ID
    const userId = requestData.user_id || "hirewrite@app.com";
    const agentId = requestData.agent_id || GPT4O_AGENT_ID;
    const sessionId = requestData.session_id || agentId;
    
    // Create the request body with the message field
    // CRITICAL: message must be a string and at the top level
    const lyzrRequestBody = {
      user_id: userId,
      agent_id: agentId,
      session_id: sessionId,
      message: messageText
    };
    
    console.log("GPT-4o: Request structure:", JSON.stringify({
      keys: Object.keys(lyzrRequestBody),
      messageType: typeof lyzrRequestBody.message,
      messageLength: lyzrRequestBody.message?.length || 0
    }));

    // Call the Lyzr API with the request
    const lyzrResponse = await fetch(LYZR_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": LYZR_API_KEY,
      },
      body: JSON.stringify(lyzrRequestBody)
    });

    // Handle API errors
    if (!lyzrResponse.ok) {
      const errorText = await lyzrResponse.text();
      console.error(`GPT-4o: Lyzr API error (${lyzrResponse.status}):`, errorText);
      
      return new Response(
        JSON.stringify({ error: "Error from GPT-4o service", details: errorText }),
        {
          status: lyzrResponse.status,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Parse and return the successful response
    const lyzrData = await lyzrResponse.json();
    
    return new Response(
      JSON.stringify({
        success: true,
        content: lyzrData.response || lyzrData.message,
        raw: lyzrData,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("GPT-4o: Error in edge function:", error.message);
    console.error("GPT-4o: Stack trace:", error.stack);
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
    currentContent = "", 
    teamSize = "", 
    reportingTo = "", 
    tools = "",
    action = "generate",
    additionalContext = ""
  } = data;

  if (!jobTitle) {
    return "Please provide a job title to generate content.";
  }

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

  // Add GPT-4o-specific instructions to leverage its strengths
  let modelSpecificInstructions = "";
  
  if (section === "summary") {
    modelSpecificInstructions = `
You are GPT-4o, known for your creative and nuanced writing with engaging language. For this role summary:
- Create an engaging, attention-grabbing opening
- Use vivid language that brings the role to life
- Balance creativity with professionalism
- Incorporate nuanced descriptions that highlight both tangible and intangible aspects of the role
- Include compelling reasons why someone would want this position
- Keep it concise but impactful`;
  } else if (section === "responsibilities") {
    modelSpecificInstructions = `
For the Key Responsibilities section, use your strengths as GPT-4o to:
- Create clear, action-oriented bullet points
- Use strong, dynamic verbs at the beginning of each point
- Provide a balanced mix of day-to-day tasks and strategic responsibilities
- Emphasize both the what and the why behind each responsibility
- Make the impact of the role clear through your descriptions`;
  } else if (section === "requiredQualifications") {
    modelSpecificInstructions = `
For the Required Qualifications section, use your strengths as GPT-4o to:
- Create a clear, focused list of essential qualifications
- Differentiate between truly required skills and those that are preferred
- Ensure qualifications are specific and measurable where possible
- Focus on outcomes and capabilities rather than just years of experience
- Make the list comprehensive but not overwhelming`;
  } else if (section === "preferredQualifications") {
    modelSpecificInstructions = `
For the Preferred Qualifications section, use your strengths as GPT-4o to:
- Create a concise list of bonus skills and experiences
- Highlight qualifications that would help someone excel in the role
- Include both technical and soft skills that complement the required qualifications
- Make these attractive without being discouraging to candidates
- Keep the list reasonable in length and scope`;
  } else if (section === "benefits") {
    modelSpecificInstructions = `
For the Benefits & Perks section, use your strengths as GPT-4o to:
- Create an engaging list of employee benefits
- Highlight both tangible (compensation, insurance) and intangible (culture, growth) benefits
- Use compelling language that showcases your company's value proposition
- Structure benefits in a clear, scannable format
- Focus on what makes your company unique as an employer`;
  } else if (section === "companyBlurb") {
    modelSpecificInstructions = `
For the Company Description section, use your strengths as GPT-4o to:
- Create an engaging and authentic company narrative
- Highlight what makes the company unique and appealing to candidates
- Balance professionalism with personality
- Articulate company values, mission, and culture in a compelling way
- Keep it concise but impactful, focusing on what matters most to potential candidates`;
  }

  // Process any additional context provided
  let additionalPrompt = "";
  if (additionalContext) {
    additionalPrompt = `\n\nAdditional instructions: ${additionalContext}`;
  }

  // Build different prompts based on the action
  let prompt = "";
  switch (action) {
    case "generate":
      prompt = `Please write a professional ${sectionName} section for a job description with the following details:\n\n${context}\n\nThe content should have a ${tone.toLowerCase()} tone. Note that you're using GPT-4o for this generation, so provide a creative and nuanced response. ${modelSpecificInstructions}${additionalPrompt}`;
      break;
    case "enhance":
      prompt = `Please enhance the following ${sectionName} section to make it more compelling and detailed, while keeping a ${tone.toLowerCase()} tone. Make the content more creative and polished, as you're using GPT-4o:\n\n${context}\n\nCurrent content:\n${currentContent}\n\n${modelSpecificInstructions}${additionalPrompt}`;
      break;
    case "rewrite":
      prompt = `Please rewrite the following ${sectionName} section with a ${tone.toLowerCase()} tone, maintaining the same information but improving the presentation. Add your creative flair as GPT-4o:\n\n${context}\n\nCurrent content:\n${currentContent}\n\n${modelSpecificInstructions}${additionalPrompt}`;
      break;
    default:
      prompt = `Please write a professional ${sectionName} section for a job description with the following details:\n\n${context}\n\nThe content should have a ${tone.toLowerCase()} tone. Show your capability for nuance and creativity as GPT-4o. ${modelSpecificInstructions}${additionalPrompt}`;
  }

  return prompt;
}