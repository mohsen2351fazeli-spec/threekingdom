const hed = document.querySelector(".header");

window.addEventListener("scroll", () => {
  if (window.scrollY > 0) {
    hed?.classList.add("h4");
    document.querySelector(".panel-btn")?.classList.add("t");
  } else {
    hed?.classList.remove("h4");
    document.querySelector(".panel-btn")?.classList.remove("t");
  }
});

// Panel
const pbtn = document.querySelector(".panel-btn");
const panel = document.querySelector(".panel");
const hola = document.querySelector(".hola");
const ca = document.querySelector(".ca");
const cb = document.querySelector(".cb");
const cc = document.querySelector(".cc");

const togglePanel = () => {
  panel?.classList.toggle("w0");
  pbtn?.classList.toggle("r12");
  hola?.classList.toggle("hidt");
  cb?.classList.toggle("hidt");
  ca?.classList.toggle("cat");
  cc?.classList.toggle("cct");
};

pbtn?.addEventListener("click", togglePanel);
hola?.addEventListener("click", togglePanel);

// AI chat UI
const titr = document.querySelector(".zhuge");
const titr2 = document.querySelector(".under-zhuge");
const inputdad = document.querySelector(".input-dad");
const input = document.querySelector(".ques");
const btn = document.querySelector(".send-btn");
const bodi = document.querySelector(".wwe");
const one = document.querySelector(".one");
const two = document.querySelector(".two");
const three = document.querySelector(".three");

const updateSendButton = () => {
  btn?.classList.toggle("o1", Boolean(input?.value.trim()));
};

input?.addEventListener("input", updateSendButton);

const go = () => {
  inputdad?.classList.add("bottom");
  titr?.classList.add("hidden");
  titr2?.classList.add("hidden");
};

// Keep exactly ONE .spy element, and always keep it as the LAST child.
const getSpy = () => {
  if (!bodi) return null;

  let spy = bodi.querySelector(".spy");

  if (!spy) {
    spy = document.createElement("div");
    spy.className = "spy";
  }

  bodi.appendChild(spy);
  return spy;
};

const scrollToSpy = () => {
  const spy = getSpy();
  spy?.scrollIntoView({ behavior: "smooth", block: "end" });
};

const appendMessage = (className, text = "") => {
  if (!bodi) return null;

  const message = document.createElement("div");
  message.className = className;
  message.textContent = text;
  bodi.appendChild(message);

  // Move the single spy to the end after every new message.
  getSpy();
  return message;
};

const setLoading = (loading) => {
  one?.classList.toggle("hidden", loading);
  two?.classList.toggle("hidden", loading);
  three?.classList.toggle("hidden", !loading);
  if (input) input.disabled = loading;
  if (btn) btn.disabled = loading;
};

// IMPORTANT: a frontend API key is visible to every site visitor.
// Use a restricted key only for temporary experiments, or move the request
// to your own backend/serverless function for real security.
const API_KEY = "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";
const MODEL = "openrouter:free";
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

const conversation = [];

const SYSTEM_PROMPT = `
نام این هوش مصنوعی zhugegbt است.

این سایت درباره دوران سه پادشاهی چین (Three Kingdoms) است.
موضوعات اصلی گفتگو شامل تاریخ، شخصیت‌ها، نبردها، سیاست‌ها، روابط و وقایع دوران سه پادشاهی است.

تو باید مانند ژوگه لیانگ (诸葛亮) صحبت کنی؛
یعنی پاسخ‌هایت خردمندانه، آرام، استراتژیک و متناسب با شخصیت ژوگه لیانگ باشد.

خودت را به عنوان یک هوش مصنوعی معرفی نکن، مگر اینکه کاربر مستقیماً درباره هویتت سؤال کند.
در پاسخ‌ها از لحن ژوگه لیانگ استفاده کن، اما اطلاعات تاریخی را تا حد ممکن دقیق و واقعی ارائه بده.

اگر کاربر درباره موضوعی خارج از دوران سه پادشاهی سؤال کرد، می‌توانی پاسخ بدهی، اما همچنان با لحن ژوگه لیانگ صحبت کن.

همیشه پاسخ را به زبان کاربر بده.
`.trim();

const chatWithAI = async () => {
  if (!API_KEY || API_KEY === "YOUR_OPENROUTER_API_KEY") {
    throw new Error("API key is not configured");
  }

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...conversation,
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter request failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("Empty AI response");
  }

  return content;
};

btn?.addEventListener("click", async () => {
  const userMessage = input?.value.trim();
  if (!userMessage || btn.disabled) return;

  go();
  setLoading(true);
  input.value = "";
  updateSendButton();

  appendMessage("right", userMessage);
  const pending = appendMessage("pending left");
  scrollToSpy();

  conversation.push({ role: "user", content: userMessage });

  try {
    const botReply = await chatWithAI();

    conversation.push({ role: "assistant", content: botReply });

    pending?.remove();
    const message = appendMessage("left");
    if (!message) return;

    // textContent prevents HTML/DOM injection from model output.
    let index = 0;
    const typeNextCharacter = () => {
      if (index >= botReply.length) {
        setLoading(false);
        scrollToSpy();
        return;
      }

      message.textContent += botReply[index++];
      scrollToSpy();
      window.setTimeout(typeNextCharacter, 10);
    };

    typeNextCharacter();
  } catch (error) {
    console.error("AI chat error:", error);
    pending?.remove();
    appendMessage("left", "خطایی در ارتباط با دستیار رخ داد. لطفاً دوباره تلاش کن.");
    setLoading(false);
    scrollToSpy();
  }
});

input?.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    btn?.click();
  }
});

// Make sure the container starts with exactly one spy at the end.
getSpy();
