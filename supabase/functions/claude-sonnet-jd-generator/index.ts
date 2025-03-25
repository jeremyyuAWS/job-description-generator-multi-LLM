import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * Claude Sonnet JD Generator Edge Function
 * 
 * This Edge function handles job description generation, enhancement, and rewriting
 * using Claude Sonnet via the Lyzr AI platform.
 */

// Claude Sonnet endpoint configuration using Lyzr AI
const LYZR_API_URL = "https://agent-dev.test.studio.lyzr.ai/v3/inference/chat/";
const LYZR_API_KEY = Deno.env.get("LYZR_API_KEY") || ""; // Get API key from environment variable
const CLAUDE_AGENT_ID = "67df369d8f451bb9b9b6cbe2"; // Claude Sonnet agent ID

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

// Standard CORS headers for all responses
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json"
};

// Handle CORS preflight requests
function handleCorsPreflightRequest() {
  return new Response(null, {
    headers: CORS_HEADERS
  });
}

// Create standardized error response
function createErrorResponse(message: string, status: number, details?: string) {
  const errorBody = { error: message };
  if (details) errorBody["details"] = details;
  
  return new Response(JSON.stringify(errorBody), {
    status,
    headers: CORS_HEADERS
  });
}

serve(async (req) => {
  // Handle preflight CORS request
  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest();
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return createErrorResponse("Method not allowed", 405);
    }
    
    // Verify API key is available
    if (!LYZR_API_KEY) {
      return createErrorResponse("API key configuration error", 500);
    }

    // Parse the request body directly
    const requestData: JobDescriptionRequest = await req.json();
    
    if (!requestData.jobTitle) {
      return createErrorResponse("Job title is required", 400);
    }

    // Build the message text for the AI
    const messageText = buildPrompt(requestData);
    
    // Use the agent ID from the request or default to Claude's agent ID
    const userId = requestData.user_id || "hirewrite@app.com";
    const agentId = requestData.agent_id || CLAUDE_AGENT_ID;
    const sessionId = requestData.session_id || agentId;
    
    // Create the request body with the message field
    // CRITICAL: message must be a string and at the top level
    const lyzrRequestBody = {
      user_id: userId,
      agent_id: agentId,
      session_id: sessionId,
      message: messageText
    };
    
    // Only log in development or when debugging is needed
    // console.log("Claude: Request structure:", JSON.stringify({
    //   keys: Object.keys(lyzrRequestBody),
    //   messageType: typeof lyzrRequestBody.message,
    //   messageLength: lyzrRequestBody.message?.length || 0
    // }));

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
      console.error(`Claude: Lyzr API error (${lyzrResponse.status}):`, errorText);
      
      return createErrorResponse("Error from Claude Sonnet service", lyzrResponse.status, errorText);
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
        headers: CORS_HEADERS
      }
    );
  } catch (error) {
    // Log critical errors
    console.error("Claude: Error in edge function:", error.message);
    
    return createErrorResponse("Internal server error", 500, error.message);
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

  // Add Claude-specific instructions to leverage its strengths
  let modelSpecificInstructions = "";
  
  if (section === "summary") {
    modelSpecificInstructions = `
You are Claude, known for your structured, professional writing style with clear organization. For this role summary:
- Create a well-structured summary with clear paragraphs
- Use professional language that flows naturally
- Maintain consistent tone throughout
- Focus on clarity and precision in your descriptions
- Organize information in a logical sequence
- Avoid excessive jargon but include relevant industry terms`;
  } else if (section === "responsibilities") {
    modelSpecificInstructions = `
For the Key Responsibilities section, use your strengths as Claude to:
- Create a well-structured, clearly organized list of duties
- Use precise, professional language for each responsibility
- Organize duties in a logical progression from core to specialized tasks
- Ensure clarity and consistency in format and language
- Balance detail with readability`;
  } else if (section === "requiredQualifications") {
    modelSpecificInstructions = `
For the Required Qualifications section, use your strengths as Claude to:
- Create a structured, prioritized list of required skills and experiences
- Use clear, precise language for each qualification
- Structure the list in logical categories if appropriate
- Be specific about requirements while avoiding unnecessary jargon
- Focus on essential, measurable qualifications`;
  } else if (section === "preferredQualifications") {
    modelSpecificInstructions = `
For the Preferred Qualifications section, use your strengths as Claude to:
- Create an organized, clear list of additional desirable qualities
- Distinguish these appropriately from the required qualifications
- Present them in a logical, structured manner
- Use precise language that communicates their value
- Avoid making the list overwhelming or discouraging`;
  } else if (section === "benefits") {
    modelSpecificInstructions = `
For the Benefits & Perks section, use your strengths as Claude to:
- Create a well-structured, comprehensive list of benefits
- Organize benefits into logical categories
- Use clear, professional language to describe each benefit
- Present information in a clean, scannable format
- Ensure the benefits are described with appropriate detail`;
  } else if (section === "companyBlurb") {
    modelSpecificInstructions = `
For the Company Description section, use your strengths as Claude to:
- Create a well-structured, professional company description
- Present information in a logical, organized manner
- Use clear, precise language that communicates company values effectively
- Balance formality with approachability
- Ensure the description is comprehensive yet concise`;
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
      prompt = `Please write a professional ${sectionName} section for a job description with the following details:\n\n${context}\n\nThe content should have a ${tone.toLowerCase()} tone. ${modelSpecificInstructions}${additionalPrompt}`;
      break;
    case "enhance":
      prompt = `Please enhance the following ${sectionName} section to make it more compelling and detailed, while keeping a ${tone.toLowerCase()} tone. Provide well-structured and clear improvements:\n\n${context}\n\nCurrent content:\n${currentContent}\n\n${modelSpecificInstructions}${additionalPrompt}`;
      break;
    case "rewrite":
      prompt = `Please rewrite the following ${sectionName} section with a ${tone.toLowerCase()} tone, maintaining the same information but improving the presentation. Focus on clarity and structure:\n\n${context}\n\nCurrent content:\n${currentContent}\n\n${modelSpecificInstructions}${additionalPrompt}`;
      break;
    default:
      prompt = `Please write a professional ${sectionName} section for a job description with the following details:\n\n${context}\n\nThe content should have a ${tone.toLowerCase()} tone. Provide well-structured content with a human-like writing style. ${modelSpecificInstructions}${additionalPrompt}`;
  }

  return prompt;
}
