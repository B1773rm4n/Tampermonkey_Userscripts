# Tampermonkey Local Server

This is a local Deno utility server designed to bridge Tampermonkey userscripts with the Gemini API. It allows browser-based scripts to leverage the `gemini-2.5-flash` model for specialized data extraction tasks, such as finding professional email addresses, using Deno's native HTTP server.

## Prerequisites

- **Deno**: Installed on your system.
- **Gemini API Key**: A Gemini API key must be obtained from Google AI Studio. You can set it as an environment variable directly or place it in a `.env` file in the server's root directory (e.g., `GEMINI_API_KEY="YOUR_API_KEY"`).

## Running the Server

To start the server on the default port (`26389`):

```bash
deno task start # If GEMINI_API_KEY is in .env or already set
# Or set it directly:
# GEMINI_API_KEY="YOUR_API_KEY" deno task start
```

For development with automatic reloading:

```bash
deno task dev
```

## API Reference

### POST `/test`

Executes a prompt against the Gemini model to find an email address.

**Request Body:**
```json
{
  "fullName": "Full Name",
  "companyName": "Company Name"
}
```

**Response:**
Returns a JSON array of strings (emails) sorted by probability. Returns an empty array `[]` if no results are found.

### Test Example

You can test the server using `curl`:

```bash
curl -X POST http://localhost:26389/test \
     -H "Content-Type: application/json" \
     -d '{"fullName": "Katarzyna Paradecka", "companyName": "Redglobal"}'
```