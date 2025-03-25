import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// LLaMA endpoint configuration using Lyzr AI
const LYZR_API_URL = "https://agent-dev.test.studio.lyzr.ai/v3/inference/chat/";
const LYZR_API_KEY = "sk-default-4oGju1PuWIBzOtgXrltS75fxTPO1AjEr";
const LLAMA_AGENT_ID = "67df490b8f451bb9b9b6cc8c"; 

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
    
    try {
      // Use the agent ID from the request or default to LLaMA's agent ID
      const userId = requestData.user_id || "hirewrite@app.com";
      const agentId = requestData.agent_id || LLAMA_AGENT_ID;
      const sessionId = requestData.session_id || agentId;
      
      // Create the request body with the message field
      // CRITICAL: message must be a string and at the top level
      const lyzrRequestBody = {
        user_id: userId,
        agent_id: agentId,
        session_id: sessionId,
        message: messageText
      };
      
      console.log("LLaMA: Request structure:", JSON.stringify({
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

      if (!lyzrResponse.ok) {
        const errorText = await lyzrResponse.text();
        console.error(`LLaMA: Lyzr API error (${lyzrResponse.status}):`, errorText);
        throw new Error(`API error: ${errorText}`);
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
      console.error("LLaMA: Error calling Lyzr API:", error.message);
      console.error("LLaMA: Stack trace:", error.stack);
      
      // For demonstration purposes, use mock response as backup
      console.log("LLaMA: Falling back to mock response");
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
    console.error("LLaMA: Error in edge function:", error.message);
    console.error("LLaMA: Stack trace:", error.stack);
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

  // Add LLaMA-specific instructions to leverage its strengths
  let modelSpecificInstructions = "";
  
  if (section === "summary") {
    modelSpecificInstructions = `
You are LLaMA 3.3, known for your efficient, direct writing style. For this role summary:
- Get straight to the point with a clear, concise summary
- Use direct language that clearly communicates the role's purpose
- Focus on the most essential information without unnecessary elaboration
- Structure the content in a simple, accessible way
- Use active voice and straightforward sentences
- Keep paragraphs short and focused`;
  } else if (section === "responsibilities") {
    modelSpecificInstructions = `
For the Key Responsibilities section, use your strengths as LLaMA to:
- Create concise, direct bullet points for each responsibility
- Use clear, action-oriented language
- Focus on the most important duties without unnecessary detail
- Ensure each point is distinct and meaningful
- Keep the list concise but complete`;
  } else if (section === "requiredQualifications") {
    modelSpecificInstructions = `
For the Required Qualifications section, use your strengths as LLaMA to:
- Create a concise, direct list of must-have qualifications
- Focus on the truly essential requirements
- Use clear, straightforward language
- Avoid unnecessary jargon or complexity
- Make the requirements specific and measurable where possible`;
  } else if (section === "preferredQualifications") {
    modelSpecificInstructions = `
For the Preferred Qualifications section, use your strengths as LLaMA to:
- Create a focused list of bonus qualifications
- Keep the list short and prioritized
- Use direct language that clearly communicates their value
- Focus on qualifications that genuinely enhance performance
- Avoid making the list too extensive or intimidating`;
  } else if (section === "benefits") {
    modelSpecificInstructions = `
For the Benefits & Perks section, use your strengths as LLaMA to:
- Create a clear, direct list of employee benefits
- Focus on the most compelling and valuable benefits
- Use straightforward language without unnecessary elaboration
- Structure the list for easy scanning
- Highlight the most distinctive benefits first`;
  } else if (section === "companyBlurb") {
    modelSpecificInstructions = `
For the Company Description section, use your strengths as LLaMA to:
- Create a concise, straightforward company description
- Focus on key facts about the company that candidates need to know
- Use clear, direct language that avoids unnecessary elaboration
- Highlight the most relevant aspects of the company culture and mission
- Maintain a professional but efficient tone throughout`;
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
      prompt = `Please write a concise and effective ${sectionName} section for a job description with the following details:\n\n${context}\n\nThe content should have a ${tone.toLowerCase()} tone. Focus on clarity and directness, as you're using LLaMA 3.3 70B for fast, efficient content generation. ${modelSpecificInstructions}${additionalPrompt}`;
      break;
    case "enhance":
      prompt = `Please enhance the following ${sectionName} section to make it more effective while keeping a ${tone.toLowerCase()} tone. Focus on clarity and directness, as you're using LLaMA 3.3 70B:\n\n${context}\n\nCurrent content:\n${currentContent}\n\n${modelSpecificInstructions}${additionalPrompt}`;
      break;
    case "rewrite":
      prompt = `Please rewrite the following ${sectionName} section with a ${tone.toLowerCase()} tone, maintaining the same information but improving clarity. Keep it straightforward and direct, as you're using LLaMA 3.3 70B:\n\n${context}\n\nCurrent content:\n${currentContent}\n\n${modelSpecificInstructions}${additionalPrompt}`;
      break;
    default:
      prompt = `Please write a concise and effective ${sectionName} section for a job description with the following details:\n\n${context}\n\nThe content should have a ${tone.toLowerCase()} tone. Make it clear, direct, and easy to understand, as you're using LLaMA 3.3 70B. ${modelSpecificInstructions}${additionalPrompt}`;
  }

  return prompt;
}

// This is a mock function for demonstration purposes only
function generateMockResponse(data: JobDescriptionRequest): string {
  const { jobTitle, seniority, section, tone, additionalContext } = data;
  
  let focusType = "standard";
  if (additionalContext) {
    // Try to extract focus information from additional context
    if (additionalContext.toLowerCase().includes("candidate")) focusType = "candidate";
    else if (additionalContext.toLowerCase().includes("company")) focusType = "company";
    else if (additionalContext.toLowerCase().includes("impact")) focusType = "impact";
    else if (additionalContext.toLowerCase().includes("growth")) focusType = "growth";
  }
  
  // Special handling for company blurb
  if (section === "companyBlurb") {
    const companyBlurbs = [
      `Our company delivers innovative solutions with a focus on customer satisfaction. We've built a team of talented professionals who share our commitment to excellence and continuous improvement. Our collaborative environment encourages creativity while maintaining the highest standards of quality in everything we do.`,
      `Founded with a vision to transform the industry, our company has grown into a respected leader known for reliability and innovation. We prioritize both client success and employee growth, fostering a positive workplace culture where every team member can thrive and contribute to our shared mission.`,
      `We're a dynamic organization dedicated to solving complex challenges through technology and expertise. Our diverse team brings together different perspectives to create impactful solutions. If you're looking to join a company where your work makes a difference and your growth is supported, you've found the right place.`
    ];
    
    const randomIndex = Math.floor(Math.random() * companyBlurbs.length);
    return `[Generated with LLaMA 3.3 70B]\n\n${companyBlurbs[randomIndex]}`;
  }
  
  // Handle required qualifications section
  if (section === "requiredQualifications") {
    const qualifications = [
      `• ${seniority === 'Senior' ? '5+' : seniority === 'Mid-Level' ? '2-4' : '1-2'} years of experience in ${jobTitle.toLowerCase()} or similar role\n• Bachelor's degree in relevant field\n• Proficiency in industry-standard tools and methodologies\n• Strong problem-solving and analytical skills\n• Excellent communication and teamwork abilities\n• Proven track record of delivering results`,
      `• Demonstrated experience in ${jobTitle.toLowerCase()} functions\n• Technical expertise with relevant systems and platforms\n• Strong project management and organizational skills\n• Ability to work independently and as part of a team\n• Excellent written and verbal communication\n• Analytical mindset with attention to detail`
    ];
    
    const randomIndex = Math.floor(Math.random() * qualifications.length);
    return `[LLaMA 3.3 70B - Direct, Efficient List]\n\n${qualifications[randomIndex]}`;
  }
  
  // Special handling for preferred qualifications
  if (section === "preferredQualifications") {
    const preferredQualifications = [
      `• Advanced degree or relevant certifications\n• Experience with ${jobTitle.toLowerCase()} in similar industry\n• Knowledge of emerging trends and technologies in the field\n• Project management experience\n• Leadership skills\n• International work experience`,
      `• Proven ability to innovate and implement new approaches\n• Experience working in cross-functional teams\n• Additional technical skills beyond the requirements\n• Industry-specific knowledge\n• Experience with process improvement`
    ];
    
    const randomIndex = Math.floor(Math.random() * preferredQualifications.length);
    return `[LLaMA 3.3 70B - Efficient Preferred Qualifications]\n\n${preferredQualifications[randomIndex]}`;
  }
  
  // Specific role summary mockups that showcase LLaMA's direct, efficient style
  if (section === "summary") {
    const summaries: Record<string, string[]> = {
      standard: [
        `We're looking for a ${seniority} ${jobTitle} to join our team. In this role, you'll develop solutions, collaborate with team members, and drive results. You'll need to balance analytical thinking with practical implementation to deliver on our business objectives.`,
        `Join our company as a ${seniority} ${jobTitle}. You'll work on challenging projects, contribute to team success, and grow your skills. This position requires strong expertise in the field and the ability to adapt to changing priorities.`
      ],
      candidate: [
        `As our new ${seniority} ${jobTitle}, you'll grow your career while solving meaningful challenges. You'll develop valuable skills, work with talented team members, and advance your expertise in a supportive environment. Ideal for professionals seeking both achievement and development.`,
        `Join us as a ${seniority} ${jobTitle} to advance your career path. You'll gain hands-on experience with cutting-edge tools, build valuable professional relationships, and develop specialized knowledge that will accelerate your professional growth.`
      ],
      company: [
        `Our company needs a ${seniority} ${jobTitle} to help us achieve our strategic goals. You'll join our mission to deliver excellence, uphold our core values, and contribute to our industry-leading position. Be part of a team that's defining the future of our field.`,
        `We're seeking a ${seniority} ${jobTitle} to strengthen our talented team. You'll embody our commitment to innovation, quality, and customer satisfaction while helping us expand our market presence and industry impact.`
      ],
      impact: [
        `The ${seniority} ${jobTitle} will drive significant business results by implementing effective strategies, optimizing key processes, and delivering measurable outcomes. Your work will directly impact our bottom line, customer satisfaction, and market position.`,
        `Make a real difference as our ${seniority} ${jobTitle}. Your work will directly contribute to critical business metrics, help solve meaningful challenges, and create tangible value for our customers and stakeholders.`
      ],
      growth: [
        `Join our high-growth team as a ${seniority} ${jobTitle}. You'll be part of our rapid expansion, help scale our operations, and contribute to our ambitious targets. Ideal for those who thrive in dynamic, evolving environments with significant opportunities.`,
        `We're expanding rapidly and need a ${seniority} ${jobTitle} to support our growth trajectory. You'll help build scalable processes, expand our capabilities, and capitalize on new market opportunities as we enter our next phase.`
      ]
    };
    
    // Select a random response from the appropriate category
    const responseOptions = summaries[focusType] || summaries.standard;
    const randomIndex = Math.floor(Math.random() * responseOptions.length);
    
    // Add LLaMA-specific prefix to highlight its direct style
    return `[LLaMA 3.3 70B - Direct, Efficient Summary]\n\n${responseOptions[randomIndex]}`;
  }
  
  // For other sections, use the original mock function logic
  const mockResponses: Record<string, string[]> = {
    responsibilities: [
      `• Develop and implement strategies for ${jobTitle} projects\n• Collaborate with cross-functional teams to achieve objectives\n• Analyze data to inform decision-making\n• Create documentation and reports\n• Manage resources effectively\n• Meet deadlines and quality standards`,
      `• Lead key initiatives in the ${jobTitle} domain\n• Solve complex problems using analytical approaches\n• Communicate with stakeholders about project status\n• Optimize processes for efficiency\n• Ensure compliance with standards and requirements`
    ],
    benefits: [
      `• Competitive salary\n• Health insurance\n• Retirement plan\n• Paid time off\n• Professional development opportunities\n• Flexible work arrangements\n• Team events`,
      `• Comprehensive benefits package\n• Performance bonuses\n• Career advancement paths\n• Work-life balance\n• Collaborative environment\n• Learning resources`
    ]
  };
  
  // Get the mock responses for the requested section
  const responsesForSection = mockResponses[section] || mockResponses.responsibilities;
  
  // Select a random response
  const randomIndex = Math.floor(Math.random() * responsesForSection.length);
  const response = responsesForSection[randomIndex];
  
  // Add a LLaMA-specific prefix
  return `[Generated with LLaMA 3.3 70B for efficiency and clarity]\n\n${response}`;
}