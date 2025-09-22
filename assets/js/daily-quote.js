const DATA_URL = "/assets/data/quotes.json";

// ====== SETTINGS ======
const USE_MOUNTAIN_TIME = true; // lock to Mountain Time
const MOUNTAIN_TZ = "America/Denver";

// ====== HELPERS ======
function getDateKey() {
  if (!USE_MOUNTAIN_TIME) {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
  }
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: MOUNTAIN_TZ, year:"numeric", month:"2-digit", day:"2-digit"
  });
  const parts = Object.fromEntries(fmt.formatToParts(new Date()).map(p => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function hashToIndex(str, mod) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
  return (h >>> 0) % mod;
}

function msUntilNextMidnight() {
  if (!USE_MOUNTAIN_TIME) {
    const now = new Date();
    const next = new Date(now); next.setHours(24,0,0,0);
    return next - now;
  }
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: MOUNTAIN_TZ, year:"numeric", month:"2-digit", day:"2-digit"
  });
  const parts = Object.fromEntries(fmt.formatToParts(now).map(p => [p.type, p.value]));
  const y = +parts.year, m = +parts.month, d = +parts.day;
  const nextLocalMidnight = new Date(Date.UTC(y, m-1, d+1, 0, 0, 0));
  const tzNow = new Date(now.toLocaleString("en-US", { timeZone: MOUNTAIN_TZ }));
  const offsetMin = tzNow.getTimezoneOffset();
  const nextMidnightUTC = new Date(nextLocalMidnight.getTime() + offsetMin*60*1000);
  return nextMidnightUTC - now;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;'}[c]));
}

// ====== RENDER ======
async function showDailyQuote() {
  try {
    const resp = await fetch(DATA_URL, { cache: "no-cache" });
    const quotes = await resp.json();
    if (!Array.isArray(quotes) || quotes.length === 0) throw new Error("No quotes found");

    const key = getDateKey();
    const idx = hashToIndex(key, quotes.length);
    const { text, author } = quotes[idx];

    const mount = document.getElementById("daily-quote");
    if (mount) {
      mount.innerHTML = `
        <div class="card" style="padding:1.2rem; text-align:center;">
          <div style="text-align:right; font-size:0.85rem; margin-bottom:0.6rem;">
            Today's motivational quote:
          </div>
          <div style="font-weight:700; font-size:1.3rem; margin-bottom:0.4rem;">
            “${escapeHtml(text)}”
          </div>
          <div style="text-align:left; font-size:0.9rem; font-style:italic;">
            — ${escapeHtml(author || "Unknown")}
          </div>
        </div>
      `;
    }
  } catch (e) {
    console.warn("Daily quote failed:", e);
  }
}

// First load + refresh at next midnight
showDailyQuote();
setTimeout(() => {
  showDailyQuote();
  setInterval(showDailyQuote, 24*60*60*1000);
}, msUntilNextMidnight());
