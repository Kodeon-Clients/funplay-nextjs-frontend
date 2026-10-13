/* Form submission for standalone pages (campaign.html). Posts to /api/contact and follows the
   redirect the API returns. Adds reCAPTCHA v3 when <html data-recaptcha="..."> carries a site key. */
(function () {
  var key = document.documentElement.getAttribute("data-recaptcha");
  function token(action) {
    if (!key) return Promise.resolve(null);
    return new Promise(function (resolve) {
      function run() {
        window.grecaptcha.ready(function () {
          window.grecaptcha.execute(key, { action: action }).then(resolve, function () { resolve(null); });
        });
      }
      if (window.grecaptcha) return run();
      var s = document.createElement("script");
      s.src = "https://www.google.com/recaptcha/api.js?render=" + encodeURIComponent(key);
      s.onload = run;
      s.onerror = function () { resolve(null); };
      document.head.appendChild(s);
    });
  }
  function message(form, text) {
    var el = form.querySelector(".fp-err");
    if (!el) {
      el = document.createElement("p");
      el.className = "fp-err";
      el.setAttribute("role", "alert");
      form.appendChild(el);
    }
    el.textContent = text;
  }
  document.querySelectorAll("form[data-fp-standalone]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var btn = form.querySelector("[type=submit]");
      if (btn) btn.disabled = true;
      var fd = new FormData(form);
      fd.set("page_url", location.href);
      token("contact")
        .then(function (t) {
          if (t) fd.set("g-recaptcha-response", t);
          return fetch(form.getAttribute("action"), { method: "POST", body: fd, headers: { Accept: "application/json" } });
        })
        .then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (d) {
          if (d && d.ok) {
            window.location.href = d.redirect || "/thankyou.html";
            return;
          }
          message(form, (d && d.message) || "Something went wrong. Please call +91 902 830 2266.");
          if (btn) btn.disabled = false;
        })
        .catch(function () {
          message(form, "We could not send your message. Please check your connection or call +91 902 830 2266.");
          if (btn) btn.disabled = false;
        });
    });
  });
})();
