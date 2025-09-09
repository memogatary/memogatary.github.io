
class SiteFooter extends HTMLElement {
  connectedCallback() { this.render(); }
  render() {
    const year = new Date().getFullYear();
    this.innerHTML = `
      <footer class="site-footer">
        <div class="container row">
          <div>© ${year} Memogatary · <a href="/about/">About</a></div>
          <div>Built with vanilla HTML + web components. <a href="/contact/">Say hi</a>.</div>
        </div>
      </footer>`;
  }
}

class SiteFooterNewsletter extends HTMLElement {
  connectedCallback() { this.render(); }
  render() {
    const year = new Date().getFullYear();
    this.innerHTML = `
      <footer class="site-footer">
        <div class="container row two">
          <div>
            <strong>Stay in the loop</strong>
            <p class="muted">No spam. Occasional updates from the lab & language desk.</p>
            <form class="newsletter" action="#" method="post" onsubmit="event.preventDefault(); alert('This is a placeholder. Hook up to Google Apps Script when ready.');">
              <label class="sr-only" for="email">Email</label>
              <input id="email" name="email" type="email" placeholder="you@example.com" required>
              <button type="submit">Subscribe</button>
            </form>
          </div>
          <div style="align-self:end; text-align:right;">
            <div>© ${year} Memogatary</div>
            <div><a href="/about/">About</a> · <a href="/contact/">Contact</a></div>
          </div>
        </div>
      </footer>`;
  }
}

customElements.define('site-footer', SiteFooter);
customElements.define('site-footer-newsletter', SiteFooterNewsletter);
