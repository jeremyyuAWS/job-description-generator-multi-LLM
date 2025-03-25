/**
 * Common utility functions for Supabase Edge Functions
 */

/**
 * Handles CORS preflight requests
 * @param req The incoming request
 * @returns A Response with CORS headers if the request is OPTIONS, null otherwise
 */
export function handleCORS(req: Request): Response | null {
  // Standard CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Not an OPTIONS request, return null
  return null;
}

/**
 * Makes an authenticated API call to the Lyzr API
 * @param apiUrl The API endpoint URL
 * @param payload The request payload
 * @returns The parsed JSON response
 * @throws Error if the API call fails
 */
export async function callLyzrAPI(apiUrl: string, payload: any): Promise<any> {
  const apiKey = Deno.env.get('LYZR_API_KEY');
  
  if (!apiKey) {
    throw new Error('LYZR_API_KEY environment variable is not set');
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API call failed with status ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    // Re-throw with more context
    throw new Error(`Error calling Lyzr API: ${error.message}`);
  }
}

/**
 * Builds a standardized error response with CORS headers
 * @param status HTTP status code
 * @param errorMessage Main error message
 * @param details Optional detailed error information
 * @returns A Response object with JSON error payload and CORS headers
 */
export function buildErrorResponse(status: number, errorMessage: string, details?: string): Response {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  };

  const errorBody = {
    error: errorMessage,
    ...(details ? { details } : {}),
  };

  return new Response(
    JSON.stringify(errorBody),
    {
      status,
      headers: corsHeaders,
    }
  );
}