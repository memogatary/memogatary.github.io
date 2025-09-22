// ==============================
// Newsletter-enabled footer
// ==============================

// 0) Shared motto (brand signature)
const MOTTO = '“Small steps, big journeys. Keep learning, keep moving.”';

// 1) SET THIS ONCE:
const NEWSLETTER_ACTION_URL = 'https://script.google.com/macros/s/AKfycbyE4VpzbFWeGKSv4CC8suUB7on7fx7Awq7ZBzAoIXid4I0VAlMVigGTsEd0qYI4wpLM-A/exec';

// 2) Classic footer
class SiteFooter extends HTMLElement {
  connectedCallback() { this.render(); }
  render() {
    const year = new Date().getFullYear();
    this.innerHTML = `
      <footer class="site-footer">
        <div class="container row">
          <div>© ${year} Memogatary · <a href="/about/">About</a></div>
          <div>
            <span style="font-style:italic; color:var(--muted);">
              ${MOTTO}
            </span>
            &nbsp;· <a href="/contact/">Say hi</a>.
          </div>
        </div>
      </footer>`;
  }
}

// 3) Footer WITH newsletter form (wired to Apps Script)
class SiteFooterNewsletter extends HTMLElement {
  connectedCallback() {
    this.render();
    // Avoid double-binding if this custom element is reconnected
    if (this.__wired) return;
    this.__wired = true;

    const form = this.querySelector('form.newsletter');
    const btn = form.querySelector('button[type="submit"]');
    const msg = this.querySelector('#nl-msg');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = form.email.value.trim().toLowerCase();
      const name = (form.name?.value || '').trim();

      if (!email) {
        msg.textContent = 'Please enter your email.';
        msg.dataset.state = 'error';
        return;
      }

      // UI: loading
      btn.disabled = true;
      btn.dataset.loading = '1';
      msg.textContent = 'Submitting…';
      msg.dataset.state = 'pending';

      try {
        const res = await fetch(NEWSLETTER_ACTION_URL, {
          method: 'POST',
          // No custom headers => no preflight. Apps Script will still read e.postData.contents.
          body: JSON.stringify({ email, name })
        });

        // Apps Script returns JSON for doPost; if deployment is correct, this will parse fine
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.ok) {
          msg.textContent = data.message || 'Subscribed! Please check your inbox.';
          msg.dataset.state = 'ok';
          form.reset();
        } else {
          // Show helpful message if we can
          msg.textContent = data.error || `Something went wrong (HTTP ${res.status}).`;
          msg.dataset.state = 'error';
        }
      } catch (err) {
        msg.textContent = 'Network error. Please try again.';
        msg.dataset.state = 'error';
      } finally {
        btn.disabled = false;
        btn.dataset.loading = '';
      }
    });
  }

  render() {
    const year = new Date().getFullYear();
    this.innerHTML = `
      <footer class="site-footer">
        <div class="container row two">
          <div>
            <strong>Nhận tin mới · Stay in the loop</strong>
            <p class="muted">Không spam — chỉ dùng cho những cập nhật quan trọng từ Memogatary</p>

            <form class="newsletter" novalidate>
              <label class="sr-only" for="nl-name">Name</label>
              <input id="nl-name" name="name" type="text" placeholder="Tên / Name" />

              <label class="sr-only" for="nl-email">Email</label>
              <input id="nl-email" name="email" type="email" placeholder="email@example.com" required />

              <button type="submit">Đăng ký · Subscribe</button>
              <p id="nl-msg" class="nl-msg" aria-live="polite"></p>
            </form>
          </div>

          <div style="align-self:end; text-align:right;">
            <div style="font-style:italic; color:var(--muted); margin-bottom:.35rem;">
              ${MOTTO}
            </div>
            <div>© ${year} Memogatary</div>
            <div><a href="/about/">About</a> · <a href="/contact/">Contact</a></div>
          </div>
        </div>
      </footer>`;
  }
}

customElements.define('site-footer', SiteFooter);
customElements.define('site-footer-newsletter', SiteFooterNewsletter);
