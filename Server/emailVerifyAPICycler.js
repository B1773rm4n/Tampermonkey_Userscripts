// server.ts

// JSDoc for APIKey type, providing type information for tooling without requiring TypeScript compilation.
/**
 * @typedef {object} APIKey
 * @property {string} provider
 * @property {string} url
 * @property {string} key
 * @property {number} limit
 * @property {number} used
 */

// The API_POOL array, now without explicit TypeScript array type annotation.
/**
 * @type {APIKey[]}
 */
const API_POOL = [
  { 
    provider: "Hunter", 
    url: "https://api.hunter.io/v2/email-verifier", 
    key: "f93750b63fc37bf325b95718441d3adb43aa7d4a", 
    limit: 25, 
    used: 0 
  },
  { 
    provider: "ZeroBounce", 
    url: "https://api.zerobounce.net/v2/validate", 
    key: "3a40cfafe88b4dd0a43e655a2823bcc1", 
    limit: 100, 
    used: 0 
  }
  // provider: "Verifalia",
  // provider: "Email Hippo",
];

// Explicit methods for each provider
const callHunterApi = async (email, account) => {
  const response = await fetch(`${account.url}?email=${email}&api_key=${account.key}`);
  return response.json();
};

const callZeroBounceApi = async (email, account) => {
  const response = await fetch(`${account.url}?api_key=${account.key}&email=${email}`);
  return response.json();
};

// providerCallers object, now without explicit TypeScript type annotation.
/**
 * @type {Object.<string, function(string, APIKey): Promise<any>>}
 */
const providerCallers = {
  "Hunter": callHunterApi,
  "ZeroBounce": callZeroBounceApi
};

async function handler(req) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email");

  if (!email) {
    return new Response("Missing email parameter", { status: 400 });
  }
  
  // Find the first available key that has not reached its limit and has a defined caller
  const availableAccounts = API_POOL.filter(a => a.used < a.limit && providerCallers[a.provider]);
  const account = availableAccounts.find(a => true); // Take the first available

  if (!account) {
    return new Response("All API quotas exhausted or no suitable API provider found", { status: 503 });
  }

  try {
    const caller = providerCallers[account.provider];
    if (!caller) {
      // This case should ideally not be reached due to the filter above, but good for robustness
      return new Response(`No API caller defined for provider: ${account.provider}`, { status: 500 });
    }

    const data = await caller(email, account);
    
    account.used++;
    
    return new Response(JSON.stringify({
      provider: account.provider,
      remaining: account.limit - account.used,
      data: data
    }), {
      headers: { "content-type": "application/json" }
    });
  } catch (error) {
    console.error(`Error calling ${account.provider}:`, error);
    return new Response(`Error calling ${account.provider}: ${error.message}`, { status: 500 });
  }
}

console.log("Service running on http://localhost:26388");
Deno.serve(handler);