const config = window.SHADOW_CONFIG || {};
const messagesEl = document.getElementById("messages");
const input = document.getElementById("input");
const composer = document.getElementById("composer");
const sendBtn = document.getElementById("sendBtn");
const typing = document.getElementById("typing");
const settingsModal = document.getElementById("settingsModal");
const apiKeyInput = document.getElementById("apiKeyInput");

const SYSTEM_PROMPT = `
You are Shadow, a sharp, friendly, slightly sarcastic senior software engineer and coding mentor.

PERSONALITY:
- Calm, confident and direct.
- You have a dry sense of humor, but never insult the user.
- You enjoy solving difficult programming problems.
- Talk like a smart human developer, not a corporate chatbot.
- Be encouraging when the user is learning.
- Don't add pointless filler.

CODING BEHAVIOR:
- Give correct, runnable code whenever code is requested.
- Prefer complete files when the user asks to build something.
- Explain important decisions briefly.
- When debugging, identify the actual cause before proposing a fix.
- Preserve the user's architecture unless changing it is necessary.
- Mention security problems when they matter.
- If requirements are ambiguous, make a sensible assumption and state it.
- Never pretend code was executed or tested if it wasn't.
- Use Markdown code fences with the appropriate language.
`;

let conversation = [];
let busy = false;

function getKey() {
  return localStorage.getItem("shadow_gemini_key") || config.API_KEY || "";
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

function renderMarkdown(text) {
  const parts = [];
  const codePattern = /```(\w*)\n?([\s\S]*?)```/g;
  let last = 0, match;
  while ((match = codePattern.exec(text)) !== null) {
    parts.push({type:"text", value:text.slice(last, match.index)});
    parts.push({type:"code", lang:match[1] || "code", value:match[2].trimEnd()});
    last = match.index + match[0].length;
  }
  parts.push({type:"text", value:text.slice(last)});

  return parts.map(p => {
    if (p.type === "code") {
      return `<div class="code-wrap"><div class="code-head"><span>${escapeHtml(p.lang)}</span><button class="copy-code">Copy</button></div><pre><code>${escapeHtml(p.value)}</code></pre></div>`;
    }
    let t = escapeHtml(p.value);
    t = t.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
    t = t.replace(/\n/g, "<br>");
    return t;
  }).join("");
}

function addMessage(role, text) {
  const welcome = messagesEl.querySelector(".welcome");
  if (welcome) welcome.remove();

  const row = document.createElement("div");
  row.className = `message ${role}`;
  const avatar = role === "assistant" ? "S" : "YOU";
  row.innerHTML = `<div class="msg-avatar">${avatar}</div><div class="bubble">${role === "assistant" ? renderMarkdown(text) : escapeHtml(text).replace(/\n/g,"<br>")}</div>`;
  messagesEl.appendChild(row);
  row.querySelectorAll(".copy-code").forEach(btn => {
    btn.addEventListener("click", async () => {
      const code = btn.closest(".code-wrap").querySelector("code").innerText;
      await navigator.clipboard.writeText(code);
      btn.textContent = "Copied";
      setTimeout(() => btn.textContent = "Copy", 1200);
    });
  });
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function sendMessage(text) {
  const key = getKey();
  if (!key) {
    openSettings();
    return;
  }
  if (busy || !text.trim()) return;

  busy = true;
  sendBtn.disabled = true;
  addMessage("user", text.trim());
  conversation.push({role:"user", text:text.trim()});
  input.value = "";
  resizeInput();
  typing.classList.remove("hidden");

  try {
    const contents = conversation.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{text: m.text}]
    }));

    // Gemini API accepts the system instruction separately.
    const url = `${config.API_BASE}/${encodeURIComponent(config.MODEL)}:generateContent?key=${encodeURIComponent(key)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        systemInstruction: {parts:[{text:SYSTEM_PROMPT}]},
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error?.message || `API request failed (${response.status})`);
    }

    const answer = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "I didn't get a usable response.";
    conversation.push({role:"assistant", text:answer});
    addMessage("assistant", answer);
  } catch (err) {
    addMessage("assistant", `**API error:** ${err.message}\n\nCheck your API key, model name, quota, and browser/network settings.`);
  } finally {
    typing.classList.add("hidden");
    busy = false;
    sendBtn.disabled = false;
    input.focus();
  }
}

function resizeInput() {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 180) + "px";
}

function openSettings() {
  apiKeyInput.value = localStorage.getItem("shadow_gemini_key") || "";
  settingsModal.classList.remove("hidden");
  setTimeout(() => apiKeyInput.focus(), 50);
}

composer.addEventListener("submit", e => {
  e.preventDefault();
  sendMessage(input.value);
});

input.addEventListener("input", resizeInput);
input.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    composer.requestSubmit();
  }
});

document.getElementById("newChatBtn").onclick = () => {
  conversation = [];
  messagesEl.innerHTML = `<div class="welcome"><div class="welcome-orb">S</div><h2>What are we building?</h2><p>Ask Shadow to debug code, design an app, explain a concept, or build something from scratch.</p><div class="suggestions"><button data-prompt="Build me a responsive login page with HTML, CSS and JavaScript.">Build a login page</button><button data-prompt="Explain async/await in JavaScript with a simple example.">Explain async/await</button><button data-prompt="Find the likely bugs in this code and explain how to fix them.">Debug my code</button><button data-prompt="Design a clean folder structure for a Node.js REST API.">Design an API</button></div></div>`;
  bindSuggestions();
};

document.getElementById("clearBtn").onclick = () => {
  conversation = [];
  messagesEl.innerHTML = "";
  document.getElementById("newChatBtn").click();
};

document.getElementById("settingsBtn").onclick = openSettings;
document.getElementById("closeModal").onclick = () => settingsModal.classList.add("hidden");
document.getElementById("saveKeyBtn").onclick = () => {
  const key = apiKeyInput.value.trim();
  if (key) localStorage.setItem("shadow_gemini_key", key);
  else localStorage.removeItem("shadow_gemini_key");
  settingsModal.classList.add("hidden");
};

settingsModal.addEventListener("click", e => {
  if (e.target === settingsModal) settingsModal.classList.add("hidden");
});

function bindSuggestions() {
  document.querySelectorAll("[data-prompt]").forEach(btn => {
    btn.onclick = () => sendMessage(btn.dataset.prompt);
  });
}
bindSuggestions();
