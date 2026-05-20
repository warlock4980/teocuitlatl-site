(() => {
  const responses = [
    {
      keys: ["tom", "payment", "pay", "stable", "peso"],
      text: "TOM is the payment-flow concept: simple, stable-feeling payments for demos and future pilots. On this site, TOM is presented as a prototype/testnet asset, not an investment or legal tender."
    },
    {
      keys: ["teo", "gold", "reward", "rewards", "earn"],
      text: "TEO is the route reward concept. The idea is simple: visit real places, complete routes, and receive visible reward events. TEO is shown here as a testnet/demo asset, not a promise of returns."
    },
    {
      keys: ["badge", "mic", "cen", "proof", "prove"],
      text: "Badges prove you were there. MIC is the Lake Pátzcuaro / Michoacán route badge. CEN is the Cenote Cancún Adventure badge. They are proof concepts for completed routes."
    },
    {
      keys: ["michoacan", "michoacán", "janitzio", "patzcuaro", "pátzcuaro", "estribo", "mirador"],
      text: "The Michoacán route connects Janitzio and El Estribo Grande near Lake Pátzcuaro. Complete the proof route and the concept unlock is MIC: Insignia de Michoacán."
    },
    {
      keys: ["cancun", "cancún", "cenote", "cenotes", "adventure", "quintana"],
      text: "Cenote Cancún Adventure is the multi-stop proof route concept near Cancún and Puerto Morelos. It is built for repeat trips, route progress, and a larger CEN badge moment."
    },
    {
      keys: ["partner", "sponsor", "pilot", "merchant", "hotel", "tourism"],
      text: "For partners, Project Mexica is framed as a commercial pilot: route sponsorships, local campaigns, tourism activations, and payment-flow demos. It is not a token sale. The partner page has the current pilot tiers: https://teocuitlatl.com/partners.html"
    },
    {
      keys: ["coin", "medallion", "gallery", "vote", "sun", "moon", "silver", "gold"],
      text: "The coin art is commemorative concept art. The signature motif is Sun and Moon, with heritage concepts like Tenochtitlán and Moctezuma joining the gallery. Vote here: https://teocuitlatl.com/gallery.html"
    },
    {
      keys: ["moctezuma", "tenochtitlan", "tenochtitlán", "heritage"],
      text: "The heritage medallions are commemorative concept art: Tenochtitlán shows the lake city at full scale, while Moctezuma is framed as a dignified ruler motif. They are not legal tender or investment products. Vote here: https://teocuitlatl.com/gallery.html"
    },
    {
      keys: ["legal", "investment", "buy", "sale", "returns", "security"],
      text: "Important: this is a prototype/testnet demonstration. Nothing here is investment advice, a securities offer, a promise of returns, legal tender, or a public token sale."
    }
  ];

  const starterMessages = [
    "Welcome to Project Mexica. I can explain TOM, TEO, badges, routes, medallions, or partner pilots.",
    "Try: What is TEO? How do badges work? What is the Cenote route?"
  ];

  const prompts = [
    "What is TEO?",
    "How do badges work?",
    "Cenote route",
    "Partner pilots"
  ];

  function findReply(message) {
    const text = message.toLowerCase();
    const match = responses.find(item => item.keys.some(key => text.includes(key)));
    if (match) return match.text;
    return "I can help with TOM, TEO, proof badges, the Michoacán route, the Cenote Cancún Adventure, medallion concepts, and partner pilots. For direct questions, email hola@teocuitlatl.com.";
  }

  function appendLinkedText(node, text) {
    const pattern = /(https?:\/\/[^\s]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;
    let index = 0;
    let match;

    while ((match = pattern.exec(text))) {
      const raw = match[0];
      const start = match.index;
      const clean = raw.replace(/[.,!?;:)\]]+$/g, "");
      const trailing = raw.slice(clean.length);

      if (start > index) {
        node.append(document.createTextNode(text.slice(index, start)));
      }

      const link = document.createElement("a");
      link.textContent = clean;
      link.href = clean.includes("@") && !clean.startsWith("http") ? `mailto:${clean}` : clean;

      if (link.href.startsWith("http")) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }

      node.append(link);
      if (trailing) node.append(document.createTextNode(trailing));
      index = start + raw.length;
    }

    if (index < text.length) {
      node.append(document.createTextNode(text.slice(index)));
    }
  }

  function createMessage(role, text) {
    const item = document.createElement("div");
    item.className = `mexica-msg ${role}`;
    appendLinkedText(item, text);
    return item;
  }

  function scrollToBottom(body) {
    body.scrollTop = body.scrollHeight;
  }

  function init() {
    if (document.querySelector(".mexica-chat-panel")) return;

    const launcher = document.createElement("button");
    launcher.className = "mexica-chat-launcher";
    launcher.type = "button";
    launcher.setAttribute("aria-label", "Open Project Mexica guide");
    launcher.innerHTML = `
      <span class="mexica-chat-hints" aria-hidden="true">
        <span>What is TEO?</span>
        <span>Pick top 3 coins</span>
        <span>Partner pilots</span>
      </span>
      <span class="mexica-chat-coin" aria-hidden="true">
        <span class="mexica-chat-face front"><img src="./assets/medallions/pyramid-sun-gold.png" alt=""></span>
        <span class="mexica-chat-face back"><img src="./assets/medallions/pyramid-moon-silver.png" alt=""></span>
      </span>
    `;

    const panel = document.createElement("section");
    panel.className = "mexica-chat-panel";
    panel.setAttribute("aria-label", "Project Mexica guide");
    panel.innerHTML = `
      <header class="mexica-chat-header">
        <span class="mexica-chat-mini-coin" aria-hidden="true"><img src="./assets/hero/forge-coin-cutout.png" alt=""></span>
        <span class="mexica-chat-title">
          <strong>Mexica Guide</strong>
          <span>TOM pays. TEO rewards. Badges prove you were there.</span>
        </span>
        <button class="mexica-chat-expand" type="button" aria-label="Expand chat window" aria-expanded="false">
          <span class="mexica-expand-open" aria-hidden="true">+</span>
          <span class="mexica-expand-close" aria-hidden="true">-</span>
        </button>
        <button class="mexica-chat-clear" type="button">Clear</button>
        <button class="mexica-chat-close" type="button" aria-label="Close chat">x</button>
      </header>
      <div class="mexica-chat-body" role="log" aria-live="polite"></div>
      <div class="mexica-chat-prompts"></div>
      <form class="mexica-chat-input-row">
        <input class="mexica-chat-input" type="text" autocomplete="off" placeholder="Ask about routes, badges, TOM, TEO...">
        <button class="mexica-chat-send" type="submit">Send</button>
      </form>
      <div class="mexica-chat-note">Prototype guide. Not financial advice, not investment advice, and not a token sale.</div>
    `;

    document.body.append(launcher, panel);

    const body = panel.querySelector(".mexica-chat-body");
    const close = panel.querySelector(".mexica-chat-close");
    const clear = panel.querySelector(".mexica-chat-clear");
    const expand = panel.querySelector(".mexica-chat-expand");
    const form = panel.querySelector("form");
    const input = panel.querySelector("input");
    const promptWrap = panel.querySelector(".mexica-chat-prompts");

    function seed() {
      body.replaceChildren(...starterMessages.map(text => createMessage("bot", text)));
      scrollToBottom(body);
    }

    function openPanel() {
      launcher.classList.add("open");
      panel.classList.add("open");
      input.focus();
    }

    function closePanel() {
      panel.classList.remove("open");
      panel.classList.remove("expanded");
      expand.setAttribute("aria-expanded", "false");
      expand.setAttribute("aria-label", "Expand chat window");
      launcher.classList.remove("open");
      launcher.focus();
    }

    function send(text) {
      const trimmed = text.trim();
      if (!trimmed) return;
      body.append(createMessage("user", trimmed));
      body.append(createMessage("bot", findReply(trimmed)));
      input.value = "";
      scrollToBottom(body);
    }

    prompts.forEach(prompt => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = prompt;
      button.addEventListener("click", () => send(prompt));
      promptWrap.append(button);
    });

    launcher.addEventListener("click", openPanel);
    close.addEventListener("click", closePanel);
    clear.addEventListener("click", seed);
    expand.addEventListener("click", () => {
      const isExpanded = panel.classList.toggle("expanded");
      expand.setAttribute("aria-expanded", String(isExpanded));
      expand.setAttribute("aria-label", isExpanded ? "Collapse chat window" : "Expand chat window");
      scrollToBottom(body);
    });
    form.addEventListener("submit", event => {
      event.preventDefault();
      send(input.value);
    });

    window.addEventListener("keydown", event => {
      if (event.key === "Escape" && panel.classList.contains("open")) closePanel();
    });

    seed();

    if (new URLSearchParams(window.location.search).get("chat") === "open") {
      openPanel();
    }

    if (new URLSearchParams(window.location.search).get("chat") === "expanded") {
      openPanel();
      panel.classList.add("expanded");
      expand.setAttribute("aria-expanded", "true");
      expand.setAttribute("aria-label", "Collapse chat window");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
