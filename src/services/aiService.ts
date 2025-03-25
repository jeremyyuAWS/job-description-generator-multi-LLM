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
 * 
 * @param params - The parameters for content generation
 * @param params.jobTitle - Required: The job title for the description
 * @param params.section - Required: The section of the job description to generate
 * @param params.tone - The tone to use for the content
 * @param params.currentContent - Existing content (required for rewrite/enhance actions)
 * @param params.action - The action to perform: 'generate', 'rewrite', or 'enhance'
 * @param params.model - The AI model to use: 'claude', 'gpt4o', or 'llama'
 * @param params.additionalContext - Any additional context to help the AI
 * 
 * @returns A promise that resolves to the generated content
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
    
    // Log authorization header in a safe way (only in development)
    const authKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (import.meta.env.DEV) {
      const maskedKey = authKey ? 
        `${authKey.substring(0, 4)}...${authKey.substring(authKey.length - 4)}` : 
        'undefined or empty';
      console.log(`Authorization header: Bearer ${maskedKey} (length: ${authKey?.length || 0})`);
    }
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authKey}`
      },
      body: JSON.stringify(payload)
    });

    const duration = Date.now() - startTime;
    
    // Log completion of the request
    console.log(`Lyzr Agents (${model.toUpperCase()}) response received in ${duration}ms`);

    if (!response.ok) {
      const errorText = await response.text();
      const status = response.status;
      
      // Enhanced error logging
      console.error(`Error from Lyzr Agents (${model}): Status ${status}`);
      console.error(`Response body:`, errorText);
      
      // Log additional details for common error codes
      if (status === 401) {
        console.error('Authentication error: Check that VITE_SUPABASE_ANON_KEY is correctly set and valid');
        if (import.meta.env.DEV) {
          console.error('Environment variables in .env files may need to be updated or the app restarted');
        }
      } else if (status === 403) {
        console.error('Authorization error: The provided key may not have permission to access this function');
      } else if (status === 404) {
        console.error('Not found error: The Edge Function URL may be incorrect or the function may not be deployed');
      }

      // Update DevTools with error
      if (devToolsContext && callId) {
        devToolsContext.updateApiCall(callId, {
          error: {
            status,
            body: errorText
          },
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

      // Include more details in the thrown error
      throw new Error(`AI service error: ${response.status} ${errorText.substring(0, 200)}${errorText.length > 200 ? '...' : ''}`);
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
    
    // Log additional context to help with debugging
    console.error('Generation context:', {
      action,
      section,
      model,
      hasCurrentContent: !!currentContent,
      currentContentLength: currentContent?.length || 0,
      apiEndpoint: functionUrl,
      hasAuthKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      authKeyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0
    });
    
    // In development mode, provide more detailed troubleshooting steps
    if (import.meta.env.DEV) {
      console.info('Troubleshooting steps:');
      console.info('1. Check that VITE_SUPABASE_ANON_KEY is set correctly in your .env file');
      console.info('2. Verify the Edge Function URLs are correct in API_ENDPOINTS');
      console.info('3. Ensure the Edge Functions are deployed and accessible');
      console.info('4. Check the Supabase project console for function logs');
    }

    // If we haven't already recorded the error in DevTools
    if (devToolsContext && callId && error instanceof Error) {
      devToolsContext.updateApiCall(callId, {
        error: { message: error.message, stack: error.stack },
        status: 'error',
        duration: Date.now() - startTime
      });
    }

    // Track failed API call in analytics if not already tracked
    if (!(error instanceof Error && error.message.includes('AI service error'))) {
      analytics.trackModelUsage({
        model,
        action: action || 'generate',
        section,
        responseTime: Date.now() - startTime,
        success: false
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
 * 
 * @param jobDescription - The job description parameters including jobTitle, section, tone, etc.
 * @param content - The current content to be rewritten
 * @returns A promise that resolves to the rewritten content
 * 
 * This function specifically sets the action to 'rewrite' which instructs the AI
 * to completely rewrite the content while maintaining the same information and context.
 * Unlike 'enhance' which improves existing content, 'rewrite' produces a fresh version.
 */
export async function rewriteContent(
  jobDescription: LLMGenerationParams,
  content: string
): Promise<string> {
  try {
    return await generateContent({
      ...jobDescription,
      currentContent: content,
      action: 'rewrite'
    });
  } catch (error) {
    console.error('Failed to rewrite content:', error);
    // Log additional context to help with debugging
    console.error('Rewrite attempt failed with parameters:', {
      jobTitle: jobDescription.jobTitle,
      section: jobDescription.section,
      model: jobDescription.model || 'claude',
      contentLength: content?.length || 0
    });
    
    // Rethrow the error to be handled by the caller
    throw new Error(`Failed to rewrite content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Initialize DevTools tracking
 * This should be called once the DevTools context is available
 */
export function initializeDevToolsTracking(context: any) {
  window.devToolsContext = context;
}

// Export API_ENDPOINTS for use in the diagnostics component
export { API_ENDPOINTS };
