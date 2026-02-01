import { callGeminiApi } from "./geminiApiClient.js";

const port = 26389;

Deno.serve({ port }, async (req) => {
    const url = new URL(req.url);

    if (req.method === 'POST' && url.pathname === '/test') {
        console.log('Received POST /test request');
        try {
            const body = await req.json();
            console.log('Request body parsed:', body);
            const fullName = body['fullName'];
            const companyName = body['companyName'];

            if (!fullName || !companyName) {
                return new Response(JSON.stringify({ error: 'Missing parameters fullName or companyName in request body' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            // Construct the prompt with the provided parameters
            const promptText = `Gib mir die Email von ${fullName} von der Firma ${companyName}. Gib mir das Ergebnis als JSON array aus mit sinkender wahrscheinlichkeit, leer falls keine ergebnisse vorhanden sind`;
            
            console.log('Calling Gemini API...');
            try {
                const jsonResult = await callGeminiApi(promptText);
                console.log('Gemini API call successful.');
                return new Response(JSON.stringify(jsonResult), { status: 200, headers: { 'Content-Type': 'application/json' } });
            } catch (apiError) {
                console.error('Error from Gemini API client:', apiError);
                return new Response(JSON.stringify({ error: 'Gemini API call failed', details: apiError.message }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        } catch (e) {
            console.error('Error processing request:', e);
            return new Response(JSON.stringify({ error: 'Invalid JSON body', details: e.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
    }
    console.log('Returning 404 for:', url.pathname);
    return new Response('Not Found', { status: 404 });
});

console.log(`Deno server listening at http://localhost:${port}`);