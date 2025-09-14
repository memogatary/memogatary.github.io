
// Theme loader: apply saved theme as early as possible
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.documentElement.classList.add('theme-dark');
}


class SiteHeader extends HTMLElement {
  connectedCallback() { this.render(); }
  render() {
    this.innerHTML = `
      <header class="site-header">
        <nav class="nav container" aria-label="Primary">
          <div class="brand"><a href="/">Memogatary</a></div>
          <div class="menu" role="menubar">
            <a role="menuitem" href="/about/">About</a>

            <div class="dropdown" role="none">
              <button aria-haspopup="true" aria-expanded="false">Blog ▾</button>
              <div class="dropdown-panel" role="menu">
                <a role="menuitem" href="/blog/vi/"><strong>Vietnamese</strong><small>Bài viết tiếng Việt</small></a>
                <a role="menuitem" href="/blog/en/"><strong>English</strong><small>Posts in English</small></a>
                <a role="menuitem" href="/blog/"><strong>All</strong><small>Index of both</small></a>
              </div>
            </div>

            <div class="dropdown" role="none">
              <button aria-haspopup="true" aria-expanded="false">Languages ▾</button>
              <div class="dropdown-panel" role="menu">
                <a role="menuitem" href="/languages/chinese/"><strong>Chinese</strong><small>Vocabulary, Notes, FlashCards</small></a>
              </div>
            </div>

            <a role="menuitem" href="/watch/">Watch</a>
            <a role="menuitem" href="/contact/">Contact</a>

            <!-- THEME TOGGLE -->
            <div class="theme-control">
              <button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme"></button>
            </div>
          </div>
        </nav>
      </header>`;
    const btn = this.querySelector('#theme-toggle');
    const setIcon = () => {
      const dark = document.documentElement.classList.contains('theme-dark');
      btn.textContent = dark ? 'Theme: Dark ☀️' : 'Theme: Light 🌙';
      btn.title = dark ? 'Switch to light' : 'Switch to dark';
    };
    btn.addEventListener('click', () => {
      const el = document.documentElement;
      const dark = el.classList.toggle('theme-dark');
      localStorage.setItem('theme', dark ? 'dark' : 'light');
      setIcon();
    });
    setIcon();
  }
}
customElements.define('site-header', SiteHeader);

// --- Back-to-parent pill button (site-wide) ---
document.addEventListener("DOMContentLoaded", () => {
  // Normalize current path
  let path = location.pathname.replace(/\/index\.html$/i, "").replace(/\/+$/, "");
  if (path === "") path = "/";

  // Hide on the home page
  if (path === "/") return;

  // Compute parent path (e.g., /languages/chinese/hsk -> /languages/chinese/)
  const cut = path.lastIndexOf("/");
  let parentPath = cut > 0 ? path.slice(0, cut) : "/";
  if (parentPath.length > 1 && !parentPath.endsWith("/")) parentPath += "/";

  // Human label from the parent folder name
  const seg = parentPath.split("/").filter(Boolean).pop() || "home";
  const labelText =
    seg === "home"
      ? "Back to Home"
      : "Back to " + seg.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  // Build a pill-style button (Tailwind classes)
  const wrapper = document.createElement("a");
  wrapper.href = parentPath;
  wrapper.setAttribute("aria-label", labelText);
  wrapper.className = "container block mt-3"; // keep aligned with page content

  wrapper.innerHTML = `
    <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                 bg-slate-100 text-slate-700 hover:bg-slate-200
                 transition shadow-sm">
      <span aria-hidden="true">←</span>
      <span>${labelText}</span>
    </span>
  `;

  // Insert right under the site header (fallback: prepend to body)
  const headerEl = document.querySelector("site-header");
  if (headerEl) {
    headerEl.insertAdjacentElement("afterend", wrapper);
  } else {
    document.body.prepend(wrapper);
  }
});
