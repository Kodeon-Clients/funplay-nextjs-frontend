/*
  Play landing pages (builders & societies, schools) and their thank-you pages.
  - Enquiry form  -> POST /api/contact  -> /thank-you-<audience>-enquiry.html
  - Catalogue     -> POST /api/download (step=request: 6-digit code emailed; step=verify) -> /thank-you-<audience>-catalogue.html
  - Product range tabs, video player, photo lightbox, WhatsApp clicks.
  GTM dataLayer events: lp_enquiry_submit, lp_catalogue_code_sent, catalogue_download_verified,
  lp_thank_you, lp_whatsapp_click, lp_video (action: start | 50 | complete).
  reCAPTCHA v3 is used when <html data-recaptcha="<site key>"> is set, as on the rest of the site.
*/
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }
  function track(event, data) {
    window.dataLayer = window.dataLayer || [];
    var o = { event: event };
    for (var k in data || {}) o[k] = data[k];
    window.dataLayer.push(o);
  }
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function recaptcha(action) {
    var key = document.documentElement.getAttribute("data-recaptcha");
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

  function post(url, fd, action) {
    fd.append("page_url", window.location.href);
    return recaptcha(action)
      .then(function (t) {
        if (t) fd.set("g-recaptcha-response", t);
        return fetch(url, { method: "POST", body: fd, headers: { Accept: "application/json" }, credentials: "same-origin" });
      })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (d) {
          if (!res.ok || !d.ok) throw new Error((d && d.message) || "Something went wrong. Please try again.");
          return d;
        });
      })
      .catch(function (err) {
        var m = err && err.message;
        if (!m || m === "Failed to fetch" || /NetworkError|Load failed/i.test(m)) m = "We could not reach the server. Please check your connection and try again.";
        throw new Error(m);
      });
  }

  // ---------- validation ----------
  var RULES = {
    name: function (v) { return (v.length >= 2 && !/[0-9]/.test(v)) || "Please enter your name."; },
    phone: function (v) { return /^[6-9][0-9]{9}$/.test(v) || "Please enter a valid 10-digit mobile number."; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || "Please enter a valid email address."; },
    location: function (v) { return v.length >= 2 || "Please enter your city."; },
    state: function (v) { return v !== "" || "Please select your state."; },
    companyname: function (v) { return v.length >= 2 || "Please enter your company or society name."; },
    institutionname: function (v) { return v.length >= 2 || "Please enter your school name."; },
    typeOfProject: function (v) { return v !== "" || "Please tell us who you are."; },
    customerType: function (v) { return v !== "" || "Please tell us who you are."; },
    code: function (v) { return /^[0-9]{6}$/.test(v) || "Please enter the 6-digit code from the email."; },
  };
  function validate(form) {
    var first = null, msg = "";
    Object.keys(RULES).forEach(function (name) {
      var el = form.elements[name];
      if (!el || el.type === "hidden") return;
      var ok = RULES[name](String(el.value || "").trim());
      el.setAttribute("aria-invalid", ok === true ? "false" : "true");
      if (ok !== true && !first) { first = el; msg = ok; }
    });
    if (first) first.focus();
    return msg;
  }
  function setError(form, msg) {
    var p = form.querySelector("[data-pl-error]");
    if (p) p.textContent = msg || "";
  }
  function busy(form, on) {
    var b = form.querySelector('button[type="submit"]');
    if (b) b.disabled = !!on;
  }

  document.addEventListener("input", function (e) {
    var el = e.target;
    if (el && el.matches && el.matches("[data-pl-digits]")) el.value = el.value.replace(/[^0-9]/g, "");
    if (el && el.getAttribute && el.getAttribute("aria-invalid") === "true") el.setAttribute("aria-invalid", "false");
  });

  // ---------- enquiry form ----------
  function enquiry() {
    var form = document.querySelector("form[data-pl-enquiry]");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      setError(form, "");
      var msg = validate(form);
      if (msg) return setError(form, msg);
      var fd = new FormData(form);
      var role = String(fd.get("typeOfProject") || "");
      if (String(fd.get("comment") || "").trim().length < 2) fd.set("comment", "Landing page enquiry" + (role ? " (" + role + ")" : ""));
      busy(form, true);
      post(form.action, fd, "contact")
        .then(function (d) {
          track("lp_enquiry_submit", { lp_audience: audience(), lp_role: role });
          var to = d.redirect || form.elements.redirect.value || "/thank-you.html";
          window.location.href = to;
        })
        .catch(function (err) { setError(form, err.message); busy(form, false); });
    });
  }
  function audience() {
    var p = document.querySelector(".pl-page");
    return p && p.classList.contains("pl-schools") ? "schools" : "builders";
  }

  // ---------- dialogs ----------
  function openDialog(d) {
    if (!d) return;
    if (typeof d.showModal === "function") { if (!d.open) d.showModal(); }
    else d.setAttribute("open", "");
    document.documentElement.style.overflow = "hidden";
  }
  function closeDialog(d) {
    if (!d) return;
    if (typeof d.close === "function") d.close();
    else d.removeAttribute("open");
  }
  function dialogs() {
    document.querySelectorAll("dialog.pl-dialog, dialog.pl-lightbox").forEach(function (d) {
      d.addEventListener("close", function () { document.documentElement.style.overflow = ""; });
      d.addEventListener("click", function (e) {
        if (e.target === d || (e.target.closest && e.target.closest("[data-pl-close]"))) closeDialog(d);
      });
    });
  }

  // ---------- catalogue with email code ----------
  function catalogue() {
    var d = document.getElementById("pl-catalogue");
    if (!d) return;
    var req = d.querySelector("form[data-pl-cat-request]");
    var ver = d.querySelector("form[data-pl-cat-verify]");
    var intro = d.querySelector("[data-pl-cat-intro]");
    var introText = intro ? intro.textContent : "";

    function open(e) {
      if (e) e.preventDefault();
      openDialog(d);
      var first = (ver.hidden ? req : ver).querySelector("input:not([type=hidden]):not([tabindex='-1'])");
      if (first) setTimeout(function () { first.focus(); }, 50);
    }
    document.addEventListener("click", function (e) {
      var t = e.target.closest && e.target.closest("[data-pl-catalogue]");
      if (t) open(e);
    });
    if (window.location.hash === "#catalogue") setTimeout(open, 300);

    req.addEventListener("submit", function (e) {
      e.preventDefault();
      setError(req, "");
      var msg = validate(req);
      if (msg) return setError(req, msg);
      busy(req, true);
      post(req.action, new FormData(req), "download")
        .then(function (r) {
          track("lp_catalogue_code_sent", { lp_audience: d.getAttribute("data-audience") });
          req.hidden = true;
          ver.hidden = false;
          busy(req, false);
          if (intro) intro.textContent = "Almost there. Check your inbox (and the spam folder).";
          ver.querySelector("[data-pl-code-msg]").textContent = r.message || "We have emailed you a 6-digit code.";
          ver.elements.code.value = "";
          ver.elements.code.focus();
        })
        .catch(function (err) { setError(req, err.message); busy(req, false); });
    });

    ver.addEventListener("submit", function (e) {
      e.preventDefault();
      setError(ver, "");
      var msg = validate(ver);
      if (msg) return setError(ver, msg);
      busy(ver, true);
      post(ver.action, new FormData(ver), "download")
        .then(function () {
          track("catalogue_download_verified", { lp_audience: d.getAttribute("data-audience") });
          try { sessionStorage.setItem("pl_dl", "1"); } catch (x) { /* storage blocked: the thank-you page still has the button */ }
          window.location.href = d.getAttribute("data-thank-you");
        })
        .catch(function (err) { setError(ver, err.message); busy(ver, false); });
    });

    d.querySelector("[data-pl-restart]").addEventListener("click", function () {
      ver.hidden = true;
      req.hidden = false;
      setError(ver, "");
      if (intro) intro.textContent = introText;
      req.elements.email.focus();
    });
  }

  // ---------- range tabs ----------
  function tabs() {
    document.querySelectorAll("[data-pl-tabs]").forEach(function (root) {
      var btns = Array.prototype.slice.call(root.querySelectorAll("[data-pl-tab]"));
      function select(b, focus) {
        btns.forEach(function (x) {
          var on = x === b;
          x.setAttribute("aria-selected", on ? "true" : "false");
          x.tabIndex = on ? 0 : -1;
          var p = root.querySelector('[data-pl-panel="' + x.getAttribute("data-pl-tab") + '"]');
          if (p) p.hidden = !on;
        });
        if (focus) b.focus();
      }
      btns.forEach(function (b, i) {
        b.addEventListener("click", function () { select(b); });
        b.addEventListener("keydown", function (e) {
          var n = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
          if (!n) return;
          e.preventDefault();
          select(btns[(i + n + btns.length) % btns.length], true);
        });
      });
    });
  }

  // ---------- hero loop ----------
  function hero() {
    var v = document.querySelector("[data-pl-hero-video]");
    if (!v) return;
    var saveData = navigator.connection && navigator.connection.saveData;
    if (reduceMotion || saveData) { v.pause(); v.removeAttribute("autoplay"); v.style.display = "none"; return; }
    var p = v.play && v.play();
    if (p && p.catch) p.catch(function () { /* autoplay blocked: the photo underneath stays */ });
  }

  // ---------- video player ----------
  function fmt(s) {
    s = Math.max(0, Math.floor(s || 0));
    return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2);
  }
  function player() {
    var box = document.querySelector("[data-pl-player]");
    if (!box) return;
    var v = box.querySelector("video");
    var seek = box.querySelector('[data-pl-v="seek"]');
    var time = box.querySelector("[data-pl-time]");
    var sound = box.querySelector('[data-pl-v="mute"]');
    var soundLabel = box.querySelector("[data-pl-sound-label]");
    var playBtn = box.querySelector('[data-pl-v="play"]');
    var userPaused = false, seeking = false, sent = {};

    function icons() {
      var playing = !v.paused && !v.ended;
      playBtn.querySelector('[data-pl-icon="play"]').style.display = playing ? "none" : "";
      playBtn.querySelector('[data-pl-icon="pause"]').style.display = playing ? "" : "none";
      playBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
    }
    function progress() {
      var d = v.duration || 0;
      var pct = d ? (v.currentTime / d) * 100 : 0;
      if (!seeking) seek.value = String(Math.round(pct * 10));
      seek.style.setProperty("--pl-p", pct + "%");
      time.textContent = fmt(v.currentTime) + (d ? " / " + fmt(d) : "");
      if (pct >= 50 && !sent.half) { sent.half = 1; track("lp_video", { lp_audience: audience(), video_action: "50" }); }
    }
    function play() { var p = v.play(); if (p && p.catch) p.catch(function () {}); }

    v.addEventListener("play", function () { icons(); if (!sent.start) { sent.start = 1; track("lp_video", { lp_audience: audience(), video_action: "start" }); } });
    v.addEventListener("pause", icons);
    v.addEventListener("ended", function () { icons(); if (!sent.end) { sent.end = 1; track("lp_video", { lp_audience: audience(), video_action: "complete" }); } });
    v.addEventListener("timeupdate", progress);
    v.addEventListener("loadedmetadata", progress);
    v.addEventListener("click", function () { if (v.paused) { userPaused = false; play(); } else { userPaused = true; v.pause(); } });

    box.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("button[data-pl-v]");
      if (!b) return;
      var a = b.getAttribute("data-pl-v");
      if (a === "play") { if (v.paused) { userPaused = false; play(); } else { userPaused = true; v.pause(); } }
      else if (a === "back") v.currentTime = Math.max(0, v.currentTime - 10);
      else if (a === "fwd") v.currentTime = Math.min(v.duration || 0, v.currentTime + 10);
      else if (a === "mute") {
        v.muted = !v.muted;
        sound.setAttribute("aria-pressed", v.muted ? "false" : "true");
        soundLabel.textContent = v.muted ? "Tap for sound" : "Sound on";
        if (!v.muted && v.paused) { userPaused = false; play(); }
      } else if (a === "fs") {
        if (document.fullscreenElement) document.exitFullscreen();
        else if (box.requestFullscreen) box.requestFullscreen();
        else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
      }
    });
    seek.addEventListener("input", function () {
      seeking = true;
      if (v.duration) v.currentTime = (Number(seek.value) / 1000) * v.duration;
      seek.style.setProperty("--pl-p", Number(seek.value) / 10 + "%");
    });
    seek.addEventListener("change", function () { seeking = false; });

    // plays muted while at least half of it is on screen, pauses when scrolled away
    if ("IntersectionObserver" in window && !reduceMotion) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && en.intersectionRatio >= 0.5) { if (!userPaused) play(); }
          else if (!v.paused) v.pause();
        });
      }, { threshold: [0, 0.5] }).observe(box);
    }
    icons();
  }

  // ---------- photo lightbox ----------
  function lightbox() {
    var d = document.getElementById("pl-lightbox");
    if (!d) return;
    var img = d.querySelector("[data-pl-lb-img]");
    var cap = d.querySelector("[data-pl-lb-cap]");
    var list = [], idx = 0;
    function show(i) {
      idx = (i + list.length) % list.length;
      var t = list[idx];
      img.src = t.getAttribute("data-pl-zoom");
      img.alt = (t.querySelector("img") || {}).alt || "";
      cap.textContent = t.getAttribute("data-caption") || "";
    }
    document.addEventListener("click", function (e) {
      var t = e.target.closest && e.target.closest("[data-pl-zoom]");
      if (!t) return;
      list = Array.prototype.slice.call(document.querySelectorAll('li:not([aria-hidden="true"]) > [data-pl-zoom]'));
      var at = list.indexOf(t);
      if (at < 0) { // a copy in the looping strip: open the original with the same photo
        var src = t.getAttribute("data-pl-zoom");
        at = list.findIndex(function (x) { return x.getAttribute("data-pl-zoom") === src; });
      }
      show(Math.max(0, at));
      openDialog(d);
    });
    d.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("[data-pl-lb]");
      if (b) show(idx + Number(b.getAttribute("data-pl-lb")));
    });
    d.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") show(idx + 1);
      if (e.key === "ArrowLeft") show(idx - 1);
    });
  }

  // ---------- thank-you pages ----------
  function thanks() {
    var page = document.querySelector("[data-pl-thanks]");
    if (!page) return;
    var kind = page.getAttribute("data-pl-thanks");
    track("lp_thank_you", { lp_audience: page.getAttribute("data-audience"), lp_conversion: kind });
    var file = page.getAttribute("data-download");
    if (kind !== "catalogue" || !file) return;
    var fresh = false;
    try { fresh = sessionStorage.getItem("pl_dl") === "1"; sessionStorage.removeItem("pl_dl"); } catch (x) { /* ignore */ }
    if (!fresh) return; // only straight after a verified request, not on every visit
    setTimeout(function () {
      var a = document.createElement("a");
      a.href = file;
      a.download = "";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }, 700);
  }

  // ---------- misc ----------
  function misc() {
    document.addEventListener("click", function (e) {
      var w = e.target.closest && e.target.closest("[data-pl-wa]");
      if (w) track("lp_whatsapp_click", { lp_audience: audience() });
      var q = e.target.closest && e.target.closest('a[href="#enquiry"]');
      if (q) {
        var f = document.getElementById("en-name");
        if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, reduceMotion ? 0 : 500);
      }
    });
  }

  ready(function () {
    dialogs();
    enquiry();
    catalogue();
    tabs();
    hero();
    player();
    lightbox();
    thanks();
    misc();
    document.documentElement.setAttribute("data-pl-ready", "");
  });
})();
