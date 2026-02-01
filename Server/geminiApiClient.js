const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";
if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY environment variable is not set. Please set it before running the server.");
    // In a production environment, you might want to throw an error or exit here.
}

/**
 * Calls the Gemini API with the given prompt text.
 * @param {string} promptText The text prompt to send to the Gemini model.
 * @returns {Promise<Array<string>>} A promise that resolves to a JSON array of strings (emails).
 * @throws {Error} If the Gemini API key is not configured or the API request fails.
 */
export async function callGeminiApi(promptText) {
    if (!GEMINI_API_KEY) {
        throw new Error("Gemini API key is not configured. Cannot make API call.");
    }

    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: promptText,
                    },
                ],
            },
        ],
        generationConfig: {
            temperature: 0,
            responseMimeType: "application/json",
            maxOutputTokens: 2048, // A reasonable default for output length
            thinkingConfig: {
                includeThoughts: false,
                thinkingLevel: "MINIMAL"
            }

        },
        // You can add safety settings here if needed, e.g.:
        // safetySettings: [
        //     { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        // ],
    };

    try {
        const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => response.text());
            throw new Error(`Gemini API request failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        // The Gemini API returns content in candidates[0].content.parts[0].text
        // This text field should contain the JSON array we asked for.
        return JSON.parse(data.candidates[0].content.parts[0].text);
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw error; // Re-throw to be handled by the server
    }
}