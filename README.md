# Shadow Code AI

A browser-only coding AI chat interface for GitHub Pages.

## Files

- `index.html` - interface
- `style.css` - dark responsive UI
- `app.js` - chat logic and Shadow personality
- `config.js` - API configuration

## Setup

1. Create a Gemini API key.
2. Open the site.
3. Press the ⚙ button.
4. Paste the key.
5. Press **Save locally**.
6. Start chatting.

The key is stored in the browser's localStorage.

## GitHub Pages

Upload all four files to a repository and enable GitHub Pages from the repository's Pages settings.

## Security warning

This is intentionally a backend-free prototype. A browser-based API key cannot be kept secret from the person using the page. Do not publish an unrestricted production key. For a public application, put the API call behind a server/backend and restrict the API key.

## Model

The default model is configured in `config.js`. Model availability and exact names can change, so update the model there to the current Gemini coding-capable model shown in Google's Gemini API documentation.
