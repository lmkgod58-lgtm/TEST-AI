const config = window.SHADOW_CONFIG || {};

const messagesEl = document.getElementById("messages");
const input = document.getElementById("input");
const composer = document.getElementById("composer");
const sendBtn = document.getElementById("sendBtn");
const typing = document.getElementById("typing");
const settingsModal = document.getElementById("settingsModal");
const apiKeyInput = document.getElementById("apiKeyInput");

const SYSTEM_PROMPT = `
You are Shadow, a highly capable senior software engineer and coding AI.

PERSONALITY:
- Calm, confident and intelligent.
- Friendly with a subtle dry sense of humor.
- Never unnecessarily formal or robotic.
- You enjoy solving difficult programming problems.
- Be direct instead of filling responses with pointless words.
- Treat the user like a developer you're working alongside.
- If the user makes a mistake, explain it without being condescending.

CODING:
- Prioritize correct, runnable code.
- When asked to create something, actually provide the implementation.
- Prefer complete files when the user asks for a full file.
- Explain important decisions briefly.
- When debugging, identify the likely cause before giving the fix.
- Preserve the user's existing architecture when possible.
- Point out security issues when relevant.
- Never claim that you executed or tested code when you did not.
- Use Markdown code blocks with the correct language.
- If requirements are unclear, make a reasonable assumption and state it.
`;

let conversation = [];
let busy = false;


/* =========================
   API KEY
========================= */

function getKey() {
  return (
    localStorage.getItem("shadow_openrouter_key") ||
    config.API_KEY ||
    ""
  ).trim();
}


/* =========================
   HTML ESCAPING
========================= */

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}


/* =========================
   MARKDOWN / CODE RENDERING
========================= */

function renderMarkdown(text) {

  const parts = [];
  const codeRegex = /```([\w+#.-]*)\n?([\s\S]*?)```/g;

  let lastIndex = 0;
  let match;

  while ((match = codeRegex.exec(text)) !== null) {

    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        value: text.slice(lastIndex, match.index)
      });
    }

    parts.push({
      type: "code",
      lang: match[1] || "code",
      value: match[2].trimEnd()
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      value: text.slice(lastIndex)
    });
  }

  return parts.map(part => {

    if (part.type === "code") {

      return `
        <div class="code-wrap">

          <div class="code-head">
            <span>${escapeHtml(part.lang)}</span>

            <button class="copy-code">
              Copy
            </button>
          </div>

          <pre><code>${escapeHtml(part.value)}</code></pre>

        </div>
      `;
    }

    let html = escapeHtml(part.value);

    html = html.replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>"
    );

    html = html.replace(
      /`([^`]+)`/g,
      "<code>$1</code>"
    );

    html = html.replace(
      /\n/g,
      "<br>"
    );

    return html;

  }).join("");
}


/* =========================
   DISPLAY MESSAGE
========================= */

function addMessage(role, text) {

  const welcome = messagesEl.querySelector(".welcome");

  if (welcome) {
    welcome.remove();
  }

  const row = document.createElement("div");

  row.className = `message ${role}`;

  const avatar =
    role === "assistant"
      ? "S"
      : "YOU";

  row.innerHTML = `
    <div class="msg-avatar">
      ${avatar}
    </div>

    <div class="bubble">
      ${
        role === "assistant"
          ? renderMarkdown(text)
          : escapeHtml(text).replace(/\n/g, "<br>")
      }
    </div>
  `;

  messagesEl.appendChild(row);

  /* Copy buttons */

  row.querySelectorAll(".copy-code").forEach(button => {

    button.addEventListener("click", async () => {

      const code =
        button
          .closest(".code-wrap")
          .querySelector("code")
          .innerText;

      try {

        await navigator.clipboard.writeText(code);

        button.textContent = "Copied";

        setTimeout(() => {
          button.textContent = "Copy";
        }, 1200);

      } catch {

        button.textContent = "Failed";

      }

    });

  });

  messagesEl.scrollTop =
    messagesEl.scrollHeight;
}


/* =========================
   SEND TO OPENROUTER
========================= */

async function sendMessage(text) {

  const key = getKey();

  if (!key) {

    openSettings();

    return;
  }

  if (busy || !text.trim()) {
    return;
  }

  busy = true;

  sendBtn.disabled = true;

  addMessage(
    "user",
    text.trim()
  );

  conversation.push({
    role: "user",
    content: text.trim()
  });

  input.value = "";

  resizeInput();

  typing.classList.remove("hidden");


  try {

    const response = await fetch(
      `${config.API_BASE}/chat/completions`,
      {
        method: "POST",

        headers: {

          "Content-Type":
            "application/json",

          "Authorization":
            `Bearer ${key}`,

          "HTTP-Referer":
            window.location.origin,

          "X-Title":
            "Shadow Code AI"
        },

        body: JSON.stringify({

          model:
            config.MODEL || "openrouter/free",

          messages: [

            {
              role: "system",
              content: SYSTEM_PROMPT
            },

            ...conversation

          ],

          temperature: 0.7,

          max_tokens: 8192

        })
      }
    );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data?.error?.message ||
        `OpenRouter request failed (${response.status})`
      );
    }


    const answer =
      data?.choices?.[0]?.message?.content;


    if (!answer) {

      throw new Error(
        "OpenRouter returned no message."
      );
    }


    conversation.push({

      role: "assistant",

      content: answer

    });


    addMessage(
      "assistant",
      answer
    );


  } catch (error) {

    console.error(error);

    addMessage(
      "assistant",
      `**API error:** ${error.message}

Check that:

1. Your OpenRouter key is correct.
2. The key starts with \`sk-or-\`.
3. Your OpenRouter account can access free models.
4. You haven't reached the free-model rate limit.
5. The browser isn't blocking the request.`
    );

  } finally {

    typing.classList.add("hidden");

    busy = false;

    sendBtn.disabled = false;

    input.focus();
  }
}


/* =========================
   TEXTAREA
========================= */

function resizeInput() {

  input.style.height = "auto";

  input.style.height =
    Math.min(
      input.scrollHeight,
      180
    ) + "px";
}


input.addEventListener(
  "input",
  resizeInput
);


/* =========================
   ENTER TO SEND
========================= */

input.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      composer.requestSubmit();
    }

  }
);


/* =========================
   FORM
========================= */

composer.addEventListener(
  "submit",
  event => {

    event.preventDefault();

    sendMessage(input.value);

  }
);


/* =========================
   SETTINGS
========================= */

function openSettings() {

  apiKeyInput.value =
    localStorage.getItem(
      "shadow_openrouter_key"
    ) || "";

  settingsModal.classList.remove(
    "hidden"
  );

  setTimeout(
    () => apiKeyInput.focus(),
    50
  );
}


document.getElementById(
  "settingsBtn"
).onclick = openSettings;


document.getElementById(
  "closeModal"
).onclick = () => {

  settingsModal.classList.add(
    "hidden"
  );

};


document.getElementById(
  "saveKeyBtn"
).onclick = () => {

  const key =
    apiKeyInput.value.trim();

  if (key) {

    localStorage.setItem(
      "shadow_openrouter_key",
      key
    );

  } else {

    localStorage.removeItem(
      "shadow_openrouter_key"
    );

  }

  settingsModal.classList.add(
    "hidden"
  );
};


settingsModal.addEventListener(
  "click",
  event => {

    if (
      event.target === settingsModal
    ) {

      settingsModal.classList.add(
        "hidden"
      );

    }

  }
);


/* =========================
   NEW CHAT
========================= */

function newChat() {

  conversation = [];

  messagesEl.innerHTML = `

    <div class="welcome">

      <div class="welcome-orb">
        S
      </div>

      <h2>
        What are we building?
      </h2>

      <p>
        Ask Shadow to debug code,
        design an app, explain a concept,
        or build something from scratch.
      </p>

      <div class="suggestions">

        <button
          data-prompt="Build me a responsive login page with HTML, CSS and JavaScript."
        >
          Build a login page
        </button>

        <button
          data-prompt="Explain async/await in JavaScript with a simple example."
        >
          Explain async/await
        </button>

        <button
          data-prompt="Find the likely bugs in this code and explain how to fix them."
        >
          Debug my code
        </button>

        <button
          data-prompt="Design a clean folder structure for a Node.js REST API."
        >
          Design an API
        </button>

      </div>

    </div>
  `;

  bindSuggestions();
}


document.getElementById(
  "newChatBtn"
).onclick = newChat;


document.getElementById(
  "clearBtn"
).onclick = newChat;


/* =========================
   SUGGESTION BUTTONS
========================= */

function bindSuggestions() {

  document
    .querySelectorAll("[data-prompt]")
    .forEach(button => {

      button.onclick = () => {

        sendMessage(
          button.dataset.prompt
        );

      };

    });
}


bindSuggestions();
