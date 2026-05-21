(() => {
  const chatApiUrl = window.MEXICA_CHAT_API_URL || "https://teocuitlatl-poll-api.vercel.app/api/chat";
  const assetBase = window.MEXICA_ASSET_BASE || "./assets";
  const isSpanishPage = document.documentElement.lang.toLowerCase().startsWith("es");

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
      text: "Badges prove you were there. MIC is the Lake Pátzcuaro / Michoacán route badge. CEN is the Cancún Cenote Adventure badge. They are proof concepts for completed routes."
    },
    {
      keys: ["michoacan", "michoacán", "janitzio", "patzcuaro", "pátzcuaro", "estribo", "mirador"],
      text: "The Michoacán route connects Janitzio and El Estribo Grande near Lake Pátzcuaro. Complete the proof route and the concept unlock is MIC: Michoacán Badge."
    },
    {
      keys: ["cancun", "cancún", "cenote", "cenotes", "adventure", "quintana"],
      text: "Cancún Cenote Adventure is the multi-stop proof route concept near Cancún and Puerto Morelos. It is built for repeat trips, route progress, and a larger CEN badge moment."
    },
    {
      keys: ["partner", "sponsor", "pilot", "merchant", "hotel", "tourism"],
      text: "For partners, Project Mexica is framed as a commercial pilot: route sponsorships, local campaigns, tourism activations, and payment-flow demos. It is not a token sale. The partner page has the current pilot tiers: https://teocuitlatl.com/partners.html"
    },
    {
      keys: ["travel", "map", "passport", "fmm", "tourist card", "entry", "airport", "hotel", "trip", "itinerary"],
      text: "The Mexico Travel Hub maps route ideas, airports, cenotes, heritage sites, and official travel-planning links. It includes starting points for Mi Consulado passport appointments, the official FMM portal, and DHS Trusted Traveler programs such as SENTRI or Global Entry. Always verify requirements with official sources: https://teocuitlatl.com/travel.html"
    },
    {
      keys: ["tip", "tip jar", "donate", "donation", "support the creator", "xrp", "qr"],
      text: "The tip jar is on the medallion gallery page: https://teocuitlatl.com/gallery.html#support It is voluntary creator support only. It is not an investment, token sale, partner payment, or purchase of TOM, TEO, badges, or medallions."
    },
    {
      keys: ["coin", "medallion", "gallery", "vote", "sun", "moon", "silver", "gold", "calendar", "aztec", "quetzalcoatl", "quetzalcóatl", "olmec", "chichen", "chichén", "kukulkan", "muertos", "voladores"],
      text: "The coin art is commemorative concept art. The gallery now includes Sun, Moon, Tenochtitlán, Moctezuma, the Mexica Calendar, Quetzalcóatl, Olmec Head, Chichén Itzá, Día de Muertos, and Voladores de Papantla. Vote here: https://teocuitlatl.com/gallery.html"
    },
    {
      keys: ["moctezuma", "tenochtitlan", "tenochtitlán", "heritage"],
      text: "The heritage medallions are commemorative concept art: Tenochtitlán shows the lake city at full scale, while Moctezuma is framed as a dignified ruler motif. They are not legal tender or investment products. Vote here: https://teocuitlatl.com/gallery.html"
    },
    {
      keys: ["juarez", "juárez", "benito", "angel", "ángel", "independence", "eagle", "serpent", "snake", "nopal", "flag"],
      text: "The newer heritage concepts include Benito Juárez, Ángel de la Independencia, and Eagle and Nopal. They are commemorative medallion art only, not legal tender or investment products. Vote here: https://teocuitlatl.com/gallery.html"
    },
    {
      keys: ["legal", "investment", "buy", "sale", "returns", "security"],
      text: "Important: this is a prototype/testnet demonstration. Nothing here is investment advice, a securities offer, a promise of returns, legal tender, or a public token sale."
    },
    {
      keys: ["privacy", "data", "delete", "remove", "opt out", "opt-out", "reset"],
      text: "For privacy or data removal, visit https://teocuitlatl.com/privacy.html. To remove poll data from this browser, open the gallery and click Reset my vote: https://teocuitlatl.com/gallery.html#vote"
    }
  ];

  const responsesEs = [
    {
      keys: ["tom", "pago", "pagar", "estable", "peso", "tomín", "tomin"],
      text: "TOM es el concepto de flujo de pago: pagos sencillos con sensación estable para demostraciones y futuros pilotos. En este sitio, TOM se presenta como activo de prototipo en red de prueba, no como inversión ni moneda de curso legal."
    },
    {
      keys: ["teo", "oro", "recompensa", "recompensas", "ganar", "teōcuitlatl", "teocuitlatl"],
      text: "TEO es el concepto de recompensa por ruta. La idea: visitar lugares reales, completar rutas y recibir eventos visibles de recompensa. TEO aparece aquí como activo de demostración en red de prueba, no como promesa de ganancias."
    },
    {
      keys: ["insignia", "badge", "mic", "cen", "prueba", "comprobar"],
      text: "Las insignias prueban que estuviste ahí. MIC es la insignia de la ruta Michoacán / Lago de Pátzcuaro. CEN es la insignia del concepto Aventura de Cenotes en Cancún. Son conceptos de prueba para rutas completadas."
    },
    {
      keys: ["michoacan", "michoacán", "janitzio", "patzcuaro", "pátzcuaro", "estribo", "mirador"],
      text: "La ruta de Michoacán conecta Janitzio y El Estribo Grande, cerca del Lago de Pátzcuaro. El desbloqueo conceptual de la ruta es MIC: Insignia de Michoacán."
    },
    {
      keys: ["cancun", "cancún", "cenote", "cenotes", "aventura", "quintana"],
      text: "Aventura de Cenotes en Cancún es un concepto de ruta con varias paradas cerca de Cancún y Puerto Morelos. Está pensado para viajes repetibles, progreso de ruta y un momento grande de insignia CEN."
    },
    {
      keys: ["socio", "aliado", "patrocinador", "piloto", "hotel", "turismo", "comercio"],
      text: "Para aliados, Project Mexica se presenta como piloto comercial: patrocinios de ruta, campañas locales, activaciones turísticas y demostraciones de flujo de pago. No es una venta de tokens. Página de pilotos: https://teocuitlatl.com/es/partners.html"
    },
    {
      keys: ["viaje", "viajar", "mapa", "pasaporte", "fmm", "entrada", "aeropuerto", "hotel", "itinerario", "sentri"],
      text: "El Centro de Viajes por México reúne mapa, rutas, aeropuertos, cenotes, sitios patrimoniales y enlaces oficiales como Mi Consulado, INM/FMM y programas SENTRI/Global Entry. Consulta requisitos, cobertura y condiciones en fuentes oficiales .gob.mx: https://teocuitlatl.com/es/travel.html"
    },
    {
      keys: ["propina", "tip", "donar", "donación", "apoyar", "xrp", "qr"],
      text: "La propina voluntaria está en la galería: https://teocuitlatl.com/es/gallery.html#support Es apoyo al creador solamente. No es inversión, venta de tokens, pago de socio ni compra de TOM, TEO, insignias o medallones."
    },
    {
      keys: ["moneda", "medallón", "medallon", "galería", "galeria", "votar", "sol", "luna", "plata", "oro", "calendario", "azteca", "quetzalcoatl", "quetzalcóatl", "olmeca", "chichen", "chichén", "kukulkan", "muertos", "voladores"],
      text: "El arte de monedas es arte conceptual conmemorativo. La galería ya incluye Sol, Luna, Tenochtitlán, Moctezuma, Calendario Mexica, Quetzalcóatl, Cabeza Olmeca, Chichén Itzá, Día de Muertos y Voladores de Papantla. Vota aquí: https://teocuitlatl.com/es/gallery.html"
    },
    {
      keys: ["juarez", "juárez", "benito", "angel", "ángel", "independencia", "águila", "aguila", "serpiente", "nopal", "bandera"],
      text: "Los nuevos conceptos patrimoniales incluyen Benito Juárez, Ángel de la Independencia y Águila y Nopal. Son arte conmemorativo de medallón, no moneda de curso legal ni producto de inversión. Vota aquí: https://teocuitlatl.com/es/gallery.html"
    },
    {
      keys: ["legal", "inversión", "inversion", "comprar", "venta", "ganancias", "rendimiento", "retornos"],
      text: "Importante: esto es un prototipo en red de prueba. Nada aquí es consejo de inversión, oferta de valores, promesa de rendimientos, moneda de curso legal ni venta pública de tokens."
    },
    {
      keys: ["privacidad", "datos", "borrar", "eliminar", "remover", "opt out", "reset"],
      text: "Para privacidad o eliminación de datos, visita https://teocuitlatl.com/es/privacy.html. Para quitar tu voto desde este navegador, abre la galería y usa Reiniciar mi voto: https://teocuitlatl.com/es/gallery.html#vote"
    }
  ];

  const activeResponses = isSpanishPage ? responsesEs : responses;

  const starterMessages = isSpanishPage
    ? [
        "Bienvenido a Project Mexica. Puedo explicarte TOM, TEO, insignias, rutas, medallones, viajes o pilotos comerciales.",
        "Prueba: ¿Qué es TEO? ¿Cómo funcionan las insignias? ¿Qué ruta empieza en Cancún?"
      ]
    : [
        "Welcome to Project Mexica. I can explain TOM, TEO, badges, routes, medallions, or partner pilots.",
        "Try: What is TEO? How do badges work? What is the Cenote route?"
      ];

  const prompts = isSpanishPage
    ? ["¿Qué es TEO?", "¿Cómo funcionan las insignias?", "Ruta de cenotes", "Pilotos para socios"]
    : ["What is TEO?", "How do badges work?", "Cenote route", "Partner pilots"];

  function findReply(message) {
    const text = message.toLowerCase();
    const match = activeResponses.find(item => item.keys.some(key => text.includes(key)));
    if (match) return match.text;
    return null; // no FAQ match — caller falls through to /api/chat LLM endpoint
  }

  function appendLinkedText(node, text) {
    const pattern = /(\*\*[^*\n][\s\S]*?[^*\n]\*\*|https?:\/\/[^\s]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;
    let index = 0;
    let match;

    function appendFormatted(raw) {
      if (raw.startsWith("**") && raw.endsWith("**")) {
        const strongText = raw.slice(2, -2).trim();
        if (strongText) {
          const strong = document.createElement("strong");
          strong.textContent = strongText;
          node.append(strong);
        }
        return;
      }

      node.append(document.createTextNode(raw));
    }

    while ((match = pattern.exec(text))) {
      const raw = match[0];
      const start = match.index;

      if (start > index) {
        node.append(document.createTextNode(text.slice(index, start)));
      }

      if (raw.startsWith("**")) {
        appendFormatted(raw);
        index = start + raw.length;
        continue;
      }

      const clean = raw.replace(/[.,!?;:)\]]+$/g, "");
      const trailing = raw.slice(clean.length);
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
        <span>${isSpanishPage ? "¿Qué es TEO?" : "What is TEO?"}</span>
        <span>${isSpanishPage ? "Elige tus favoritos" : "Pick top 3 coins"}</span>
        <span>${isSpanishPage ? "Pilotos para socios" : "Partner pilots"}</span>
      </span>
      <span class="mexica-chat-coin" aria-hidden="true">
        <span class="mexica-chat-face front"><img src="${assetBase}/medallions/pyramid-sun-gold.png" alt=""></span>
        <span class="mexica-chat-face back"><img src="${assetBase}/medallions/pyramid-moon-silver.png" alt=""></span>
      </span>
    `;

    const panel = document.createElement("section");
    panel.className = "mexica-chat-panel";
    panel.setAttribute("aria-label", "Project Mexica guide");
    panel.innerHTML = `
      <header class="mexica-chat-header">
        <span class="mexica-chat-mini-coin" aria-hidden="true"><img src="${assetBase}/hero/forge-coin-cutout.png" alt=""></span>
        <span class="mexica-chat-title">
          <strong>Mexica Guide</strong>
          <span>${isSpanishPage ? "TOM paga. TEO recompensa. Las insignias prueban el camino." : "TOM pays. TEO rewards. Badges prove you were there."}</span>
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
        <input class="mexica-chat-input" type="text" autocomplete="off" placeholder="${isSpanishPage ? "Pregunta sobre rutas, insignias, TOM, TEO..." : "Ask about routes, badges, TOM, TEO..."}">
        <button class="mexica-chat-send" type="submit">${isSpanishPage ? "Enviar" : "Send"}</button>
      </form>
      <div class="mexica-chat-note">${isSpanishPage ? "Guía de prototipo. No es consejo financiero, consejo de inversión ni venta de tokens." : "Prototype guide. Not financial advice, not investment advice, and not a token sale."}</div>
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

    async function send(text) {
      const trimmed = text.trim();
      if (!trimmed) return;
      body.append(createMessage("user", trimmed));
      input.value = "";
      scrollToBottom(body);

      const ruleReply = findReply(trimmed);
      if (ruleReply !== null) {
        body.append(createMessage("bot", ruleReply));
        scrollToBottom(body);
        return;
      }

      // No FAQ match — fall through to LLM endpoint with streaming response.
      const thinkingMsg = createMessage("bot", "thinking…");
      thinkingMsg.classList.add("thinking");
      body.append(thinkingMsg);
      scrollToBottom(body);

      const fallbackText = "Sorry — the guide is unreachable right now. For direct questions, email hola@teocuitlatl.com.";

      try {
        const response = await fetch(chatApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed })
        });

        if (!response.ok || !response.body) {
          thinkingMsg.classList.remove("thinking");
          thinkingMsg.replaceChildren();
          appendLinkedText(thinkingMsg, fallbackText);
          scrollToBottom(body);
          return;
        }

        thinkingMsg.classList.remove("thinking");
        thinkingMsg.replaceChildren();

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let lineEnd;
          while ((lineEnd = buffer.indexOf("\n")) !== -1) {
            const line = buffer.slice(0, lineEnd).trim();
            buffer = buffer.slice(lineEnd + 1);
            if (!line.startsWith("data:")) continue;
            const payload = line.slice(5).trim();
            if (payload === "[DONE]") return;
            try {
              const json = JSON.parse(payload);
              if (json.error) {
                thinkingMsg.replaceChildren();
                appendLinkedText(thinkingMsg, fallbackText);
                scrollToBottom(body);
                return;
              }
              if (json.token) {
                accumulated += json.token;
                thinkingMsg.replaceChildren();
                appendLinkedText(thinkingMsg, accumulated);
                scrollToBottom(body);
              }
            } catch {
              // Ignore non-JSON payload chunks (keep-alives, comments).
            }
          }
        }

        if (!accumulated) {
          thinkingMsg.replaceChildren();
          appendLinkedText(thinkingMsg, fallbackText);
          scrollToBottom(body);
        }
      } catch (err) {
        thinkingMsg.classList.remove("thinking");
        thinkingMsg.replaceChildren();
        appendLinkedText(thinkingMsg, fallbackText);
        scrollToBottom(body);
      }
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
