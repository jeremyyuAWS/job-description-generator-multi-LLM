import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LYZR_API_URL = "https://agent-dev.test.studio.lyzr.ai/v3/inference/chat/";
const LYZR_API_KEY = "sk-default-4oGju1PuWIBzOtgXrltS75fxTPO1AjEr";

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

    // Call the Lyzr API
    const lyzrResponse = await fetch(LYZR_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": LYZR_API_KEY,
      },
      body: JSON.stringify({
        user_id: "hirewrite@app.com",
        agent_id: "67df369d8f451bb9b9b6cbe2",
        session_id: "67df369d8f451bb9b9b6cbe2",
        message: message,
      }),
    });

    // Handle API errors
    if (!lyzrResponse.ok) {
      const errorText = await lyzrResponse.text();
      console.error("Lyzr API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Error from AI service", details: errorText }),
        {
          status: lyzrResponse.status,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Parse and return the response
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
      prompt = `Please write a professional ${sectionName} section for a job description with the following details:\n\n${context}\n\nThe content should have a ${tone.toLowerCase()} tone.`;
      break;
    case "enhance":
      prompt = `Please enhance the following ${sectionName} section to make it more compelling and detailed, while keeping a ${tone.toLowerCase()} tone:\n\n${context}\n\nCurrent content:\n${currentContent}`;
      break;
    case "rewrite":
      prompt = `Please rewrite the following ${sectionName} section with a ${tone.toLowerCase()} tone, maintaining the same information but improving the presentation:\n\n${context}\n\nCurrent content:\n${currentContent}`;
      break;
    default:
      prompt = `Please write a professional ${sectionName} section for a job description with the following details:\n\n${context}\n\nThe content should have a ${tone.toLowerCase()} tone.`;
  }

  return prompt;
}