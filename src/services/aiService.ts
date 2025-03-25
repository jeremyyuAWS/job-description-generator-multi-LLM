import { SectionType, ToneType, LLMModelType, LLMGenerationParams } from '../types';
import { analytics } from './analytics';

interface AIResponse {
  success: boolean;
  content: string;
  raw: any;
}

// This will be imported only if DevTools is enabled
let devTools: any = null;

try {
  // Dynamically check if DevTools context is available
  if (localStorage.getItem('devtools-enabled') === 'true') {
    // This import will be used later after the context is fully defined
    import('../context/DevToolsContext').then(module => {
      devTools = {
        useDevTools: module.useDevTools
      };
    });
  }
} catch (e) {
  console.log('DevTools not available');
}

// Define the API endpoints for different models
const API_ENDPOINTS = {
  claude: "https://gkzwjeanhjowwxzflcxb.supabase.co/functions/v1/claude-sonnet-jd-generator",
  gpt4o: "https://gkzwjeanhjowwxzflcxb.supabase.co/functions/v1/gpt--4o-jd-generator",
  llama: "https://gkzwjeanhjowwxzflcxb.supabase.co/functions/v1/grok-llama-jd-generator"
};

// LLM agent IDs for Lyzr integration
const AGENT_IDS = {
  claude: "67df369d8f451bb9b9b6cbe2",
  gpt4o: "67df490b8f451bb9b9b6cc8b",
  llama: "67df490b8f451bb9b9b6cc8c" // This is the placeholder ID for LLaMA
};

/**
 * Generate job description content using the AI service
 */
export async function generateContent({
  jobTitle,
  seniority,
  employmentType,
  remoteOption,
  section,
  tone,
  currentContent = '',
  teamSize = '',
  reportingTo = '',
  tools = '',
  action = 'generate',
  model = 'claude',
  additionalContext = ''
}: LLMGenerationParams): Promise<string> {
  // Get the appropriate API endpoint based on the selected model
  const functionUrl = API_ENDPOINTS[model];

  // Validate required fields
  if (!jobTitle) {
    throw new Error("Job title is required to generate content");
  }

  // Only include the fields that will be used by the edge function
  // Don't pass fields that will be ignored - they could interfere with message handling
  const payload = {
    jobTitle,
    seniority,
    employmentType,
    remoteOption,
    section,
    tone,
    currentContent: currentContent || '',
    teamSize: teamSize || '',
    reportingTo: reportingTo || '',
    tools: tools || '',
    action: action || 'generate',
    additionalContext: additionalContext || '',
    
    // The following fields are used by the edge function to initialize Lyzr
    // but they're not part of the prompt itself
    user_id: "hirewrite@app.com",
    agent_id: AGENT_IDS[model],
    session_id: AGENT_IDS[model]
  };

  // Check if DevTools is enabled and get context
  const devToolsContext = window.devToolsContext;
  let callId: string | undefined;

  if (devToolsContext) {
    callId = devToolsContext.addApiCall({
      endpoint: functionUrl,
      request: payload
    });
  }

  const startTime = Date.now();

  try {
    // Log the start of the AI request
    console.log(`Connecting to Lyzr Agents (${model.toUpperCase()}) for ${action} on ${section} section...`);
    
    // Add a small artificial delay for local development to simulate network latency
    // This makes the UI feedback more noticeable
    if (import.meta.env.DEV) {
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    // Log the payload before sending the request
    console.log(`Sending request to ${model} with payload keys:`, Object.keys(payload).join(", "));
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const duration = Date.now() - startTime;
    
    // Log completion of the request
    console.log(`Lyzr Agents (${model.toUpperCase()}) response received in ${duration}ms`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error from Lyzr Agents (${model}):`, errorText);

      // Update DevTools with error
      if (devToolsContext && callId) {
        devToolsContext.updateApiCall(callId, {
          error: errorText,
          status: 'error',
          duration
        });
      }

      // Track failed API call in analytics
      analytics.trackModelUsage({
        model,
        action: action || 'generate',
        section,
        responseTime: duration,
        success: false
      });

      throw new Error(`AI service error: ${response.status} ${errorText}`);
    }

    const data: AIResponse = await response.json();
    
    // Update DevTools with response
    if (devToolsContext && callId) {
      devToolsContext.updateApiCall(callId, {
        response: data,
        status: 'success',
        duration
      });
    }

    // Track successful API call in analytics
    analytics.trackModelUsage({
      model,
      action: action || 'generate',
      section,
      responseTime: duration,
      success: true
    });

    if (!data.success) {
      throw new Error(data.content || 'Unknown error from AI service');
    }
    
    return data.content;
  } catch (error) {
    console.error(`Failed to generate content with ${model}:`, error);

    // If we haven't already recorded the error in DevTools
    if (devToolsContext && callId && error instanceof Error) {
      devToolsContext.updateApiCall(callId, {
        error: { message: error.message, stack: error.stack },
        status: 'error',
        duration: Date.now() - startTime
      });
    }

    // Rethrow the error to be handled by the caller
    throw error;
  }
}

/**
 * Enhance existing content using the AI service
 */
export async function enhanceContent(
  jobDescription: LLMGenerationParams,
  content: string
): Promise<string> {
  return generateContent({
    ...jobDescription,
    currentContent: content,
    action: 'enhance'
  });
}

/**
 * Rewrite existing content using the AI service
 */
export async function rewriteContent(
  jobDescription: LLMGenerationParams,
  content: string
): Promise<string> {
  return generateContent({
    ...jobDescription,
    currentContent: content,
    action: 'rewrite'
  });
}

/**
 * Initialize DevTools tracking
 * This should be called once the DevTools context is available
 */
export function initializeDevToolsTracking(context: any) {
  window.devToolsContext = context;
}