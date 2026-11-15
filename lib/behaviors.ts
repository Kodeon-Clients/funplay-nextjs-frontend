/*
  Client-side behaviours for the server-rendered theme markup. This replaces jQuery,
  Bootstrap JS, Magnific Popup and the theme's main.js with small vanilla handlers that
  toggle the same classes the original CSS expects.
*/

import type { SwiperOptions } from "swiper/types";

type Cleanup = () => void;

const qs = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const qsa = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));
const isDesktop = () => window.innerWidth > 991;

/* ---------------------------------------------------------------- header */
function header(): Cleanup {
  const head = qs("header");
  const nav = qs<HTMLElement>("header nav.navbar");
  if (!head || !nav) return () => {};
  const topSpace = () => {
    if (head.classList.contains("sticky")) return;
    const h = nav.offsetHeight;
    qsa(".top-space-margin").forEach((el) => (el.style.marginTop = h + "px"));
    qsa(".top-space-padding").forEach((el) => (el.style.paddingTop = h + "px"));
  };
  let timer: number | undefined;
  const onScroll = () => {
    const t = window.scrollY;
    const i = nav.offsetHeight;
    if (t >= i) head.classList.add("sticky");
    else head.classList.remove("sticky");
    window.clearTimeout(timer);
    if (t > i + 150) timer = window.setTimeout(() => head.classList.add("sticky-active"), 300);
    else if (t < i) timer = window.setTimeout(() => head.classList.remove("sticky-active"), 300);
    if (t <= 0) window.setTimeout(topSpace, 300);
  };
  topSpace();
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", topSpace);

  // mobile menu (Bootstrap collapse replacement)
  const toggler = qs<HTMLButtonElement>(".navbar-toggler", nav);
  const menu = qs<HTMLElement>("#navbarNav");
  const onToggle = () => {
    if (!menu || !toggler) return;
    const open = !menu.classList.contains("show");
    menu.classList.toggle("show", open);
    toggler.classList.toggle("collapsed", !open);
    toggler.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("navbar-collapse-show", open);
  };
  toggler?.addEventListener("click", onToggle);

  // dropdowns: hover on desktop, tap the arrow on mobile
  const drops = qsa<HTMLElement>(".navbar-nav .dropdown");
  const enter = (e: Event) => isDesktop() && (e.currentTarget as HTMLElement).classList.add("open");
  const leave = (e: Event) => isDesktop() && (e.currentTarget as HTMLElement).classList.remove("open");
  drops.forEach((d) => {
    d.addEventListener("mouseenter", enter);
    d.addEventListener("mouseleave", leave);
    const tog = qs<HTMLElement>(".dropdown-toggle", d);
    const dm = qs<HTMLElement>(".dropdown-menu", d);
    const flip = (ev: Event) => {
      if (ev instanceof KeyboardEvent && ev.key !== "Enter" && ev.key !== " ") return;
      ev.preventDefault();
      const open = !dm?.classList.contains("show");
      dm?.classList.toggle("show", open);
      tog?.classList.toggle("show", open);
      d.classList.toggle("open", open);
      tog?.setAttribute("aria-expanded", String(open));
    };
    tog?.addEventListener("click", flip);
    tog?.addEventListener("keydown", flip);
  });
  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", topSpace);
    toggler?.removeEventListener("click", onToggle);
  };
}

/* ---------------------------------------------------------------- search */
type SearchItem = { t: string; u: string; k?: string };
let searchIndex: SearchItem[] | null = null;
async function loadIndex() {
  if (searchIndex) return searchIndex;
  try {
    const r = await fetch("/search-index.json");
    searchIndex = (await r.json()) as SearchItem[];
  } catch {
    searchIndex = [];
  }
  return searchIndex;
}
export function searchItems(items: SearchItem[], q: string, limit = 8) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return items
    .map((it) => {
      const hay = (it.t + " " + (it.k || "")).toLowerCase();
      let score = 0;
      for (const w of words) {
        if (!hay.includes(w)) return null;
        score += it.t.toLowerCase().startsWith(w) ? 3 : 1;
      }
      return { it, score };
    })
    .filter(Boolean)
    .sort((a, b) => b!.score - a!.score)
    .slice(0, limit)
    .map((x) => x!.it);
}
function search(): Cleanup {
  const open = (e: Event) => {
    const t = (e.target as HTMLElement).closest(".search-form-icon");
    if (t) {
      e.preventDefault();
      document.body.classList.add("show-search-popup");
      window.setTimeout(() => qs<HTMLInputElement>("#search-form-input")?.focus(), 200);
      loadIndex();
    }
    if ((e.target as HTMLElement).closest(".search-close")) {
      e.preventDefault();
      document.body.classList.remove("show-search-popup");
    }
  };
  document.addEventListener("click", open);
  const input = qs<HTMLInputElement>("#search-form-input");
  const box = qs<HTMLElement>("#suggestions");
  const onInput = async () => {
    if (!input || !box) return;
    const items = searchItems(await loadIndex(), input.value);
    box.replaceChildren();
    for (const it of items) {
      const a = document.createElement("a");
      a.href = it.u;
      a.textContent = it.t;
      box.appendChild(a);
    }
  };
  input?.addEventListener("input", onInput);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") document.body.classList.remove("show-search-popup");
  };
  document.addEventListener("keydown", onKey);
  return () => {
    document.removeEventListener("click", open);
    document.removeEventListener("keydown", onKey);
    input?.removeEventListener("input", onInput);
  };
}

/** Build an element tree without HTML strings: el("div", { class: "x" }, child, "text"). */
function el(tag: string, attrs: Record<string, string> = {}, ...kids: (Node | string)[]): HTMLElement {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  n.append(...kids);
  return n;
}

/* ---------------------------------------------------------------- popup (Magnific markup) */
function popups(): Cleanup {
  let current: { el: HTMLElement; parent: Node; next: Node | null; wrap: HTMLElement; bg: HTMLElement; last: Element | null } | null = null;
  const close = () => {
    if (!current) return;
    const { el, parent, next, wrap, bg, last } = current;
    el.classList.add("mfp-hide");
    parent.insertBefore(el, next);
    wrap.remove();
    bg.remove();
    document.documentElement.style.overflow = "";
    document.documentElement.style.marginRight = "";
    (last as HTMLElement | null)?.focus?.();
    current = null;
  };
  const openPopup = (target: HTMLElement, trigger: Element | null) => {
    if (current) close();
    const parent = target.parentNode!;
    const next = target.nextSibling;
    const bg = document.createElement("div");
    bg.className = "mfp-bg mfp-ready";
    const wrap = document.createElement("div");
    wrap.className = "mfp-wrap mfp-close-btn-in mfp-auto-cursor mfp-ready";
    wrap.tabIndex = -1;
    wrap.style.cssText = "overflow-x:hidden;overflow-y:auto;";
    wrap.append(el("div", { class: "mfp-container mfp-s-ready mfp-inline-holder" }, el("div", { class: "mfp-content" }), el("div", { class: "mfp-preloader" }, "Loading...")));
    const content = qs<HTMLElement>(".mfp-content", wrap)!;
    target.classList.remove("mfp-hide");
    content.appendChild(target);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mfp-close";
    btn.title = "Close (Esc)";
    btn.setAttribute("aria-label", "Close");
    btn.textContent = "×";
    target.appendChild(btn);
    document.body.append(bg, wrap);
    const sw = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = "hidden";
    if (sw) document.documentElement.style.marginRight = sw + "px";
    current = { el: target, parent, next, wrap, bg, last: trigger };
    wrap.addEventListener("click", (e) => {
      const t = e.target as HTMLElement;
      if (t.classList.contains("mfp-close") || t.classList.contains("mfp-container") || t === wrap) {
        btn.remove();
        close();
      }
    });
    if (isDesktop()) window.setTimeout(() => qs<HTMLInputElement>("input[name=name]", target)?.focus(), 50);
  };
  const onClick = (e: Event) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a.popup-with-form, a[href='#contact-form']");
    if (!a) return;
    const id = (a.getAttribute("href") || "#contact-form").slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    openPopup(target, a);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape" && current) {
      qs(".mfp-close", current.el)?.remove();
      close();
    }
  };
  document.addEventListener("click", onClick);
  document.addEventListener("keydown", onKey);
  return () => {
    document.removeEventListener("click", onClick);
    document.removeEventListener("keydown", onKey);
  };
}

/* ---------------------------------------------------------------- collapse / accordion / tabs */
function collapse(): Cleanup {
  const onClick = (e: Event) => {
    const trig = (e.target as HTMLElement).closest<HTMLElement>("[data-bs-toggle='collapse']");
    if (!trig || trig.classList.contains("navbar-toggler")) return;
    const sel = trig.getAttribute("data-bs-target") || trig.getAttribute("href");
    if (!sel || sel === "#") return;
    const panel = document.querySelector<HTMLElement>(sel);
    if (!panel) return;
    e.preventDefault();
    const parentSel = panel.getAttribute("data-bs-parent") || trig.getAttribute("data-bs-parent");
    const opening = !panel.classList.contains("show");
    const setState = (p: HTMLElement, open: boolean) => {
      p.classList.toggle("show", open);
      const t = document.querySelector<HTMLElement>(`[data-bs-target='#${p.id}']`);
      t?.setAttribute("aria-expanded", String(open));
      t?.classList.toggle("collapsed", !open);
      const acc = p.closest(".accordion") as HTMLElement | null;
      const item = p.closest(".accordion-item");
      item?.classList.toggle("active-accordion", open);
      const icon = t?.querySelector("i.feather, i[class*='icon-feather']");
      if (acc && icon) {
        const on = acc.dataset.activeIcon || "icon-feather-chevron-up";
        const off = acc.dataset.inactiveIcon || "icon-feather-chevron-down";
        icon.classList.toggle(on, open);
        icon.classList.toggle(off, !open);
      }
    };
    if (parentSel && opening) {
      const parent = document.querySelector(parentSel);
      if (parent) qsa<HTMLElement>(".collapse.show", parent).forEach((p) => { if (p !== panel) setState(p, false); });
    }
    setState(panel, opening);
  };
  const onTab = (e: Event) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>("[data-bs-toggle='tab'], [data-bs-toggle='pill']");
    if (!t) return;
    e.preventDefault();
    const sel = t.getAttribute("data-bs-target") || t.getAttribute("href");
    const pane = sel ? document.querySelector<HTMLElement>(sel) : null;
    const list = t.closest(".nav");
    if (list) qsa(".active", list).forEach((x) => x.classList.remove("active"));
    t.classList.add("active");
    if (pane?.parentElement) {
      qsa(":scope > .tab-pane", pane.parentElement).forEach((p) => p.classList.remove("active", "show"));
      pane.classList.add("active", "show");
    }
  };
  document.addEventListener("click", onClick);
  document.addEventListener("click", onTab);
  return () => {
    document.removeEventListener("click", onClick);
    document.removeEventListener("click", onTab);
  };
}

/* ---------------------------------------------------------------- product gallery (Bootstrap carousel) */
/** Enable or disable a slider arrow (button or link). */
function setArrow(btn: Element | null | undefined, off: boolean) {
  if (!btn) return;
  btn.classList.toggle("fp-arrow-disabled", off);
  if (off) btn.setAttribute("aria-disabled", "true");
  else btn.removeAttribute("aria-disabled");
  if (btn instanceof HTMLButtonElement) btn.disabled = off;
  else if (btn instanceof HTMLElement) {
    if (off && !btn.hasAttribute("data-fp-tab")) {
      btn.setAttribute("data-fp-tab", btn.getAttribute("tabindex") ?? "");
      btn.tabIndex = -1;
    } else if (!off && btn.hasAttribute("data-fp-tab")) {
      const t = btn.getAttribute("data-fp-tab");
      if (t) btn.setAttribute("tabindex", t);
      else btn.removeAttribute("tabindex");
      btn.removeAttribute("data-fp-tab");
    }
  }
}

const carouselUpdaters = new WeakMap<HTMLElement, () => void>();

function carousels(): Cleanup {
  const offs: Cleanup[] = [];
  qsa<HTMLElement>(".carousel").forEach((car) => {
    const inner = qs<HTMLElement>(".carousel-inner", car);
    if (!inner) return;
    const items = () => qsa<HTMLElement>(".carousel-item", inner);
    // looping (the default) wraps around; data-bs-wrap="false" stops at the first and last slide
    const wrap = car.getAttribute("data-bs-wrap") !== "false";
    const prev = qs(".carousel-control-prev", car);
    const next = qs(".carousel-control-next", car);
    const update = () => {
      const list = items();
      const cur = Math.max(0, list.findIndex((i) => i.classList.contains("active")));
      const single = list.length < 2;
      setArrow(prev, single || (!wrap && cur === 0));
      setArrow(next, single || (!wrap && cur === list.length - 1));
    };
    const go = (dir: number) => {
      const list = items();
      if (list.length < 2) return;
      const cur = list.findIndex((i) => i.classList.contains("active"));
      let nxt = cur + dir;
      if (wrap) nxt = (nxt + list.length) % list.length;
      else if (nxt < 0 || nxt >= list.length) return;
      list[cur]?.classList.remove("active");
      list[nxt].classList.add("active");
      update();
    };
    update();
    carouselUpdaters.set(inner, update);
    const p = (e: Event) => { e.preventDefault(); go(-1); };
    const n = (e: Event) => { e.preventDefault(); go(1); };
    prev?.addEventListener("click", p);
    next?.addEventListener("click", n);
    // swipe on touch screens
    let x0 = 0;
    const ts = (e: TouchEvent) => (x0 = e.touches[0].clientX);
    const te = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    };
    car.addEventListener("touchstart", ts, { passive: true });
    car.addEventListener("touchend", te);
    offs.push(() => { prev?.removeEventListener("click", p); next?.removeEventListener("click", n); });
  });
  // colour swatches swap the gallery images
  const onColour = (e: Event) => {
    const opt = (e.target as HTMLElement).closest<HTMLElement>(".color-option");
    if (!opt) return;
    const inner = qs<HTMLElement>("#carouselImages");
    if (!inner) return;
    let imgs: string[] = [];
    let alts: string[] = [];
    try { imgs = JSON.parse(opt.dataset.imgs || "[]"); } catch {}
    try { alts = JSON.parse(opt.dataset.alts || "[]"); } catch {}
    if (!imgs.length) return;
    inner.replaceChildren();
    imgs.forEach((src, i) => {
      const d = document.createElement("div");
      d.className = i === 0 ? "carousel-item active" : "carousel-item";
      const im = document.createElement("img");
      im.src = src;
      im.className = "d-block w-100";
      im.alt = alts[i] || document.title;
      if (i) im.loading = "lazy";
      d.appendChild(im);
      inner.appendChild(d);
    });
    qsa(".color-option").forEach((o) => o.classList.toggle("active", o === opt));
    carouselUpdaters.get(inner)?.();
  };
  document.addEventListener("click", onColour);
  offs.push(() => document.removeEventListener("click", onColour));
  return () => offs.forEach((f) => f());
}

/* ---------------------------------------------------------------- reveal animations */
function reveal(): Cleanup {
  const els = qsa<HTMLElement>("[data-anime], [data-fancy-text]");
  if (!els.length) return () => {};
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    els.forEach((el) => el.classList.add("appear", "anime-complete"));
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        const el = en.target as HTMLElement;
        io.unobserve(el);
        animate(el);
      }
    },
    { rootMargin: "0px 0px -40px 0px" },
  );
  els.forEach((el) => io.observe(el));
  return () => io.disconnect();
}

type AnimeOptions = { el?: string; duration?: number; staggervalue?: number; delay?: number; translateX?: number[]; translateY?: number[]; scale?: number[]; opacity?: number[] };

function animate(el: HTMLElement) {
  let opts: AnimeOptions = {};
  try { opts = JSON.parse(el.dataset.anime || "{}"); } catch {}
  const targets: HTMLElement[] = opts.el === "childs" ? (Array.from(el.children) as HTMLElement[]) : [el];
  const dur = Math.min(Number(opts.duration) || 600, 1200);
  const stagger = Number(opts.staggervalue) || 0;
  const delay = Number(opts.delay) || 0;
  const tx = Array.isArray(opts.translateX) ? opts.translateX[0] : 0;
  const ty = Array.isArray(opts.translateY) ? opts.translateY[0] : 0;
  const sc = Array.isArray(opts.scale) ? opts.scale[0] : null;
  el.classList.add("appear");
  targets.forEach((t, i) => {
    if (typeof t.animate !== "function") return;
    const from: Keyframe = { opacity: Array.isArray(opts.opacity) ? opts.opacity[0] : 0, transform: `translate(${tx}px, ${ty}px)${sc !== null ? ` scale(${sc})` : ""}` };
    const to: Keyframe = { opacity: 1, transform: "translate(0, 0)" + (sc !== null ? " scale(1)" : "") };
    t.animate([from, to], { duration: dur, delay: delay + i * stagger, easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", fill: "backwards" });
  });
  window.setTimeout(() => el.classList.add("anime-complete"), dur + delay + targets.length * stagger);
}

/* ---------------------------------------------------------------- counters */
function counters(): Cleanup {
  const els = qsa<HTMLElement>(".counter, .vertical-counter");
  if (!els.length || !("IntersectionObserver" in window)) return () => {};
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      const el = en.target as HTMLElement;
      io.unobserve(el);
      const to = Number(el.dataset.to || el.getAttribute("data-to") || el.textContent?.replace(/[^\d.]/g, "") || 0);
      if (!to) continue;
      const dur = Number(el.dataset.speed || 2000);
      const t0 = performance.now();
      const step = (t: number) => {
        const k = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(to * k).toLocaleString("en-IN");
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  });
  els.forEach((el) => io.observe(el));
  return () => io.disconnect();
}

/* ---------------------------------------------------------------- sliders (Swiper) */
async function sliders(): Promise<Cleanup> {
  const els = qsa<HTMLElement>("[data-slider-options]");
  if (!els.length) return () => {};
  const [{ default: Swiper }, mods] = await Promise.all([import("swiper"), import("swiper/modules")]);
  const instances: InstanceType<typeof Swiper>[] = [];
  for (const el of els) {
    let opts: SwiperOptions & { navigation?: Record<string, unknown>; pagination?: Record<string, unknown> } = {};
    try { opts = JSON.parse(el.getAttribute("data-slider-options") || "{}"); } catch { continue; }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches && opts.autoplay && (opts.speed ?? 0) > 3000) {
      opts.autoplay = false;
    }
    if (opts.navigation && typeof opts.navigation === "object") opts.navigation.addIcons = false;
    if (opts.pagination && typeof opts.pagination === "object") opts.pagination.addIcons = false;
    opts.modules = [mods.Autoplay, mods.Navigation, mods.Pagination, mods.EffectFade, mods.Keyboard, mods.Mousewheel, mods.EffectCreative, mods.Thumbs, mods.FreeMode];
    try {
      const sw = new Swiper(el, opts);
      instances.push(sw);
      // arrows: a looping slider with a single slide has both arrows disabled; a non-looping slider
      // disables them at its first and last slide (Swiper does that). Arrows Swiper would hide because
      // there is nothing to slide ("lock") are shown disabled instead.
      const arrows = () => {
        const nav = sw.navigation as unknown as { nextEl?: HTMLElement | HTMLElement[]; prevEl?: HTMLElement | HTMLElement[] } | undefined;
        if (!nav) return;
        const list = (x?: HTMLElement | HTMLElement[]) => (Array.isArray(x) ? x : x ? [x] : []);
        const real = sw.slides.filter((sl) => !sl.classList.contains("swiper-slide-duplicate")).length;
        const nothing = real <= 1 || sw.isLocked;
        for (const b of [...list(nav.nextEl), ...list(nav.prevEl)]) {
          b.classList.remove("swiper-button-lock");
          if (nothing) b.classList.add("swiper-button-disabled");
          else if (sw.params.loop) b.classList.remove("swiper-button-disabled");
          setArrow(b, nothing || (!sw.params.loop && b.classList.contains("swiper-button-disabled")));
        }
      };
      arrows();
      for (const ev of ["slideChange", "resize", "update", "lock", "unlock"] as const) sw.on(ev, () => requestAnimationFrame(arrows));
    } catch {
      /* invalid options on one slider must not break the rest */
    }
  }
  return () => instances.forEach((s) => s.destroy?.(true, false));
}

/* ---------------------------------------------------------------- forms */
const MSG: Record<string, string> = {
  required: "This field is required.",
  email: "Please enter a valid email address.",
  phone: "Please enter a valid 10 digit phone number.",
  short: "Please enter a little more detail.",
  file: "Please attach a PDF, DOC or DOCX file under 5 MB.",
};

/** Same rules as the server: PDF / DOC / DOCX, not empty, at most 5 MB (the server also checks the file's bytes). */
export const CV_MAX_BYTES = 5 * 1024 * 1024;
export const CV_EXT_RE = /\.(pdf|docx?)$/i;

export function fieldError(f: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string | null {
  if (f.type === "hidden" || f.type === "submit" || f.type === "button" || f.name === "website") return null;
  // the theme marks required fields with a "required" class; some stored forms lack the attribute
  const required = f.required || f.classList.contains("required");
  if (f.type === "file") {
    const file = (f as HTMLInputElement).files?.[0];
    if (!file) return required ? MSG.file : null;
    if (file.size === 0 || file.size > CV_MAX_BYTES || !CV_EXT_RE.test(file.name)) return MSG.file;
    return null;
  }
  const v = (f.value || "").trim();
  if (!v) return required ? MSG.required : null;
  if (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return MSG.email;
  if (f.type === "tel" && !/^\d{10}$/.test(v.replace(/[\s-]/g, ""))) return MSG.phone;
  if ("minLength" in f && f.minLength > 0 && v.length < f.minLength) return MSG.short;
  return null;
}

function showError(f: HTMLElement, msg: string | null) {
  const id = (f.id || f.getAttribute("name") || "f") + "-error";
  let el = document.getElementById(id);
  if (!msg) {
    f.removeAttribute("aria-invalid");
    f.classList.remove("is-invalid");
    el?.remove();
    return;
  }
  f.setAttribute("aria-invalid", "true");
  f.classList.add("is-invalid");
  if (!el) {
    el = document.createElement("div");
    el.id = id;
    el.className = "fp-field-error";
    f.insertAdjacentElement("afterend", el);
  }
  el.textContent = msg;
  f.setAttribute("aria-describedby", id);
}

function forms(): Cleanup {
  const onInput = (e: Event) => {
    const f = e.target as HTMLTextAreaElement;
    if (f.matches?.("textarea[maxlength]")) {
      const c = f.parentElement?.querySelector(".charCount");
      if (c) c.textContent = `${f.value.length} / ${f.maxLength}`;
    }
    // only re-check fields of forms this module submits (React-managed forms, such as the
    // catalogue popup, render their own errors)
    if (f.getAttribute?.("aria-invalid") && (f as HTMLTextAreaElement).form?.dataset.fpForm) showError(f, fieldError(f));
  };
  const onSubmit = async (e: Event) => {
    const form = e.target as HTMLFormElement;
    const kind = form.dataset.fpForm;
    if (!kind) return;
    e.preventDefault();
    const fields = Array.from(form.elements).filter((x) => (x as HTMLInputElement).name) as HTMLInputElement[];
    let firstBad: HTMLElement | null = null;
    for (const f of fields) {
      const err = fieldError(f);
      showError(f, err);
      if (err && !firstBad) firstBad = f;
    }
    const out = qs<HTMLElement>(".form-results", form);
    if (firstBad) {
      firstBad.focus();
      return;
    }
    const btn = qs<HTMLButtonElement | HTMLInputElement>("button[type=submit], button.submit, input[type=submit]", form);
    const isInput = btn instanceof HTMLInputElement;
    const label = btn ? (isInput ? btn.value : Array.from(btn.childNodes, (n) => n.cloneNode(true))) : undefined;
    if (btn) {
      btn.disabled = true;
      btn.setAttribute("aria-busy", "true");
      if (kind !== "newsletter") {
        if (isInput) btn.value = "sending...";
        else btn.textContent = "sending...";
      }
    }
    if (out) {
      out.classList.add("d-none");
      out.classList.remove("alert-success", "alert-danger");
    }
    try {
      // FormData keeps <input type=file> entries, so the career form goes out as
      // multipart/form-data with the CV; fetch sets the boundary header itself.
      const fd = new FormData(form);
      fd.set("page_url", window.location.href);
      const token = await recaptchaToken(kind);
      if (token) fd.set("g-recaptcha-response", token);
      const res = await fetch(`/api/${kind}`, { method: "POST", body: fd, headers: { Accept: "application/json" } });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; redirect?: string; step?: string };
      // Vercel rejects very large bodies itself (plain-text 413), so give a useful message.
      if (res.status === 413 && !data.message) throw new Error("Your submission is too large. Please attach a smaller file (under 4 MB is safest).");
      if (res.ok && data.ok) {
        if (data.redirect) {
          window.location.href = data.redirect;
          return;
        }
        form.dispatchEvent(new CustomEvent("fp:success", { detail: data, bubbles: true }));
        if (out) {
          out.textContent = data.message || "Thank you. We will get back to you soon.";
          out.classList.remove("d-none");
          out.classList.add("alert-success");
        }
        if (!data.step) form.reset();
      } else {
        throw new Error(data.message || "Something went wrong. Please try again or call us.");
      }
    } catch (err) {
      if (out) {
        out.textContent = (err as Error).message || "Something went wrong. Please try again or call us.";
        out.classList.remove("d-none");
        out.classList.add("alert-danger");
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.removeAttribute("aria-busy");
        if (label !== undefined) {
          if (btn instanceof HTMLInputElement) btn.value = label as string;
          else btn.replaceChildren(...(label as Node[]));
        }
      }
    }
  };
  document.addEventListener("input", onInput);
  document.addEventListener("submit", onSubmit);
  return () => {
    document.removeEventListener("input", onInput);
    document.removeEventListener("submit", onSubmit);
  };
}

/** reCAPTCHA v3 token when <html data-recaptcha="<site key>"> is set, otherwise null. */
export async function recaptchaToken(action: string): Promise<string | null> {
  const key = document.documentElement.dataset.recaptcha;
  if (!key) return null;
  const w = window as Window & { grecaptcha?: { ready(cb: () => void): void; execute(key: string, o: { action: string }): Promise<string> } };
  if (!w.grecaptcha) {
    await new Promise<void>((resolve) => {
      const s = document.createElement("script");
      s.src = `https://www.google.com/recaptcha/api.js?render=${key}`;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => resolve();
      document.head.appendChild(s);
    });
  }
  const g = w.grecaptcha;
  if (!g?.execute) return null;
  return new Promise((resolve) => g.ready(() => g.execute(key, { action }).then(resolve, () => resolve(null))));
}

/* ---------------------------------------------------------------- simple grid filters (gallery / projects) */
function filters(): Cleanup {
  const onClick = (e: Event) => {
    const a = (e.target as HTMLElement).closest<HTMLElement>("[data-filter]");
    if (!a) return;
    const list = a.closest("ul, .filter-list, .portfolio-filter, .grid-filter");
    if (!list) return;
    e.preventDefault();
    const f = a.getAttribute("data-filter") || "*";
    qsa("li", list).forEach((li) => li.classList.remove("active"));
    a.closest("li")?.classList.add("active");
    const grid = document.querySelector(".grid, .portfolio-wrapper, .gallery-wrapper") || document;
    qsa<HTMLElement>(".grid-item", grid).forEach((it) => {
      it.style.display = f === "*" || it.matches(f) ? "" : "none";
    });
    document.dispatchEvent(new Event("fp:relayout"));
  };
  document.addEventListener("click", onClick);
  return () => document.removeEventListener("click", onClick);
}

/* ---------------------------------------------------------------- scroll-top */
/** Fields marked data-fp-digits accept digits only (was an inline oninput handler). */
function digitsOnly(): Cleanup {
  const onInput = (e: Event) => {
    const el = e.target as HTMLInputElement | null;
    if (el && el.matches?.("[data-fp-digits]")) {
      const v = el.value.replace(/[^0-9]/g, "");
      if (v !== el.value) el.value = v;
    }
  };
  document.addEventListener("input", onInput);
  return () => document.removeEventListener("input", onInput);
}

function scrollTop(): Cleanup {
  const btn = qs<HTMLElement>(".scroll-top-arrow");
  if (!btn) return () => {};
  const on = () => (btn.style.display = window.scrollY > 150 ? "block" : "none");
  const click = (e: Event) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); };
  window.addEventListener("scroll", on, { passive: true });
  btn.addEventListener("click", click);
  on();
  return () => window.removeEventListener("scroll", on);
}


/* ---------------------------------------------------------------- masonry grids (replaces Isotope) */
function masonry(): Cleanup {
  const grids = qsa<HTMLElement>("ul.grid, .grid.blog-wrapper, .portfolio-wrapper.grid").filter((g) => qs(".grid-item", g));
  if (!grids.length) return () => {};
  const layout = () => {
    for (const g of grids) {
      const items = qsa<HTMLElement>(":scope > .grid-item", g).filter((i) => i.style.display !== "none");
      const sizer = qs<HTMLElement>(":scope > .grid-sizer", g);
      g.style.position = "relative";
      const W = g.clientWidth;
      if (!W) continue;
      const single = items.find((i) => !i.classList.contains("grid-item-double"));
      const colW = (sizer && sizer.offsetWidth) || (single && single.offsetWidth) || W;
      const cols = Math.max(1, Math.round(W / colW));
      const heights = new Array(cols).fill(0);
      for (const it of items) {
        const span = it.classList.contains("grid-item-double") ? Math.min(2, cols) : 1;
        let best = 0, bestY = Infinity;
        for (let c = 0; c + span <= cols; c++) {
          const y = Math.max(...heights.slice(c, c + span));
          if (y < bestY) { bestY = y; best = c; }
        }
        it.style.position = "absolute";
        it.style.left = (best * W) / cols + "px";
        it.style.top = bestY + "px";
        const h = it.offsetHeight;
        for (let c = best; c < best + span; c++) heights[c] = bestY + h;
      }
      g.style.height = Math.max(0, ...heights) + "px";
    }
  };
  let raf = 0;
  const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(layout); };
  grids.forEach((g) => qsa("img", g).forEach((im) => { if (!(im as HTMLImageElement).complete) im.addEventListener("load", schedule); }));
  window.addEventListener("resize", schedule);
  document.addEventListener("fp:relayout", schedule);
  schedule();
  return () => { window.removeEventListener("resize", schedule); document.removeEventListener("fp:relayout", schedule); };
}

/* ---------------------------------------------------------------- blog "Load More" (9 at a time) */
function loadMore(): Cleanup {
  const btn = document.getElementById("load-more-btn");
  const items = qsa<HTMLElement>("#blog-list .grid-item");
  if (!btn || !items.length) return () => {};
  let shown = 9;
  const apply = () => {
    items.forEach((e, i) => (e.style.display = i < shown ? "" : "none"));
    if (shown >= items.length) btn.style.display = "none";
    document.dispatchEvent(new Event("fp:relayout"));
  };
  const click = () => { shown += 9; apply(); };
  btn.addEventListener("click", click);
  apply();
  return () => btn.removeEventListener("click", click);
}

/* ---------------------------------------------------------------- lightbox for [data-group] image links */
function lightbox(): Cleanup {
  const IMAGE = /\.(jpe?g|png|webp|gif)$/i;
  const VIDEO = /\.(mp4|webm|mov|m4v)$/i;
  const media = (x: Element) => IMAGE.test(x.getAttribute("href") || "") || VIDEO.test(x.getAttribute("href") || "");
  const onClick = (e: Event) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[data-group]");
    if (!a || !media(a)) return;
    e.preventDefault();
    const group = qsa<HTMLAnchorElement>(`a[data-group="${a.dataset.group}"]`).filter(media);
    let idx = group.indexOf(a);
    const bg = document.createElement("div");
    bg.className = "mfp-bg mfp-ready";
    const wrap = document.createElement("div");
    // close button outside the image holder (as the theme's closeBtnInside: false): white round button, top right
    wrap.className = "mfp-wrap mfp-gallery mfp-auto-cursor mfp-ready";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.tabIndex = -1;
    const btnAttrs = (title: string, cls: string, label: string) => ({ title, type: "button", class: cls, "aria-label": label });
    wrap.append(
      el("div", { class: "mfp-container mfp-s-ready mfp-image-holder" },
        el("div", { class: "mfp-content" },
          el("div", { class: "mfp-figure" },
            el("figure", {},
              el("img", { class: "mfp-img", alt: "" }),
              el("figcaption", {}, el("div", { class: "mfp-bottom-bar" }, el("div", { class: "mfp-title" }), el("div", { class: "mfp-counter" })))))),
        el("button", btnAttrs("Previous", "mfp-arrow mfp-arrow-left", "Previous")),
        el("button", btnAttrs("Next", "mfp-arrow mfp-arrow-right", "Next"))),
      el("button", btnAttrs("Close (Esc)", "mfp-close", "Close"), "\u00d7"),
    );
    const img = qs<HTMLImageElement>(".mfp-img", wrap)!;
    // gallery videos play in the same popup, in place of the image
    const video = el("video", { class: "mfp-img", controls: "", playsinline: "", preload: "metadata" }) as HTMLVideoElement;
    video.style.cssText = "max-height:calc(100vh - 80px);width:auto;max-width:100%;margin:0 auto;background:#000";
    img.after(video);
    const show = () => {
      const cur = group[idx];
      const href = cur.getAttribute("href")!;
      const isVideo = VIDEO.test(href);
      video.pause();
      img.hidden = isVideo;
      video.hidden = !isVideo;
      if (isVideo) {
        video.src = href;
        video.setAttribute("aria-label", cur.getAttribute("aria-label") || cur.title || "Video");
        video.play().catch(() => {});
        img.removeAttribute("src");
      } else {
        video.removeAttribute("src");
        video.load();
        img.src = href;
        img.alt = qs<HTMLImageElement>("img", cur)?.alt || "";
      }
      qs(".mfp-counter", wrap)!.textContent = `${idx + 1} of ${group.length}`;
    };
    const close = () => { video.pause(); wrap.remove(); bg.remove(); document.removeEventListener("keydown", key); document.documentElement.style.overflow = ""; a.focus(); };
    const key = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") close();
      if (ev.key === "ArrowRight") { idx = (idx + 1) % group.length; show(); }
      if (ev.key === "ArrowLeft") { idx = (idx - 1 + group.length) % group.length; show(); }
    };
    wrap.addEventListener("click", (ev) => {
      const t = ev.target as HTMLElement;
      if (t.classList.contains("mfp-arrow-right")) { idx = (idx + 1) % group.length; show(); return; }
      if (t.classList.contains("mfp-arrow-left")) { idx = (idx - 1 + group.length) % group.length; show(); return; }
      // close: the button, the dark area around the image, or the image itself (theme: closeOnContentClick)
      if (t.closest(".mfp-close") || t.classList.contains("mfp-container") || t.classList.contains("mfp-content") || (t.classList.contains("mfp-img") && t.tagName === "IMG") || t === wrap) close();
    });
    document.addEventListener("keydown", key);
    document.body.append(bg, wrap);
    document.documentElement.style.overflow = "hidden";
    show();
    if (group.length < 2) qsa(".mfp-arrow", wrap).forEach((b) => setArrow(b, true));
    wrap.focus();
  };
  document.addEventListener("click", onClick);
  return () => document.removeEventListener("click", onClick);
}

/* ---------------------------------------------------------------- slider cursor (theme "magic cursor") */
/**
 * Over sliders marked .magic-cursor the theme hides the mouse pointer and shows a round "drag" cursor
 * that follows the mouse (dark circle with arrows; .drag-cursor sliders: frosted circle reading "< DRAG >").
 * Only on devices with a mouse; the pointer is hidden only once this cursor exists (styles/site.css).
 */
function magicCursor(): Cleanup {
  const zones = qsa<HTMLElement>(".magic-cursor");
  if (!zones.length || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return () => {};
  const svg = (points: string) => {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("fill", "none");
    s.setAttribute("stroke", "currentColor");
    s.setAttribute("stroke-width", "2");
    s.setAttribute("stroke-linecap", "round");
    s.setAttribute("stroke-linejoin", "round");
    const pl = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    pl.setAttribute("points", points);
    s.append(pl);
    return s;
  };
  const ball = el("div", { class: "fp-cursor-ball" }, svg("15 18 9 12 15 6"), el("span", { class: "fp-cursor-drag" }, "< DRAG >"), svg("9 18 15 12 9 6"));
  const cur = el("div", { class: "fp-cursor", "aria-hidden": "true" }, ball);
  document.body.append(cur);
  document.documentElement.classList.add("fp-has-cursor");
  const pos = { x: -200, y: -200 };
  const at = { x: -200, y: -200 };
  let raf = 0;
  let inside = 0;
  const tick = () => {
    at.x += 0.35 * (pos.x - at.x);
    at.y += 0.35 * (pos.y - at.y);
    cur.style.transform = `translate3d(${at.x}px, ${at.y}px, 0)`;
    raf = Math.abs(pos.x - at.x) + Math.abs(pos.y - at.y) > 0.5 ? requestAnimationFrame(tick) : 0;
  };
  const move = (e: MouseEvent) => {
    pos.x = e.clientX;
    pos.y = e.clientY;
    if (!raf) raf = requestAnimationFrame(tick);
    // over links, buttons and slider controls the normal pointer shows instead
    const t = e.target as Element | null;
    cur.classList.toggle("is-hidden", !!t?.closest?.("a, button, .swiper-button-next, .swiper-button-prev, .swiper-pagination, input, select, textarea"));
  };
  const enter = (e: Event) => {
    const z = e.currentTarget as HTMLElement;
    inside++;
    cur.classList.toggle("is-drag", z.classList.contains("drag-cursor"));
    cur.classList.toggle("is-light", z.classList.contains("light"));
    cur.classList.add("is-on");
  };
  const leave = () => {
    inside = Math.max(0, inside - 1);
    if (!inside) cur.classList.remove("is-on");
  };
  document.addEventListener("mousemove", move, { passive: true });
  zones.forEach((z) => {
    z.addEventListener("mouseenter", enter);
    z.addEventListener("mouseleave", leave);
  });
  return () => {
    document.removeEventListener("mousemove", move);
    zones.forEach((z) => {
      z.removeEventListener("mouseenter", enter);
      z.removeEventListener("mouseleave", leave);
    });
    cancelAnimationFrame(raf);
    cur.remove();
    document.documentElement.classList.remove("fp-has-cursor");
  };
}

/* ---------------------------------------------------------------- campaign pages: rotating client logo */
function clientRotator(): Cleanup {
  const img = document.getElementById("client-image") as HTMLImageElement | null;
  if (!img) return () => {};
  const images = ["/images/c1.png", "/images/c4.png", "/images/c3.png", "/images/c2.png"];
  let i = 0;
  const t = window.setInterval(() => {
    i = (i + 1) % images.length;
    img.src = images[i];
    img.classList.add("animate-fade-scale");
  }, 2000);
  return () => window.clearInterval(t);
}

/** "Live Chat Now" opens Tawk.to when GTM has loaded it, otherwise the link goes to WhatsApp. */
function liveChat(): Cleanup {
  const onClick = (e: MouseEvent) => {
    const a = (e.target as Element | null)?.closest?.("a[data-tawk]");
    const tawk = (window as Window & { Tawk_API?: { toggle?: () => void } }).Tawk_API;
    if (a && tawk && typeof tawk.toggle === "function") {
      e.preventDefault();
      tawk.toggle();
    }
  };
  document.addEventListener("click", onClick);
  return () => document.removeEventListener("click", onClick);
}

/** Blog posts: highlight the section being read in the contents list. */
function blogToc(): Cleanup {
  const links = qsa<HTMLAnchorElement>(".fpb-toc a[href^='#']");
  if (!links.length || !("IntersectionObserver" in window)) return () => {};
  const byId = new Map(links.map((a) => [decodeURIComponent(a.hash.slice(1)), a]));
  const heads = [...byId.keys()].map((id) => document.getElementById(id)).filter((h): h is HTMLElement => !!h);
  let current: HTMLAnchorElement | undefined;
  const set = (id: string) => {
    const a = byId.get(id);
    if (!a || a === current) return;
    current?.classList.remove("is-active");
    a.classList.add("is-active");
    current = a;
  };
  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) set(visible[0].target.id);
    },
    { rootMargin: "-100px 0px -65% 0px" },
  );
  heads.forEach((h) => io.observe(h));
  return () => io.disconnect();
}

export function initBehaviors(): Cleanup {
  const cleanups: Cleanup[] = [header(), search(), popups(), collapse(), carousels(), reveal(), counters(), forms(), filters(), scrollTop(), loadMore(), masonry(), lightbox(), clientRotator(), liveChat(), digitsOnly(), magicCursor(), blogToc()];
  let swiperCleanup: Cleanup | null = null;
  sliders().then((c) => (swiperCleanup = c)).catch(() => {});
  return () => {
    cleanups.forEach((c) => c());
    swiperCleanup?.();
  };
}
