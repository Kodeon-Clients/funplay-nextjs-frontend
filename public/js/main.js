function initMap() {
    $(".map").each(function (e) {
        let t = $(this).attr("data-map-options");
        null != t && (t = $.parseJSON(t));
        let a = t.lat ? t.lat : 19.07,
            n = t.lng ? t.lng : 72.87,
            r = t.marker,
            i = t.popup;
        switch (t.style && t.style.toLowerCase()) {
            case "retro":
                map_style = Retro;
                break;
            case "standard":
                map_style = Standard;
                break;
            case "silver":
            default:
                map_style = Silver;
                break;
            case "dark":
                map_style = Dark;
                break;
            case "night":
                map_style = Night;
                break;
            case "aubergine":
                map_style = Aubergine;
        }
        let o = new google.maps.Map(this, {
            zoom: 13,
            center: new google.maps.LatLng(a, n),
            mapTypeId: google.maps.MapTypeId.READMAP,
            styles: map_style,
        }),
            l = new google.maps.InfoWindow({ content: i && i.html, maxWidth: 300 });
        if ((l.setPosition(new google.maps.LatLng(a, n)), null != r))
            if ("html" === r.type.toLowerCase()) {
                function s(e, t) {
                    (this.lat = e), (this.lng = t), (this.pos = new google.maps.LatLng(e, t));
                }
                (s.prototype = new google.maps.OverlayView()),
                    (s.prototype.onAdd = function () {
                        ((div = document.createElement("DIV")).className =
                            "arrow_box " + (r.class ? " " + r.class : "")),
                            (div.innerHTML = `<span style='background-color: ${r.color}; border-color: ${r.color}'></span><span style='background-color: ${r.color}; border-color: ${r.color}'></span>`),
                            div.style.setProperty("background-color", r.color),
                            this.getPanes().overlayImage.appendChild(div);
                        let e = !1;
                        !0 === i.defaultOpen &&
                            ((e = !0), l.setOptions({ pixelOffset: new google.maps.Size(10, -30) }), l.open(o)),
                            google.maps.event.addDomListener(div, "click", function (t) {
                                i &&
                                    (l.setOptions({ pixelOffset: new google.maps.Size(10, -30) }),
                                        !1 === e ? (l.open(o), (e = !0)) : (l.close(), (e = !1)));
                            });
                    }),
                    (s.prototype.draw = function () {
                        let e = this.getProjection().fromLatLngToDivPixel(this.pos),
                            t = this.getPanes();
                        (t.overlayImage.style.left = e.x + "px"), (t.overlayImage.style.top = e.y - 30 + "px");
                    }),
                    new s(a, n).setMap(o);
            } else {
                let c = new google.maps.Marker({
                    icon: { url: r.src },
                    position: { lat: a, lng: n },
                    map: o,
                    animation: google.maps.Animation.DROP,
                }),
                    d = !1;
                !0 === i.defaultOpen && (l.open({ anchor: c, map: o }), (d = !0)),
                    c.addListener("click", function () {
                        null !== c.getAnimation() ? c.setAnimation(null) : c.setAnimation(google.maps.Animation.BOUNCE),
                            i && (!1 === d ? (l.open({ anchor: c, map: o }), (d = !0)) : (l.close(), (d = !1)));
                    });
            }
        else {
            let u = new google.maps.Marker({ position: { lat: a, lng: n }, map: o }),
                m = !1;
            !0 === i.defaultOpen && (l.open({ anchor: u, map: o }), (m = !0)),
                u.addListener("click", function () {
                    i && (!1 === m ? (l.open({ anchor: u, map: o }), (m = !0)) : (l.close(), (m = !1)));
                });
        }
    });
}
!(function (e) {
    "use strict";
    ("ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) &&
        e("body").addClass("is-touchable");
    var t = 0,
        a = 0,
        n = [],
        r = [],
        i = window.pageYOffset || document.documentElement.scrollTop,
        o = !1;
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && (o = !0),
        /iPhone|iPad|iPod/i.test(navigator.userAgent),
        e(
            ".vertical-counter, .counter, .progress-bar, .pie-chart-style-01, .attractive-hover, .splitting-animation, .section-dark, footer, [data-anime], [data-fancy-text]"
        ).each(function () {
            e(this).appear().trigger("resize");
        }),
        I(),
        y(),
        e(".counter").each(function (t) {
            var a = e(this);
            (t = e.extend({}, t || {}, a.data("countToOptions") || {})),
                "function" == typeof e.fn.countTo && a.countTo(t);
        }),
        e(".team-style-01").each(function () {
            let t = e(this),
                a = t.find("figure"),
                n = t.find("figcaption");
            setTimeout(function () {
                a.css({ "padding-bottom": n.outerHeight() });
            }, 200);
        }),
        w(),
        z(),
        R(2e3),
        document.querySelectorAll("[data-slider-options]:not(.instafeed-wrapper)").forEach(function (t) {
            var a = e(t),
                n = a.attr("data-slider-options");
            if (null != n) {
                n = e.parseJSON(n);
                var i = a.attr("data-slide-change-on-click");
                if (
                    ("" != i &&
                        null != i &&
                        "1" == i &&
                        (n.on = {
                            click: function () {
                                this.activeIndex > this.clickedIndex
                                    ? this.slidePrev()
                                    : this.activeIndex < this.clickedIndex && this.slideNext();
                            },
                        }),
                        "" != n.thumbs && null != n.thumbs)
                ) {
                    var o = a.attr("data-thumb-slider-md-direction");
                    if ("" != o && null != o) {
                        var l =
                            "" != n.thumbs.swiper.direction && null != n.thumbs.swiper.direction
                                ? n.thumbs.swiper.direction
                                : o;
                        n.thumbs.swiper.on = {
                            init: function () {
                                991 >= D() ? this.changeDirection(o) : this.changeDirection(l), this.update();
                            },
                            resize: function () {
                                991 >= D() ? this.changeDirection(o) : this.changeDirection(l), this.update();
                            },
                            click: function () {
                                this.activeIndex == this.clickedIndex ? this.slidePrev() : this.slideNext();
                            },
                        };
                    }
                }
                var s = a.attr("data-number-pagination");
                "" != s &&
                    null != s &&
                    "1" == s &&
                    "" != n.pagination &&
                    null != n.pagination &&
                    (n.pagination.renderBullet = function (e, t) {
                        var a;
                        return (
                            '<span class="' +
                            t +
                            '">' +
                            ((a = e + 1) < 10 ? "0" + a.toString() : a.toString()) +
                            "</span>"
                        );
                    });
                var c = a.attr("data-thumbs");
                "" != c &&
                    null != c &&
                    "" != n.pagination &&
                    null != n.pagination &&
                    null != (c = e.parseJSON(c)) &&
                    (n.pagination.renderBullet = function (e, t) {
                        return '<span class="' + t + '" style="background-image: url( ' + c[e] + ' )"></span>';
                    }),
                    (n.on = {
                        init: function () {
                            this.slides;
                            let t = this.activeIndex,
                                a = this.slides[t],
                                n = a.querySelectorAll("[data-anime]");
                            a.querySelectorAll("[data-fancy-text]"),
                                D() > 1199 &&
                                n &&
                                n.forEach((t) => {
                                    let a = t.getAttribute("data-anime");
                                    if (null != a) {
                                        if (
                                            ((a = e.parseJSON(a)),
                                                t.classList.add("appear"),
                                                (t.style.transition = "none"),
                                                a.el)
                                        )
                                            for (let e = 0; e < t.children.length; e++)
                                                (t.children[e].style.transition = "none"),
                                                    t.children[e].classList.add("appear");
                                        C(t, a), t.classList.remove("appear");
                                    }
                                });
                        },
                        slideChange: function () {
                            this.slides;
                            let t = this.activeIndex,
                                a = this.slides[t],
                                n = a.querySelectorAll("[data-anime]"),
                                r = a.querySelectorAll("[data-fancy-text]");
                            D() > 1199 &&
                                (r &&
                                    r.forEach((t) => {
                                        t.classList.add("appear");
                                        let a = t.getAttribute("data-fancy-text");
                                        null != a && (M(t, (a = e.parseJSON(a))), t.classList.remove("appear"));
                                    }),
                                    n &&
                                    n.forEach((t) => {
                                        let a = t.getAttribute("data-anime");
                                        if (null != a) {
                                            if (
                                                ((a = e.parseJSON(a)),
                                                    t.classList.add("appear"),
                                                    (t.style.transition = "none"),
                                                    a.el)
                                            )
                                                for (let e = 0; e < t.children.length; e++)
                                                    (t.children[e].style.transition = "none"),
                                                        t.children[e].classList.add("appear");
                                            C(t, a), t.classList.remove("appear");
                                        }
                                    }));
                        },
                    });
                var d = a.attr("data-swiper-number-line-pagination") || !1,
                    u = a.attr("data-swiper-number-navigation") || !1,
                    m = a.attr("data-swiper-number-pagination-progress") || !1,
                    p = a.attr("data-swiper-show-progress") || !1,
                    h = a.attr("data-gallery-box") || !1;
                (d || u || m || h) &&
                    (n.on = {
                        init: function () {
                            if (d || u || m) {
                                if (n.hasOwnProperty("loop") && n.loop) var t = this.slides.length;
                                var r = t;
                                m
                                    ? (a
                                        .parent()
                                        .find(".number-next")
                                        .text("0" + r),
                                        a.parent().find(".number-prev").text("01"),
                                        a
                                            .parent()
                                            .find(".swiper-pagination-progress")[0]
                                            .style.setProperty("--swiper-progress", (100 / r).toFixed(2) + "%"))
                                    : (a.parent().find(".number-next").text("02"),
                                        a
                                            .parent()
                                            .find(".number-prev")
                                            .text("0" + r),
                                        p &&
                                        a
                                            .parent()
                                            .find(".swiper-pagination-progress")[0]
                                            .style.setProperty("--swiper-progress", (100 / r).toFixed(2) + "%"));
                            }
                            "function" == typeof e.fn.magnificPopup &&
                                h &&
                                a.magnificPopup({
                                    delegate: "a",
                                    type: "image",
                                    closeOnContentClick: !0,
                                    closeBtnInside: !1,
                                    gallery: { enabled: !0 },
                                });
                        },
                        slideChange: function () {
                            if (d || u || m) {
                                n.hasOwnProperty("loop") && n.loop && this.slides.length;
                                var t = this.slides.length,
                                    r = this.realIndex + 1,
                                    i = r + 1,
                                    o = r - 1;
                                1 == r && (o = t),
                                    r == t && (i = 1),
                                    m
                                        ? (a
                                            .parent()
                                            .find(".number-prev")
                                            .each(function () {
                                                e(this).text(r < 10 ? "0" + r : r);
                                            }),
                                            a
                                                .parent()
                                                .find(".swiper-pagination-progress")[0]
                                                .style.setProperty("--swiper-progress", ((100 / t) * r).toFixed(2) + "%"))
                                        : (a
                                            .parent()
                                            .find(".number-next")
                                            .each(function () {
                                                e(this).text(i < 10 ? "0" + i : i);
                                            }),
                                            a
                                                .parent()
                                                .find(".number-prev")
                                                .each(function () {
                                                    e(this).text(o < 10 ? "0" + o : o);
                                                }),
                                            p &&
                                            a
                                                .parent()
                                                .find(".swiper-pagination-progress")[0]
                                                .style.setProperty(
                                                    "--swiper-progress",
                                                    ((100 / t) * r).toFixed(2) + "%"
                                                ));
                            }
                        },
                    }),
                    a.attr("data-swiper-thumb-click") &&
                    n.hasOwnProperty("thumbs") &&
                    (n.thumbs.swiper.on = {
                        click: function (e) {
                            e.activeIndex >= e.clickedIndex
                                ? e.slidePrev()
                                : e.activeIndex < e.clickedIndex && e.slideNext();
                        },
                    }),
                    "function" == typeof Swiper &&
                    a.imagesLoaded(function () {
                        var e = new Swiper(t, n);
                        r.push(e);
                    });
            }
        });
    var l = e("body").attr("data-mobile-nav-style");
    if (("modern" == l || "full-screen-menu" == l) && !e(".navbar-" + l + "-inner").length) {
        if (
            (e(".box-layout").length || "modern" != l
                ? e("section").wrapAll('<div class="page-layout"></div>')
                : e("section, footer").wrapAll('<div class="page-layout"></div>'),
                e(".navbar .navbar-toggler").clone(!0).addClass("navbar-toggler-clone").insertAfter(".page-layout"),
                e(".navbar .navbar-collapse")
                    .clone(!0)
                    .addClass("navbar-collapse-clone")
                    .attr("id", "navbarNav-clone")
                    .insertAfter(".page-layout"),
                e(".navbar-toggler-clone, .navbar-collapse-clone").wrapAll('<div class="navbar-' + l + '-inner"></div>'),
                e(".navbar-toggler").attr("data-target", "#navbarNav-clone").attr("aria-controls", "#navbarNav-clone"),
                e(".navbar-" + l + "-inner")
                    .find(".dropdown-toggle")
                    .addClass("dropdown-toggle-clone"),
                "function" == typeof e.fn.mCustomScrollbar && e(".navbar-collapse-clone").length)
        ) {
            var s = e(".navbar-collapse-clone").attr("data-scroll-options") || '{ "theme": "light" }';
            null != s && ((s = e.parseJSON(s)), e(".navbar-collapse-clone").mCustomScrollbar(s));
        }
        "modern" == l && e('<div class="navbar-show-modern-bg"></div>').insertAfter(".page-layout");
    }
    e(".navbar-collapse.collapse")
        .on("show.bs.collapse", function (t) {
            if (e("body").hasClass("navbar-collapse-show"))
                e(".navbar-modern-inner").length &&
                    setTimeout(function () {
                        e(".navbar-show-modern-bg").css("background", "");
                    }, 600),
                    e(".navbar-full-screen-menu-inner").length &&
                    setTimeout(function () {
                        e(".navbar-full-screen-menu-inner").css("background", "");
                    }, 600);
            else {
                if (
                    (e("body").addClass("navbar-collapse-show"),
                        e("html").addClass("overflow-hidden"),
                        e("body").attr("data-mobile-nav-bg-color") && e(".navbar-modern-inner").length)
                ) {
                    var a = e("body").attr("data-mobile-nav-bg-color");
                    e(".navbar-show-modern-bg").css("background", a);
                }
                if (e("body").attr("data-mobile-nav-bg-color") && e(".navbar-full-screen-menu-inner").length) {
                    a = e("body").attr("data-mobile-nav-bg-color");
                    e(".navbar-full-screen-menu-inner").css("background", a);
                }
                if (991 >= D()) {
                    var n = W(),
                        r = m();
                    e("header .navbar-collapse").css("max-height", n - r);
                }
            }
            (r = m()), (n = W());
            e(".navbar-modern-inner").length > 0 || e(".navbar-full-screen-menu-inner").length > 0
                ? e(".navbar-collapse-clone").css("max-height", n)
                : e(".navbar-collapse-clone").css("max-height", n - r);
        })
        .on("hide.bs.collapse", function (t) {
            e("body").hasClass("navbar-collapse-show") &&
                (e("body").removeClass("navbar-collapse-show"), e("html").removeClass("overflow-hidden"));
        }),
        e(".sub-menu.collapse")
            .on("show.bs.collapse", function (t) {
                var a = e(t.target).attr("id");
                e('[data-bs-target="#' + a + '"]').addClass("show"),
                    e(this)
                        .parents(".menu-item")
                        .siblings()
                        .each(function () {
                            e(".sub-menu.show", this).collapse("hide");
                        }),
                    h();
            })
            .on("hide.bs.collapse", function (t) {
                var a = e(t.target).attr("id");
                e('[data-bs-target="#' + a + '"]').removeClass("show"),
                    e(t.target).find(".sub-menu.show").collapse("hide"),
                    h();
            }),
        e(document).on("click", ".search-form-icon", function (t) {
            t.preventDefault(), e("body").addClass("show-search-popup");
        }),
        e(document).on("click", ".search-close", function (t) {
            t.preventDefault(), e("body").removeClass("show-search-popup");
        }),
        e(document).on("click", ".search-button", function () {
            var t = !0,
                a = e(this).parents("form");
            return (
                a.find("input[type=text]").each(function (n) {
                    var r = e(this).val();
                    null === r || "" === r
                        ? (a.find("input:eq(" + n + ")").addClass("search-error"), (t = !1))
                        : a.find("input:eq(" + n + ")").removeClass("search-error");
                }),
                t
            );
        }),
        e(document).on("click", ".header-push-button .push-button", function () {
            e("html, body").toggleClass("show-menu");
        }),
        e(document).on("click", ".close-menu", function () {
            e("html, body").removeClass("show-menu"), e(".sub-menu.show").collapse("hide");
        }),
        e(document).on("click", "#navbar-menu .navbar-toggler", function () {
            e(".sub-menu.show").collapse("hide");
        }),
        e(document).on("click", "body", function (t) {
            e(t.target).closest(".navbar-nav").length ||
                e(t.target).closest(".navbar-full-screen-menu-inner").length ||
                setTimeout(function () {
                    e(".navbar-collapse.collapse").collapse("hide");
                }, 100),
                e(t.target).hasClass("push-button") ||
                e(t.target).closest(".push-button").length ||
                e(t.target).closest(".push-menu").length ||
                e(t.target).closest(".hamburger-menu").length ||
                e("html, body").removeClass("show-menu"),
                e(t.target).hasClass("search-form") ||
                e(t.target).closest(".search-form-icon").length ||
                e(t.target).closest(".search-form-box").length ||
                e("body").removeClass("show-search-popup"),
                e(t.target).closest(".navbar-nav").length
                    ? e(t.target).parents("body").find(".header-language.open").length
                        ? (e(".header-language").trigger("mouseleave"),
                            e(".header-language").removeClass("show"),
                            e(".header-language").children(".dropdown-menu").removeClass("show"))
                        : e(t.target).parents("body").find(".header-cart.open").length &&
                        (e(".header-cart").trigger("mouseleave"),
                            e(".header-cart").removeClass("show"),
                            e(".header-cart").children(".dropdown-menu").removeClass("show"))
                    : (e(t.target).closest(".header-language").length ||
                        (e(".header-language").trigger("mouseleave"),
                            e(".header-language").removeClass("show"),
                            e(".header-language").children(".dropdown-menu").removeClass("show")),
                        e(t.target).closest(".header-cart").length ||
                        (e(".header-cart").trigger("mouseleave"),
                            e(".header-cart").removeClass("show"),
                            e(".header-cart").children(".dropdown-menu").removeClass("show")),
                        e(".navbar-nav .dropdown").each(function () {
                            var t = e(this);
                            t.trigger("mouseleave"),
                                t.removeClass("show"),
                                t.children(".dropdown-menu").removeClass("show");
                        })),
                e(t.target).closest(".left-modern-header").length || e(".left-modern-header").collapse("hide");
        }),
        e(document).on("keydown", function (t) {
            27 === t.keyCode &&
                (e(".navbar-collapse.collapse").collapse("hide"),
                    e("#navbar-menu").collapse("hide"),
                    e("html, body").removeClass("show-menu"),
                    e("body").removeClass("show-search-popup"),
                    e(".left-modern-header").collapse("hide"));
        }),
        e(".nav-item.submenu")
            .on("mouseenter touchstart", function (t) {
                e(this);
                var a = e("header nav").attr("data-header-hover");
                D() > 991 &&
                    (e(t.target).siblings(".dropdown-menu").length && t.preventDefault(),
                        "light" == a
                            ? e("header nav").addClass("submenu-light").removeClass("submenu-dark")
                            : "dark" == a && e("header nav").addClass("submenu-dark").removeClass("submenu-light"));
            })
            .on("mouseleave", function (t) {
                e(this), e("header nav").removeClass("submenu-light").removeClass("submenu-dark");
            }),
        e(".dropdown")
            .on("mouseenter touchstart", function (n) {
                var r = e(this);
                if (
                    (r.siblings(".dropdown").removeClass("open"),
                        r.parents(".navbar-nav").siblings(".navbar-nav").find(".dropdown").removeClass("open"),
                        D() >= 991 && r.hasClass("open") && r[0] == e(n.target).parent()[0])
                ) {
                    let t = e(r).find(".nav-link").attr("href");
                    "undefined" != t &&
                        -1 === t.indexOf("javascript") &&
                        void 0 !== t &&
                        "#" != t &&
                        (window.location.href = t);
                }
                r.addClass("open"),
                    (function (e) {
                        var n = D();
                        if (e.hasClass("simple-dropdown")) {
                            (t = e), (a = e.find("a.nav-link"));
                            var r = n - 30 - (e.offset().left + e.children(".dropdown-menu").outerWidth());
                            r < 0 && e.children(".dropdown-menu").css("left", r);
                        }
                        if (e.parent().hasClass("dropdown-menu") && e.parents(".simple-dropdown")) {
                            var i = 0,
                                o = 0,
                                l = 0,
                                s = 0;
                            if (
                                ((i = e.outerWidth() - a.outerWidth()),
                                    e.children(".dropdown-menu").each(function () {
                                        var t = [];
                                        e.find("li").hasClass("dropdown")
                                            ? ((i += e.outerWidth()),
                                                e.find("li.dropdown").each(function () {
                                                    var a = e.closest(".dropdown-menu");
                                                    t.push(a.outerWidth());
                                                }),
                                                (l = o = l + Math.max.apply(Math, t)),
                                                (i += o),
                                                (s += 1))
                                            : s < 1 && (i += e.outerWidth());
                                    }),
                                    i > n - (t.offset().left + t.outerWidth()))
                            ) {
                                if (e.find(".dropdown-menu").length > 0) {
                                    var c = e.position().top,
                                        d = e.find(".dropdown-menu"),
                                        u = c + d.outerHeight() + m(),
                                        p = W();
                                    u > p && d.css("top", "-" + (u - p) + "px");
                                }
                                e.addClass("menu-left");
                            }
                        }
                    })(r),
                    D() > 991 &&
                    (e(n.target).siblings(".dropdown-menu").length && n.preventDefault(),
                        (e(n.target).hasClass("simple-dropdown") || e(n.target).closest(".simple-dropdown").length) &&
                        e("header nav").removeClass("submenu-light").removeClass("submenu-dark"));
            })
            .on("mouseleave", function (t) {
                var a = e(this);
                a.removeClass("menu-left"), a.removeClass("open");
            });
    var c = window.location.href.substr(window.location.href.lastIndexOf("/") + 1),
        d = window.location.hash.substring(1);
    if (
        (d ? ((d = "#" + d), (c = c.replace(d, ""))) : (c = c.replace("#", "")),
            e(".navbar-nav li a, .menu-item-list a").each(function () {
                var t = e(this),
                    a = t.attr("href");
                (a === c || a === c + ".html") &&
                    (t.parent().addClass("active"),
                        t.parents("li.dropdown").addClass("active"),
                        t.parents("li.menu-item").addClass("active"));
            }),
            void 0 !== e.fn.stick_in_parent &&
            null !== e.fn.stick_in_parent &&
            e(".left-sidebar-wrapper").length &&
            e(".left-sidebar-wrapper .left-sidebar-nav").stick_in_parent({ recalc: 1 }),
            "function" == typeof e.fn.smoothScroll)
    ) {
        if (e(".header-reverse").length > 0)
            e(".inner-link").smoothScroll({
                speed: 800,
                offset: -59,
                beforeScroll: function () {
                    e("body").hasClass("left-menu-onepage") && e(".left-modern-header").collapse("hide"),
                        e(".navbar-collapse.collapse").collapse("hide");
                },
            });
        else if (e(".inner-link").length > 0) {
            var u = 0;
            e("nav.navbar").hasClass("disable-fixed") && (u = 1),
                e(".left-modern-menu").hasClass("left-menu-onepage") && 991 >= D() && (u = -59),
                e(".inner-link").smoothScroll({
                    speed: 800,
                    offset: u,
                    beforeScroll: function () {
                        e("body").hasClass("left-menu-onepage") && e(".left-modern-header").collapse("hide"),
                            e("body").hasClass("show-menu") && e("html, body").removeClass("show-menu"),
                            e(".navbar-collapse.collapse").collapse("hide");
                    },
                });
        }
        e(".section-link").length > 0 &&
            e(".section-link").smoothScroll({
                speed: 900,
                offset: 1,
                beforeScroll: function () {
                    e(".navbar-collapse.collapse").collapse("hide");
                },
            });
    }
    function m() {
        var t = 0;
        return (
            e(".header-top-bar").length && (t += e(".header-top-bar").outerHeight()),
            e("header nav.navbar").length && (t += e("header nav.navbar").outerHeight()),
            e(".left-modern-header .left-modern-sidebar").length &&
            (t += e(".left-modern-header .left-modern-sidebar").outerHeight()),
            t
        );
    }
    function p() {
        if (
            (!e("header").hasClass("sticky") && (e(".top-space-margin").length || e(".top-space-padding").length)) ||
            e(".ipad-top-space-margin").length
        ) {
            var t = m();
            e(".top-space-margin").length && e(".top-space-margin").css("margin-top", t),
                e(".top-space-padding").length && e(".top-space-padding").css("padding-top", t),
                e(".ipad-top-space-margin").length &&
                (991 >= D()
                    ? e(".ipad-top-space-margin").css("margin-top", t)
                    : e(".ipad-top-space-margin").css("margin-top", "inherit"));
        }
    }
    function h() {
        e(".left-sidebar-wrapper").length &&
            setTimeout(function () {
                e(".left-sidebar-wrapper").trigger("sticky_kit:recalc");
            }, 500);
    }
    function f(e, t) {
        for (var a = 0; a < e.length; a++) e[a].data("isotope") && e[a].isotope("layout");
    }
    e(".modern-side-menu .menu-item").on("click", function () {
        e(".modern-side-menu .menu-item").removeClass("active"), e(this).addClass("active");
    }),
        "function" == typeof e.fn.mCustomScrollbar &&
        e("[data-scroll-options]").each(function () {
            var t = e(this),
                a = t.data("scroll-options") || '{"theme": "dark"}';
            try {
                t.mCustomScrollbar(a);
            } catch (e) {
                console.error("Error parsing scroll options:", e);
            }
        }),
        "function" == typeof imagesLoaded &&
        e(".portfolio-wrapper, .shop-wrapper").each(function () {
            var t = e(this);
            t.imagesLoaded(function () {
                if (
                    (t.removeClass("grid-loading"),
                        "function" == typeof e.fn.isotope &&
                        t.isotope({
                            layoutMode: "masonry",
                            itemSelector: ".grid-item",
                            percentPosition: !0,
                            stagger: 0,
                            masonry: { columnWidth: ".grid-sizer" },
                        }),
                        n.push(t),
                        "function" == typeof e.fn.isotope)
                ) {
                    var a = e(".portfolio-filter > li.active > a").attr("data-filter");
                    "" != a && null != a && t.isotope({ filter: a });
                }
            }),
                t.on("arrangeComplete", function () {
                    j();
                }),
                e('a[data-bs-toggle="tab"]').on("shown.bs.tab", function (e) {
                    t.isotope({ transitionDuration: 0 });
                });
        }),
        e(document).on("click", ".portfolio-filter > li > a", function () {
            var t = e(this),
                a = t.parents("section");
            a.find(".portfolio-filter > li").removeClass("active"), t.parent().addClass("active");
            var n = t.attr("data-filter"),
                r = a.find(".portfolio-wrapper");
            return (
                r.find(".grid-item[data-anime]").addClass("appear"),
                "function" == typeof r.isotope && r.isotope({ filter: n }),
                a.length && e(a).hasClass("overlap-height") && z(),
                !1
            );
        }),
        e(".threeD-letter-menu .menu-item").each(function () {
            let e = this,
                t = e.querySelector(".menu-item-text"),
                a = t.querySelector("span"),
                n = e.querySelector(".hover-reveal").clientHeight,
                r = e.querySelector(".hover-reveal").clientWidth,
                i = window.innerHeight,
                o = window.innerWidth;
            (t.innerHTML = `<span>${a.innerHTML}</span><span class="clone">${a.innerHTML}</span>`),
                t.querySelectorAll("span").forEach(function (e) {
                    e.setAttribute("data-splitting", !0), Splitting();
                }),
                e.addEventListener("mouseenter", function () {
                    anime({
                        targets: e.querySelector(".hover-reveal"),
                        opacity: [0, 1],
                        duration: 1e3,
                        easing: "easeOutQuad",
                    }),
                        anime({
                            targets: e.querySelector(".hover-reveal__inner"),
                            scale: [0.5, 1],
                            easing: "easeOutQuad",
                        }),
                        anime({ targets: e.querySelector(".hover-reveal__img"), scale: [2, 1], easing: "easeOutQuad" });
                }),
                e.addEventListener("mouseleave", function () {
                    anime({
                        targets: e.querySelector(".hover-reveal"),
                        opacity: 0,
                        duration: 1e3,
                        easing: "easeOutQuad",
                    }),
                        anime({
                            targets: e.querySelector(".hover-reveal__inner"),
                            scale: [1, 0.5],
                            easing: "easeOutQuad",
                        }),
                        anime({ targets: e.querySelector(".hover-reveal__img"), scale: [1, 2], easing: "easeOutQuad" });
                }),
                "undefined" != typeof TweenLite &&
                document.addEventListener("mousemove", function (t) {
                    let a = t.clientX + 20,
                        l = t.clientY + 20;
                    TweenLite.to(e.querySelector(".hover-reveal"), 0.6, {
                        x: a + r > o ? t.clientX - r : a,
                        y: l + n > i ? t.clientY - n : l,
                    });
                });
        });
    let g = document.querySelector(".sticky-image-distortion-wrapper");
    if (void 0 !== g && null != g) {
        let he,
            fe = () => (he = { width: window.innerWidth, height: window.innerHeight });
        fe(),
            window.addEventListener("resize", fe),
            new (class {
                constructor() {
                    (this.DOM = { menu: document.querySelector(".sticky-image-distortion-wrapper nav.menu") }),
                        (this.DOM.menuLinks = [...this.DOM.menu.querySelectorAll(".menu__link")]),
                        (this.mousePos = { x: he.width / 2, y: he.height / 2 }),
                        (this.lastMousePos = {
                            translation: { x: he.width / 2, y: he.height / 2 },
                            displacement: { x: 0, y: 0 },
                        }),
                        (this.dmScale = 0),
                        (this.current = -1),
                        this.initEvents(),
                        requestAnimationFrame(() => this.render());
                }
                initEvents() {
                    let e;
                    document.body.style.setProperty("--body-bgcolor", this.DOM.menuLinks[0].getAttribute("data-bg")),
                        this.DOM.menuLinks.forEach((t, a) => {
                            let n = t.getAttribute("data-img"),
                                r = t.getAttribute("data-bg");
                            t.querySelector(".svg-wrapper").innerHTML =
                                `\n                         <svg class="distort" width="960" height="980" viewBox="0 0 960 980">\n                             <filter id="distortionFilter${a}">\n                                 <feTurbulence type="fractalNoise" baseFrequency="0.01 0.003" numOctaves="5" seed="2" stitchTiles="noStitch" x="0%" y="0%" width="100%" height="100%" result="noise"/>\n                                 <feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="B" x="0%" y="0%" width="100%" height="100%" filterUnits="userSpaceOnUse"/>\n                             </filter>\n                             <g filter="url(#distortionFilter${a})">\n                                 <image class="distort__img" x="80" y="0" xlink:href="${n}" height="980" width="960" />\n                             </g>\n                         </svg>\n                     `;
                            let i = [...t.querySelectorAll("feDisplacementMap")];
                            t.addEventListener("mouseenter", (a) => {
                                t
                                    .closest(".menu")
                                    .childNodes.forEach((e) => e.classList && e.classList.remove("active")),
                                    t.classList.add("active"),
                                    "undefined" != typeof TweenMax &&
                                    t !== e &&
                                    TweenMax.fromTo(i, 1.2, { attr: { scale: 50 } }, { attr: { scale: 0.3 } }),
                                    document.body.style.setProperty("--body-bgcolor", r),
                                    (e = t);
                            }),
                                t.addEventListener("mouseleave", (a) => {
                                    e = t;
                                });
                        });
                }
                render() {
                    requestAnimationFrame(() => this.render());
                }
            })();
    }
    if (document.getElementById("load-more-btn") && document.querySelectorAll("#blog-list .grid-item")) {
        let ge = 9,
            ve = document.querySelectorAll("#blog-list .grid-item"),
            be = document.getElementById("load-more-btn");
        ve.forEach((e, t) => {
            e.style.display = t < ge ? "block" : "none";
        }),
            be.addEventListener("click", () => {
                (ge += 9),
                    ve.forEach((e, t) => {
                        e.style.display = t < ge ? "block" : "none";
                    }),
                    ge >= ve.length && (be.style.display = "none");
            });
    }
    "function" == typeof imagesLoaded &&
        e(".blog-wrapper").each(function () {
            var t = e(this);
            t.imagesLoaded(function () {
                t.removeClass("grid-loading"),
                    "function" == typeof e.fn.isotope &&
                    t.isotope({
                        layoutMode: "masonry",
                        itemSelector: ".grid-item",
                        percentPosition: !0,
                        stagger: 0,
                        masonry: { columnWidth: ".grid-sizer" },
                    }),
                    n.push(t);
                var a = e(".blog-filter > li.active > a").attr("data-filter");
                "" != a && null != a && t.isotope({ filter: a });
            });
        }),
        e(document).on("click", ".blog-filter > li > a", function () {
            var t = e(this),
                a = t.parents("section");
            a.find(".blog-filter > li").removeClass("active"), t.parent().addClass("active");
            var n = t.attr("data-filter"),
                r = a.find(".blog-wrapper");
            return r.find(".grid-item[data-anime]").addClass("appear"), r.isotope({ filter: n }), !1;
        }),
        e(".box-hover")
            .on("mouseenter", function (t) {
                e(this).find(".hover-text").slideDown(400);
            })
            .on("mouseleave", function (t) {
                e(this).find(".hover-text").slideUp(400);
            }),
        "function" == typeof imagesLoaded &&
        e(".gallery-wrapper").each(function () {
            var t = e(this);
            t.imagesLoaded(function () {
                t.removeClass("grid-loading"),
                    "function" == typeof e.fn.isotope &&
                    t.isotope({
                        layoutMode: "masonry",
                        itemSelector: ".grid-item",
                        percentPosition: !0,
                        stagger: 0,
                        masonry: { columnWidth: ".grid-sizer" },
                    }),
                    n.push(t);
            });
        });
    let v = new MutationObserver((t, a) => {
        for (let a of t)
            if ("childList" === a.type) {
                let t = document.querySelector(".mfp-iframe");
                t &&
                    e(t).on("load", function () {
                        e(this).contents().find("img").css({ margin: "auto", width: "100%", height: "100%", objectFit: "contain" });
                    });
            }
    });
    if ((v.observe(document.body, { childList: !0, subtree: !0 }), "function" == typeof e.fn.magnificPopup)) {
        var b = {};
        e(".portfolio-box [data-group], .gallery-box [data-group]").each(function () {
            var t = e(this).attr("data-group");
            b[t] || (b[t] = []), b[t].push(this);
        }),
            e.each(b, function () {
                e(this).magnificPopup({
                    type: "iframe",
                    mainClass: "gallery-iframe",
                    closeOnContentClick: !0,
                    closeBtnInside: !1,
                    gallery: { enabled: !0 },
                });
            });
    }
    if (
        ("function" == typeof imagesLoaded &&
            e(".justified-gallery").length &&
            e(".justified-gallery").each(function () {
                var t = e(this),
                    a =
                        t.attr("data-justified-options") ||
                        '{ "rowHeight": 400, "maxRowHeight": false, "captions": true, "margins": 10, "waitThumbnailsLoad": true }';
                void 0 !== e.fn.justifiedGallery &&
                    null != a &&
                    t.imagesLoaded(function () {
                        (a = e.parseJSON(a)), t.justifiedGallery(a);
                    });
            }),
            e(".accordion").each(function () {
                var t = e(this),
                    a = t.attr("data-active-icon") || "",
                    n = t.attr("data-inactive-icon") || "";
                e(".collapse", this)
                    .on("show.bs.collapse", function () {
                        var t = e(this).attr("id");
                        e('a[data-bs-target="#' + t + '"]')
                            .closest(".accordion-header")
                            .parent(".accordion-item")
                            .addClass("active-accordion"),
                            e('a[data-bs-target="#' + t + '"] i')
                                .addClass(a)
                                .removeClass(n);
                    })
                    .on("hide.bs.collapse", function () {
                        var t = e(this).attr("id");
                        e('a[data-bs-target="#' + t + '"]')
                            .closest(".accordion-header")
                            .parent(".accordion-item")
                            .removeClass("active-accordion"),
                            e('a[data-bs-target="#' + t + '"] i')
                                .addClass(n)
                                .removeClass(a);
                    });
            }),
            e(".checkout-accordion label input").on("click", function (t) {
                var a = e(this).parent().find("a").attr("href");
                e(this).prop("checked") ? e(a).collapse("show") : e(a).collapse("hide");
            }),
            e(".progress-bar").length &&
            e(document).on("appear", ".progress-bar", function (t) {
                if (!e(this).hasClass("appear")) {
                    e(this).addClass("appear");
                    var a = e(this).attr("aria-valuenow");
                    e(this).animate(
                        { width: a + "%" },
                        {
                            duration: 300,
                            easing: "swing",
                            progress: function (t, n, r) {
                                var i = parseInt(a * n);
                                e(this)
                                    .find("span")
                                    .html(i + "%");
                            },
                        }
                    );
                }
            }),
            e('[data-tab="review-tab"]').on("shown.bs.tab", function (t) {
                e(".progress-bar").each(function () {
                    e(this).appear().trigger("resize");
                });
            }),
            e(".pie-chart-style-01").length &&
            "function" == typeof e.fn.easyPieChart &&
            e(document.body).on("appear", ".pie-chart-style-01", function (t) {
                e(".pie-chart-style-01").easyPieChart({
                    trackColor: "#232323",
                    scaleColor: "",
                    lineCap: "round",
                    lineWidth: 10,
                    size: 180,
                    barColor: function () {
                        (ae = e(this.el).attr("data-start-color") || e(this.el).attr("data-bar-color") || "#000"),
                            (ne = e(this.el).attr("data-end-color") || e(this.el).attr("data-bar-color") || "#000");
                        var t = this.renderer.getCtx(),
                            a = this.renderer.getCanvas(),
                            n = t.createLinearGradient(0, 0, a.width, 270);
                        return n.addColorStop(0.2, ae), n.addColorStop(0, ne), n;
                    },
                    animate: { duration: 2e3, enabled: !0 },
                    onStep: function (t, a, n) {
                        e(this.el)
                            .find(".percent")
                            .text(Math.round(n) + "%");
                    },
                });
            }),
            o ||
            e(document).on("mousemove", ".mousetip-wrapper", function (t) {
                var a = t.pageX - e(this).offset().left + 20,
                    n = t.pageY - e(this).offset().top + 20;
                e(this).find(".caption").show().css({ top: n, left: a });
            }),
            e(".vertical-counter").each(function () {
                for (var t = e(this), a = t.attr("data-to"), n = a.toString().split(""), r = a.length, i = 0; i < r; i++)
                    t.append(
                        '<span class="vertical-counter-number"><ul><li>0</li><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li><li>6</li><li>7</li><li>8</li><li>9</li></ul></span>'
                    );
                t.find(".vertical-counter-number").each(function (t) {
                    e(this).attr("data-to", n[t]);
                });
            }),
            e(".vertical-counter").length)
    ) {
        function ye() {
            e(".vertical-counter").each(function () {
                var t = e(this).find(".vertical-counter-number").find("li").height();
                e(this).height(t);
            });
        }
        ye(),
            e(window).resize(function () {
                ye();
            }),
            e(document).on("appear", ".vertical-counter", function (t) {
                !e(this).hasClass("appear") &&
                    (e(this).addClass("appear"),
                        e(window).scrollTop() + W() >= e(".vertical-counter").offset().top &&
                        e(this)
                            .find(".vertical-counter-number")
                            .each(function () {
                                var t = e(this).attr("data-to");
                                t <= 9 &&
                                    anime({
                                        targets: this.querySelector("ul"),
                                        translateY: [0, -10 * t + "%"],
                                        duration: 2e3,
                                        easing: "easeOutCubic",
                                    });
                            }));
            }),
            e('a[data-bs-toggle="tab"]').on("shown.bs.tab", function (t) {
                e(`${e(this).attr("href")}`)
                    .find(".vertical-counter")
                    .each(function () {
                        var t = e(this),
                            a = t.attr("data-to"),
                            n = t.find("li").height();
                        t.height(n), a <= 9 && t.find("ul").css({ transform: "translateY(-" + 10 * a + "%)" });
                    });
            });
    }
    function y() {
        e(".sliding-box").each(function (t, a) {
            var n = e(a),
                r = n.outerWidth(),
                i = n.find(".sliding-box-item").length,
                o =
                    (r - (30 * i + 30 + parseInt(n.css("padding-right")) / i + parseInt(n.css("padding-left")) / i)) /
                    (i + 1),
                l = 2 * o;
            n.find(".sliding-box-item, .sliding-box-img, .sliding-box-item .sliding-box-content").css("width", o),
                n.find(".sliding-box-item .sliding-box-content").css("left", o),
                n.find(".sliding-box-item.active").css("width", l),
                e(document).on("mouseenter", ".sliding-box .sliding-box-item", function () {
                    e(this).siblings().removeClass("active"),
                        e(this).addClass("active"),
                        n
                            .find(".sliding-box-item, .sliding-box-img, .sliding-box-item .sliding-box-content")
                            .css("width", o),
                        n.find(".sliding-box-item .sliding-box-content").css("left", o),
                        n.find(".sliding-box-item.active").css("width", l);
                });
        });
    }
    function w() {
        e(".interactive-banner-style-02").each(function () {
            let t = e(this),
                a = t.find("figure"),
                n = t.find("figcaption");
            setTimeout(function () {
                a.css({ "padding-bottom": n.outerHeight() });
            }, 500);
        });
    }
    function C(e, t) {
        let a = e,
            n = t.staggervalue || 0,
            r = t.delay || 0,
            i = anime.timeline();
        function o(e) {
            for (let a = 0; a < e.length; a++) {
                let n = e[a];
                (n.style.transition = "none"), t.willchange && (n.style.willChange = "transform");
            }
        }
        if (("childs" === t.el && ((a = e.children), o(e.children)), "lines" === t.el)) {
            function l() {
                let t = Splitting({ target: e, by: "lines" })[0].lines.map((e) => e.map((e) => e.innerHTML).join(" "));
                e.innerHTML = t.map((e) => `<span class="d-inline-flex">${e}</span>`).join(" ");
            }
            l(), o(e.children), (a = e.children);
        }
        if ("words" === t.el) {
            Splitting({ target: e, by: "words" })[0].words.join(" "), o(e.children), (a = e.children);
        }
        t.perspective && (e.style.perspective = `${t.perspective}px`),
            t.willchange && (e.style.willChange = t.willchange),
            i.add({
                targets: a,
                ...t,
                delay: anime.stagger(n, { start: r }),
                complete: function () {
                    if (t.el) {
                        e.classList.add("anime-child"), e.classList.add("anime-complete");
                        for (let t = 0; t < e.children.length; t++) {
                            let a = e.children[t];
                            a.style.removeProperty("opacity"),
                                a.style.removeProperty("transform"),
                                a.style.removeProperty("transition"),
                                e.classList.contains("grid") && (a.style.transition = "none");
                        }
                        if ("lines" === t.el)
                            for (let t = 0; t < e.children.length; t++) {
                                let a = e.children[t];
                                a.classList.remove("d-inline-flex"),
                                    a.classList.add("d-inline"),
                                    (a.style.willChange = "inherit");
                            }
                    } else
                        e.classList.add("anime-complete"),
                            e.style.removeProperty("opacity"),
                            e.style.removeProperty("transform"),
                            e.style.removeProperty("transition");
                },
            });
    }
    e('[data-tab="counter"]').on("shown.bs.tab", function (t) {
        e(".vertical-counter").each(function () {
            e(this).appear().trigger("resize");
        });
    }),
        "function" == typeof e.fn.countTo &&
        e(".counter").length &&
        e(document).on("appear", ".counter", function (t) {
            var a = e(this);
            if (!a.hasClass("appear")) {
                var n = a.data("countToOptions") || {};
                a.countTo(n), a.addClass("appear");
            }
        }),
        e(document).on("click", ".html-video-play", function () {
            var t = e(this).parents("section").find(".video-bg");
            !1 === e(this).is("[playing]")
                ? (t.trigger("play"),
                    e(this).attr("playing", "true"),
                    e(this).parents("section").find(".video-play-icon").addClass("remove-play-icon"))
                : (t.trigger("pause"),
                    e(this).removeAttr("playing"),
                    e(this).parents("section").find(".video-play-icon").removeClass("remove-play-icon"));
        }),
        "function" == typeof e.fn.fitVids && e(".fit-videos").fitVids(),
        void 0 !== e.fn.countdown &&
        null !== e.fn.countdown &&
        e(".countdown").each(function () {
            var t = e(this);
            t.countdown(t.attr("data-enddate"))
                .on("update.countdown", function (e) {
                    t.html(
                        e.strftime(
                            '<div class="counter-container"><div class="countdown-box first"><div class="number">%-D</div><span>Days</span></div><div class="countdown-box"><div class="number">%H</div><span>Hours</span></div><div class="countdown-box"><div class="number">%M</div><span>Minutes</span></div><div class="countdown-box last"><div class="number">%S</div><span>Seconds</span></div></div>'
                        )
                    );
                })
                .on("finish.countdown", function (e) {
                    t.html(
                        e.strftime(
                            '<div class="counter-container"><div class="countdown-box first" data-number="00"><div class="number">00</div><span>Days</span></div><div class="countdown-box"><div class="number">00</div><span>Hours</span></div><div class="countdown-box"><div class="number">00</div><span>Minutes</span></div><div class="countdown-box last"><div class="number">00</div><span>Seconds</span></div></div>'
                        )
                    );
                });
        }),
        e("[data-anime]:not(.swiper [data-anime])").each(function () {
            let t = e(this),
                a = t.data("anime");
            if (a && D() > 1199)
                try {
                    let e = a.effect && a.effect.toLowerCase();
                    t.on("appear", function () {
                        t.hasClass("appear") || (t.addClass("appear"), "slide" === e ? x(this, a) : C(this, a)),
                            t.hasClass("grid") && t.find(".grid-sizer").removeAttr("style");
                    });
                } catch (e) {
                    console.error("Error parsing anime options:", e);
                }
            else t.removeAttr("data-anime"), e("body").addClass("no-animation");
        });
    let x = (e, t) => {
        let a = t.speed ? t.speed : 100,
            n = t.direction ? t.direction : "lr",
            r = t.delay ? t.delay : 0;
        e.style.position = "relative";
        let i = document.createElement("div");
        (i.style.width = i.style.height = "100%"),
            (i.style.top = i.style.left = 0),
            (i.style.background = t.color ? t.color : "#fff"),
            (i.style.position = "absolute"),
            "lr" === n
                ? ((i.style.WebkitTransformOrigin = i.style.transformOrigin = "0% 50%"),
                    (i.style.WebkitTransform = i.style.transform = "scaleX(0)"))
                : "tb" === n
                    ? ((i.style.WebkitTransformOrigin = i.style.transformOrigin = "50% 0%"),
                        (i.style.WebkitTransform = i.style.transform = "scaleY(0)"))
                    : "bt" === n
                        ? ((i.style.WebkitTransformOrigin = i.style.transformOrigin = "100% 100%"),
                            (i.style.WebkitTransform = i.style.transform = "scaleY(0)"))
                        : ((i.style.WebkitTransformOrigin = i.style.transformOrigin = "100% 50%"),
                            (i.style.WebkitTransform = i.style.transform = "scaleX(0)")),
            e.appendChild(i),
            anime
                .timeline()
                .add({
                    targets: i,
                    scaleX: "lr" === n || "rl" === n ? [0, 1] : [1, 1],
                    scaleY: "tb" === n || "bt" === n ? [0, 1] : [1, 1],
                    duration: a + 500,
                    easing: "easeInOutCubic",
                    delay: r,
                    complete: function () {
                        (i.style.WebkitTransformOrigin = i.style.transformOrigin =
                            "lr" === n ? "100% 50%" : "tb" === n ? "50% 100%" : "bt" === n ? "0% 0%" : "0% 50%"),
                            anime({
                                targets: i,
                                duration: a + 500,
                                easing: "easeInOutCubic",
                                scaleX: "lr" === n || "rl" === n ? [1, 0] : [1, 1],
                                scaleY: "tb" === n || "bt" === n ? [1, 0] : [1, 1],
                                complete: function () {
                                    e.removeChild(i), "function" == typeof callback && callback();
                                },
                            });
                    },
                })
                .add(
                    {
                        targets: e.querySelector("*"),
                        easing: "easeOutQuint",
                        delay: "lr" === n ? anime.stagger(a, { start: 1e3 }) : anime.stagger(-a, { start: 1e3 }),
                        opacity: [0, 1],
                    },
                    "-=900"
                );
    },
        k = (e, t) => {
            let a = t.duration ? (t.duration <= 2e3 ? 2e3 : t.duration) : 2e3,
                n = t.string,
                r = anime.timeline(),
                i = (e, t, a, n, r) => {
                    var i = (e - t) / (a - n);
                    return i * r + (t - i * n);
                };
            r.add({
                targets: e.querySelectorAll(".anime-text > .word > .char"),
                duration: 800,
                easing: "easeOutElastic",
                opacity: 1,
                translateY: function (e, t) {
                    var a = e.parentNode,
                        n = a.lastElementChild.offsetWidth,
                        r = a.firstElementChild.offsetLeft,
                        o = a.offsetWidth - n - r - (a.offsetWidth - n - a.lastElementChild.offsetLeft);
                    return [Math.abs(i(0, 100, r + o / 2, r, e.offsetLeft)) + "%", "0%"];
                },
                rotateZ: function (e, t) {
                    var a = e.parentNode,
                        n = a.lastElementChild.offsetWidth,
                        r = a.firstElementChild.offsetLeft;
                    return [
                        i(
                            90,
                            -90,
                            r +
                            (a.offsetWidth -
                                n -
                                a.firstElementChild.offsetLeft -
                                (a.offsetWidth - n - a.lastElementChild.offsetLeft)),
                            r,
                            e.offsetLeft
                        ),
                        0,
                    ];
                },
            }).add(
                {
                    targets: e.querySelectorAll(".anime-text > .word > .char"),
                    duration: 1e3,
                    easing: "easeInExpo",
                    opacity: n.length > 1 ? 0 : 1,
                    translateY: function (e, t) {
                        var a = e.parentNode,
                            r = a.lastElementChild.offsetWidth,
                            o = a.firstElementChild.offsetLeft,
                            l = a.offsetWidth - r - o - (a.offsetWidth - r - a.lastElementChild.offsetLeft),
                            s = i(0, 100, o + l / 2, o, e.offsetLeft);
                        return n.length > 1 ? [-Math.abs(s) + "%"] : [Math.abs(s) + "%", "0%"];
                    },
                    rotateZ: function (e, t) {
                        var a = e.parentNode,
                            r = a.lastElementChild.offsetWidth,
                            o = a.firstElementChild.offsetLeft,
                            l = i(
                                -90,
                                90,
                                o +
                                (a.offsetWidth -
                                    r -
                                    a.firstElementChild.offsetLeft -
                                    (a.offsetWidth - r - a.lastElementChild.offsetLeft)),
                                o,
                                e.offsetLeft
                            );
                        return n.length > 1 ? [l] : [l, 0];
                    },
                },
                a - 1500
            );
        },
        S = (e, t) => {
            let a = e.querySelectorAll(".anime-text")[0],
                n = t.speed ? t.speed : 100;
            a.style.position = "relative";
            let r = document.createElement("div");
            (r.style.width = r.style.height = "100%"),
                (r.style.top = r.style.left = 0),
                (r.style.background = t.color ? t.color : "#fff"),
                (r.style.position = "absolute"),
                (r.style.WebkitTransform = r.style.transform = "scaleX(0)"),
                (r.style.WebkitTransformOrigin = r.style.transformOrigin = "0% 50%"),
                "left" === t.direction && (r.style.WebkitTransformOrigin = r.style.transformOrigin = "100% 50%"),
                a.appendChild(r),
                anime
                    .timeline()
                    .add({
                        targets: a.querySelectorAll("div"),
                        scaleX: [0, 1],
                        duration: n + 500,
                        easing: "easeInOutCubic",
                        complete: function () {
                            "left" === t.direction
                                ? (r.style.WebkitTransformOrigin = r.style.transformOrigin = "0% 50%")
                                : (r.style.WebkitTransformOrigin = r.style.transformOrigin = "100% 50%"),
                                anime({
                                    targets: r,
                                    duration: n + 500,
                                    easing: "easeInOutCubic",
                                    scaleX: [1, 0],
                                    complete: function () {
                                        a.removeChild(r), "function" == typeof callback && callback();
                                    },
                                });
                        },
                    })
                    .add(
                        {
                            targets: e.querySelectorAll(".anime-text > .word > .char"),
                            easing: "easeOutQuint",
                            delay:
                                "left" === t.direction
                                    ? anime.stagger(n, { start: 1e3 })
                                    : anime.stagger(-n, { start: 1e3 }),
                            opacity: [0, 1],
                            translateX: "left" === t.direction ? [100, 0] : [-100, 0],
                        },
                        "-=600"
                    );
        },
        q = (e, t) => {
            let a = t.duration ? t.duration : 3e3,
                n = t.direction,
                r = t.string,
                i = t.speed;
            anime
                .timeline()
                .add({
                    targets: e.querySelectorAll(".anime-text > .word > .char"),
                    opacity: [0, 1],
                    translateY: "down" === n ? [-20, 0] : [20, 0],
                    delay: anime.stagger(i || 50),
                })
                .add({
                    targets: e.querySelectorAll(".anime-text .word .char"),
                    opacity: r.length > 1 ? [1, 0] : [1, 1],
                    translateY: r.length > 1 ? ("down" === n ? [0, 20] : [0, -20]) : [0, 0],
                    delay: anime.stagger(i || 50, { start: a - 1500 }),
                });
        },
        T = (e, t) => {
            let a = t.duration ? t.duration : 3e3,
                n = t.direction,
                r = t.string,
                i = t.speed;
            anime
                .timeline()
                .add({
                    targets: e.querySelectorAll(".anime-text > .word > .char"),
                    opacity: [0, 1],
                    translateY: "down" === n ? [-50, 0] : [50, 0],
                    duration: 500,
                    easing: "easeOutQuad",
                    delay: anime.stagger(i || 40, { direction: "reverse" }),
                })
                .add({
                    targets: e.querySelectorAll(".anime-text .word .char"),
                    opacity: r.length > 1 ? [1, 0] : [1, 1],
                    translateY: r.length > 1 ? ("down" === n ? 50 : -50) : 0,
                    duration: 500,
                    easing: "easeOutQuad",
                    delay: anime.stagger(i || 40, { start: a - 1e3, direction: "reverse" }),
                });
        },
        L = (e, t) => {
            let a = t.duration ? t.duration : 3e3,
                n = t.string,
                r = t.speed;
            anime
                .timeline()
                .add({
                    targets: e.querySelectorAll(".anime-text > .word > .char"),
                    opacity: [0, 1],
                    rotateX: [-70, 0],
                    duration: 150,
                    delay: anime.stagger(r || 50),
                    easing: "linear",
                })
                .add({
                    targets: e.querySelectorAll(".anime-text > .word > .char"),
                    opacity: n.length > 1 ? 0 : 1,
                    rotateX: n.length > 1 ? [0, 70] : [0, 0],
                    duration: 150,
                    delay: anime.stagger(r || 50, { start: a - 1500 }),
                    easing: "linear",
                });
        },
        P = (e, t) => {
            let a = t.duration ? t.duration : 3e3,
                n = t.string,
                r = t.speed,
                i = t.delay;
            anime
                .timeline()
                .add({
                    targets: e.querySelectorAll(".anime-text > .word > .char"),
                    scale: [0, 1],
                    duration: 1500,
                    elasticity: 600,
                    transformOrigin: "50% 100%",
                    delay: anime.stagger(r || 45, { start: i }),
                })
                .add(
                    {
                        targets: e.querySelectorAll(".anime-text > .word > .char"),
                        opacity: n.length > 1 ? 0 : 1,
                        scale: n.length > 1 ? 0 : 1,
                        duration: 500,
                        easing: "easeOutExpo",
                        delay: anime.stagger(r || 45),
                    },
                    "+=" + (a - 2300)
                );
        },
        O = (e, t) => {
            let a = t.duration ? t.duration : 3e3,
                n = t.string,
                r = t.speed;
            anime
                .timeline()
                .add({
                    targets: e.querySelectorAll(".anime-text > .word > .char"),
                    scale: [4, 1],
                    opacity: [0, 1],
                    translateZ: 0,
                    easing: "easeOutExpo",
                    duration: 950,
                    delay: anime.stagger(r || 70),
                })
                .add(
                    {
                        targets: e.querySelectorAll(".anime-text > .word"),
                        opacity: n.length > 1 ? 0 : 1,
                        duration: 1e3,
                        easing: "easeOutExpo",
                        delay: 1e3,
                    },
                    "+=" + (a - 2500)
                );
        },
        A = (e, t) => {
            let a = t.duration ? t.duration : 3e3,
                n = t.string,
                r = t.speed,
                i = t.direction;
            anime
                .timeline()
                .add({
                    targets: e.querySelectorAll(".anime-text > .word > .char"),
                    translateX: "right" === i ? [-40, 0] : [40, 0],
                    translateZ: 0,
                    opacity: [0, 1],
                    easing: "easeOutExpo",
                    duration: 1200,
                    delay: anime.stagger(r || 75, { direction: "right" === i ? "reverse" : "normal" }),
                })
                .add({
                    targets: e.querySelectorAll(".anime-text > .word > .char"),
                    translateX: n.length > 1 ? ("left" === i ? -40 : 40) : 0,
                    opacity: n.length > 1 ? 0 : 1,
                    easing: "easeInExpo",
                    duration: 500,
                    delay: anime.stagger(r || 75, { start: a - 2500, direction: "right" === i ? "reverse" : "normal" }),
                });
        },
        E = (e, t) => {
            let a = t.duration ? t.duration : 3e3,
                n = t.string,
                r = t.speed;
            anime
                .timeline()
                .add({
                    targets: e.querySelectorAll(".anime-text > .word > .char"),
                    translateY: [100, 0],
                    translateZ: 0,
                    opacity: [0, 1],
                    easing: "easeOutExpo",
                    delay: anime.stagger(r || 30),
                })
                .add({
                    targets: e.querySelectorAll(".anime-text > .word > .char"),
                    translateY: n.length > 1 ? [0, -100] : [0, 0],
                    opacity: n.length > 1 ? [1, 0] : [1, 1],
                    easing: "easeInExpo",
                    delay: anime.stagger(r || 40, { start: a - 3e3 }),
                });
        };
    function M(e, t) {
        let a = t.effect,
            n = t.duration ? t.duration : 3e3,
            r = t.string,
            i = t.speed,
            o = t.delay;
        if (r) {
            if (
                ((e.innerHTML = `<span class="anime-text">${r[0]}</span>`),
                    e.querySelector(".anime-text").setAttribute("data-splitting", !0),
                    Splitting(),
                    D() > 1199)
            ) {
                switch (a) {
                    case "wave":
                        q(e, t);
                        break;
                    case "smooth-wave":
                        T(e, t);
                        break;
                    case "curve":
                        k(e, t);
                        break;
                    case "rotate":
                        L(e, t);
                        break;
                    case "slide":
                        S(e, t);
                        break;
                    case "jump":
                        P(e, t);
                        break;
                    case "zoom":
                        O(e, t);
                        break;
                    case "rubber-band":
                        A(e, t);
                        break;
                    case "fade":
                        E(e, t);
                }
                void 0 === a &&
                    anime({
                        targets: e.querySelectorAll(".anime-text > .word > .char"),
                        ...t,
                        delay: anime.stagger(i || 0, { start: o || 0 }),
                    });
            }
            if (r.length > 1) {
                let l = 1;
                setInterval(function () {
                    let n = document.createElement("span");
                    switch (
                    (n.classList.add("anime-text"),
                        (n.innerHTML = r[l]),
                        n.setAttribute("data-splitting", !0),
                        e.querySelector(".anime-text").replaceWith(n),
                        Splitting(),
                        ++l === r.length && (l = 0),
                        a)
                    ) {
                        case "wave":
                            q(e, t);
                            break;
                        case "smooth-wave":
                            T(e, t);
                            break;
                        case "curve":
                            k(e, t);
                            break;
                        case "rotate":
                            L(e, t);
                            break;
                        case "slide":
                            S(e, t);
                            break;
                        case "jump":
                            P(e, t);
                            break;
                        case "zoom":
                            O(e, t);
                            break;
                        case "rubber-band":
                            A(e, t);
                            break;
                        case "fade":
                            E(e, t);
                    }
                    void 0 === a &&
                        anime({
                            targets: e.querySelectorAll(".anime-text > .word > .char"),
                            ...t,
                            delay: anime.stagger(i || 0, { start: o || 0 }),
                        });
                }, n);
            }
        }
    }
    if (
        (e("[data-fancy-text]").each(function () {
            let t = e(this),
                a = t.data("fancy-text");
            a &&
                (t.hasClass("swiper-parallax-fancy-text")
                    ? M(this, a)
                    : t.on("appear", function () {
                        t.hasClass("appear") || (t.addClass("appear"), M(this, a));
                    }));
        }),
            document.querySelectorAll(".instafeed-wrapper").forEach(function (t) {
                var a =
                    "IGQWRPZA29XcnJtQ3lydUp4dHNvX0cwX1pSMzRlMm5sOGJ0bXpPS3h5dEVIN2ozQVkwb0VGMVNMNlh4eVBVUVN5WnBVR2tVeGdnbER5dWhJUUxCZAGo1TXBuRkxmcWU2dW9fYkJDaVRSM0RCNlFQUTZAmOFJKOUJsTnMZD",
                    r = e(t),
                    i = ((a = r.attr("data-token") || a), r.attr("data-total") || "6"),
                    o = r.attr("data-slider-options"),
                    l = r.html(),
                    s = "";
                null != o && r.html(""),
                    e.ajax({
                        url:
                            "https://graph.instagram.com/me/media?fields=id,media_type,media_url,timestamp,permalink&access_token=" +
                            a,
                        type: "GET",
                        success: function (a) {
                            for (var c in ((s += r.find(".grid-item").length ? '<li class="grid-sizer"></li>' : ""),
                                a.data))
                                if (c < parseInt(i) && "IMAGE" == a.data[c].media_type) {
                                    var d = a.data[c].permalink || "",
                                        u = a.data[c].media_url || "",
                                        m = a.data[c].like_count || "",
                                        p = a.data[c].comments_count || "";
                                    s += l
                                        .replace(' href="#"', "")
                                        .replace(' src="#"', "")
                                        .replace("data-href", "href")
                                        .replace("data-src", "src")
                                        .replace("{{link}}", d)
                                        .replace("{{image}}", u)
                                        .replace("{{likes}}", m)
                                        .replace("{{comments}}", p);
                                }
                            if ((r.html(s), null != o)) {
                                var h = e.parseJSON(o),
                                    f = t.parentElement;
                                "function" == typeof Swiper && new Swiper(f, h);
                            } else
                                r.imagesLoaded(function () {
                                    r.removeClass("grid-loading"),
                                        "function" == typeof e.fn.isotope &&
                                        r.isotope({
                                            layoutMode: "masonry",
                                            itemSelector: ".grid-item",
                                            percentPosition: !0,
                                            stagger: 0,
                                            masonry: { columnWidth: ".grid-sizer" },
                                        }),
                                        n.push(r);
                                });
                        },
                        error: function (e) {
                            r.append('<div class="col-12"><span class=text-center>No Images Found</span></div>');
                        },
                    });
            }),
            "function" == typeof e.fn.magnificPopup && e("#subscribe-popup").length > 0)
    ) {
        let we = "crafto-promo-popup";
        "shown" !=
            (function (e) {
                for (var t = e + "=", a = decodeURIComponent(document.cookie).split(";"), n = 0; n < a.length; n++) {
                    for (var r = a[n]; " " == r.charAt(0);) r = r.substring(1);
                    if (0 == r.indexOf(t)) return r.substring(t.length, r.length);
                }
                return "";
            })(we) &&
            setTimeout(function () {
                e.magnificPopup.open({
                    showCloseBtn: !1,
                    items: { src: "#subscribe-popup" },
                    type: "inline",
                    mainClass: "my-mfp-zoom-in",
                    callbacks: {
                        close: function () {
                            var t, a, n;
                            e("#newsletter-off").is(":checked") &&
                                ((t = we),
                                    (a = new Date()).setTime(a.getTime() + 2592e6),
                                    (n = a.toUTCString()),
                                    (document.cookie = t + "=shown;expires=" + n + ";path=/"));
                        },
                    },
                });
            }, 5250);
    }
    function I() {
        var t = e(window).scrollTop(),
            a = e(".navbar-nav li a");
        a.each(function () {
            var n = e(this),
                r = n.attr("href").indexOf("#");
            if (r > -1) {
                var i = n.attr("href").substring(r);
                if ("" != i && "#" != i && e(i).length) {
                    var o = e(n.attr("href"));
                    o.position().top <= t + 60 &&
                        o.position().top + o.height() > t + 60 &&
                        (a.removeClass("active"), n.addClass("active")),
                        t < 1 && n.removeClass("active");
                }
            }
        });
        var n = 0,
            r = 0;
        e("header nav.navbar").length && (n = e("header nav.navbar").outerHeight()),
            e(".header-top-bar").length && (r = e(".header-top-bar").outerHeight());
        var i = n + r;
        !e("header").hasClass("no-sticky") &&
            (t >= i
                ? (e("header").addClass("sticky"),
                    e(".header-top-bar").is(":hidden")
                        ? e(".header-top-bar, .header-top-bar + .navbar").css({ top: "" })
                        : (e(".header-top-bar").css({ top: "-" + r + "px" }),
                            e(".header-top-bar + .navbar").css({ top: "0px" })))
                : t <= i &&
                (e("header").removeClass("sticky"),
                    e(".header-top-bar").is(":hidden")
                        ? e(".header-top-bar, .header-top-bar + .navbar").css({ top: "" })
                        : (e(".header-top-bar").css({ top: "0px" }),
                            e(".header-top-bar + .navbar").css({ top: r + "px" })))),
            t > i + 150 &&
            setTimeout(function () {
                e("header").addClass("sticky-active");
            }, 300),
            t < i &&
            setTimeout(function () {
                e("header").removeClass("sticky-active");
            }, 300),
            t >= 200 && D() > 991 && e(".dropdown").trigger("mouseleave"),
            t > 150 ? e(".scroll-top-arrow").fadeIn("300") : e(".scroll-top-arrow").fadeOut("300"),
            t <= 0 &&
            setTimeout(function () {
                B(), p();
            }, 300),
            t;
    }
    function W() {
        return e(window).height();
    }
    function D() {
        return e(window).width();
    }
    function B() {
        var t = e(".full-screen"),
            a = W(),
            n = m();
        e("header").hasClass("sticky") ||
            t.parents("section").imagesLoaded(function () {
                (e("section:first.full-screen, section:first .full-screen").length &&
                    (e(".top-space-margin").length || e(".mobile-top-space").length)) ||
                    e(".ipad-top-space-margin").length
                    ? e(".ipad-top-space-margin").length
                        ? 991 >= D()
                            ? e("section:first.full-screen, section:first .full-screen").css("height", a - n)
                            : e("section:first.full-screen, section:first .full-screen").css("height", a)
                        : e("section:first.full-screen, section:first .full-screen").css("height", a - n)
                    : ((e("header nav.navbar").hasClass("top-space-margin") ||
                        e("header nav.navbar").hasClass("mobile-top-space")) &&
                        (e("header nav.navbar").hasClass("ipad-top-space-margin")
                            ? 991 >= D() && (a -= e("header nav.navbar").outerHeight())
                            : (a -= e("header nav.navbar").outerHeight())),
                        t.css("height", a));
            });
    }
    function H() {
        !(window.navigator.userAgent.indexOf("MSIE ") > 0 || navigator.userAgent.match(/Trident.*rv\:11\./)) &&
            (void 0 !== e.fn.parallax &&
                (e.fn.parallax, 1) &&
                (e("[data-parallax-background-ratio]").each(function () {
                    var t = e(this).attr("data-parallax-background-ratio") || 0.5;
                    e(this).parallax("50%", t);
                }),
                    e("[data-parallax-layout-ratio]").each(function () {
                        var t = e(this).attr("data-parallax-layout-ratio") || 1;
                        e(this).parallaxImg(t);
                    })),
                e("[data-parallax-liquid]").each(function () {
                    var t = e(this).attr("data-parallax-scale") || 0,
                        a = parseFloat(e(this).attr("data-parallax-scale-fraction")),
                        n = !!e(this).attr("data-parallax-reverse") && e(this).attr("data-parallax-reverse"),
                        r = parseFloat(e(this).attr("data-parallax-transition"))
                            ? parseFloat(e(this).attr("data-parallax-transition"))
                            : 1.5;
                    void 0 !== e.fn.parallaxLiquidImg &&
                        (e.fn.parallaxLiquidImg, 1) &&
                        e(this).parallaxLiquidImg(r, parseFloat(t), a, n);
                }));
    }
    function z() {
        (e(".overlap-section").length > 0 ||
            e(".overlap-section-one-fourth").length > 0 ||
            e(".overlap-section-three-fourth").length > 0) &&
            e(".overlap-section, .overlap-section-one-fourth, .overlap-section-three-fourth").each(function () {
                let t = e(this),
                    a = 767;
                t.hasClass("md-overlap-disable") ? (a = 991) : t.hasClass("sm-overlap-disable") && (a = 767),
                    D() > a
                        ? setTimeout(function () {
                            t.imagesLoaded(function () {
                                var e = t.closest("section");
                                t.closest("footer").length && (e = t.closest("footer"));
                                var a = parseInt(e.css("padding-top")),
                                    n = t.find("*").outerHeight(),
                                    r = n + a;
                                (r = t.hasClass("overlap-section-one-fourth")
                                    ? n / 4 - r
                                    : t.hasClass("overlap-section-three-fourth")
                                        ? (3 * n) / 4 - r
                                        : n / 2 - r),
                                    t.css("margin-top", r);
                                var i = e.prev(".overlap-height"),
                                    o = i.find(".overlap-gap-section");
                                i.imagesLoaded(function () {
                                    if (o.length > 0) {
                                        var e = o.outerHeight() + (Math.abs(r) - a);
                                        o.parents(".overlap-height").height(e);
                                    }
                                });
                            });
                        }, 500)
                        : setTimeout(function () {
                            e(".overlap-height").height("inherit"),
                                e(".overlap-section, .overlap-section-one-fourth, .overlap-section-three-fourth").css(
                                    "margin-top",
                                    "inherit"
                                );
                        }, 500);
            });
    }
    function R(t) {
        e(".overlap-section-bottom").length > 0 && D() >= 768
            ? e(".overlap-section-bottom").each(function () {
                var a = e(this);
                setTimeout(
                    function () {
                        a.imagesLoaded(function () {
                            var e = a.outerHeight();
                            a
                                .parents("section")
                                .next(".overlap-gap-section-bottom")
                                .css("margin-top", e / 2 - e),
                                a.parents("section").next(".overlap-gap-section-bottom").css("padding-top", e);
                        });
                    },
                    a.find(".instafeed-wrapper").length > 0 ? t : 10
                );
            })
            : (e(".overlap-gap-section-bottom").css("margin-top", ""),
                e(".overlap-gap-section-bottom").css("padding-top", ""));
    }
    if (
        ("function" == typeof e.fn.magnificPopup &&
            (e(".modal-popup").magnificPopup({ type: "inline", preloader: !1, blackbg: !0 }),
                e(document).on("click", ".popup-modal-dismiss", function (t) {
                    t.preventDefault(), e.magnificPopup.close();
                }),
                e(".popup-with-zoom-anim").magnificPopup({
                    type: "inline",
                    fixedContentPos: !1,
                    fixedBgPos: !0,
                    overflowY: "auto",
                    closeBtnInside: !0,
                    preloader: !1,
                    midClick: !0,
                    removalDelay: 300,
                    blackbg: !0,
                    mainClass: "my-mfp-zoom-in",
                }),
                e(".popup-with-move-anim").magnificPopup({
                    type: "inline",
                    fixedContentPos: !1,
                    fixedBgPos: !0,
                    overflowY: "auto",
                    closeBtnInside: !0,
                    preloader: !1,
                    midClick: !0,
                    removalDelay: 300,
                    blackbg: !0,
                    mainClass: "my-mfp-slide-bottom",
                }),
                e(".slide-up-animation").magnificPopup({
                    type: "inline",
                    fixedContentPos: !1,
                    fixedBgPos: !0,
                    overflowY: "auto",
                    closeBtnInside: !0,
                    preloader: !1,
                    midClick: !0,
                    removalDelay: 300,
                    blackbg: !0,
                    mainClass: "my-mfp-slide-up",
                }),
                e(".popup-with-form").magnificPopup({
                    type: "inline",
                    preloader: !1,
                    fixedContentPos: !0,
                    focus: "#name",
                    callbacks: {
                        beforeOpen: function () {
                            700 > e(window).width() ? (this.st.focus = !1) : (this.st.focus = "#name");
                        },
                    },
                }),
                e(".popup-youtube, .popup-vimeo, .popup-googlemap").magnificPopup({
                    disableOn: 320,
                    type: "iframe",
                    mainClass: "mfp-fade",
                    removalDelay: 160,
                    preloader: !1,
                    fixedContentPos: !0,
                    closeBtnInside: !1,
                }),
                e(".ajax-popup").magnificPopup({
                    type: "ajax",
                    alignTop: !0,
                    fixedContentPos: !0,
                    closeBtnInside: !1,
                    overflowY: "scroll",
                    callbacks: {
                        open: function () {
                            e(".navbar .collapse").removeClass("show"),
                                e(".navbar a.dropdown-toggle").addClass("collapsed");
                        },
                    },
                })),
            document.querySelectorAll(".comment-textarea").forEach((e) => {
                let t = e.nextElementSibling;
                e.addEventListener("input", function () {
                    t && t.classList.contains("charCount") && (t.textContent = `${this.value.length} / 300`);
                });
            }),
            e(document).on("click", ".submit", function () {
                var t = !1,
                    a = e(this),
                    n = a.parents("form"),
                    r = /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/,
                    i = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/,
                    o = /^\d{10}$/,
                    l = /^[a-zA-Z0-9,'" .]+$/,
                    s = n.attr("action"),
                    c = n.find(".form-results"),
                    d = a.attr("data-sitekey") || "",
                    u = n.find('[name="redirect"]').val(),
                    m = n.find('[name="file-url"]').val();
                n.append('<input type="hidden" name="page_url" value="' + window.location.href + '">');
                var p = n.find('[name="name"]'),
                    h = n.find('[name="location"]'),
                    f = n.find('[name="comment"]');
                n.find(".required").removeClass("is-invalid"),
                    n.find(".required").each(function () {
                        var a = e(this),
                            n = a.val();
                        "" == n || null == n
                            ? ((t = !0), a.addClass("is-invalid"))
                            : (("email" != a.attr("type") || r.test(n)) &&
                                ("url" != a.attr("type") || i.test(n)) &&
                                ("tel" != a.attr("type") || o.test(n))) ||
                            ((t = !0), a.addClass("is-invalid"));
                    }),
                    l.test(p.val()) || ((t = !0), p.addClass("is-invalid")),
                    l.test(h.val()) || ((t = !0), h.addClass("is-invalid")),
                    l.test(f.val()) || ((t = !0), f.addClass("is-invalid"));
                var g = n.find(".terms-condition");
                return (
                    g.length && !g.is(":checked") && ((t = !0), g.addClass("is-invalid")),
                    "undefined" != typeof grecaptcha &&
                    null !== grecaptcha &&
                    (n.find(".g-recaptcha").length
                        ? grecaptcha.getResponse().length || ((t = !0), n.find(".g-recaptcha").addClass("is-invalid"))
                        : "" != d &&
                        null != d &&
                        grecaptcha.ready(function () {
                            grecaptcha.execute(d, { action: "submit" }).then(function (e) { });
                        })),
                    t ||
                    "" == s ||
                    null == s ||
                    (a.addClass("loading"),
                        a.prop("disabled", !0),
                        e.ajax({
                            type: "POST",
                            url: s,
                            data: n.serialize(),
                            success: function (t) {
                                if ((a.removeClass("loading"), a.prop("disabled", !1), "" != m && null != m)) {
                                    var r = document.createElement("a");
                                    (r.href = m),
                                        (r.download = "Funplay-Originals.pdf"),
                                        document.body.appendChild(r),
                                        r.click(),
                                        document.body.removeChild(r);
                                }
                                "" != u && null != u
                                    ? (window.location.href = u)
                                    : (null != t && (t = e.parseJSON(t)),
                                        n
                                            .find(
                                                "input[type=text],input[type=url],input[type=email],input[type=tel],input[type=password],textarea"
                                            )
                                            .each(function () {
                                                e(this).val(""), e(this).removeClass("is-invalid");
                                            }),
                                        n.find(".g-recaptcha").removeClass("is-invalid"),
                                        n.find("input[type=checkbox],input[type=radio]").prop("checked", !1),
                                        n.find(".g-recaptcha").length && grecaptcha.reset(),
                                        c.removeClass("alert-success").removeClass("alert-danger").hide(),
                                        c.addClass(t.alert).html(t.message),
                                        c.removeClass("d-none").fadeIn("slow").delay(8e3).fadeOut("slow"));
                            },
                        })),
                    !1
                );
            }),
            e(document).on("blur", ".required", function () {
                var t = e(this).val();
                "" == t ||
                    null == t ||
                    ("email" == e(this).attr("type") && !/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(t)) ||
                    ("url" == e(this).attr("type") &&
                        !/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(t)) ||
                    ("tel" == e(this).attr("type") && !/^\d{10}$/.test(t))
                    ? e(this).addClass("is-invalid")
                    : e(this).removeClass("is-invalid").addClass("is-valid");
            }),
            e(document).on("click", ".terms-condition", function () {
                var t = e(this);
                t.is(":checked") ? t.removeClass("is-invalid").addClass("is-valid") : t.addClass("is-invalid");
            }),
            e(document).ready(function () {
                e("#contactForm").submit(function () {
                    var t = e('input[name="phone"]'),
                        a = t.val();
                    if (!/^\d{10}$/.test(a)) return t.addClass("is-invalid"), !1;
                    t.removeClass("is-invalid").addClass("is-valid");
                }),
                    e('input[name="phone"]').on("blur", function () {
                        var t = e(this),
                            a = t.val();
                        /^\d{10}$/.test(a) ? t.removeClass("is-invalid").addClass("is-valid") : t.addClass("is-invalid");
                    });
            }),
            e(".rev_slider").length &&
            e(".rev_slider").each(function () {
                e(this).one("revolution.slide.onloaded", function () {
                    j();
                });
            }),
            e(window).on("load", function () {
                [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]')).map(function (e) {
                    return new bootstrap.Tooltip(e);
                }),
                    void 0 !== e.fn.parallax && (e.fn.parallax, 1) && H(),
                    e("img:not([data-at2x])").each(function () {
                        e(this).attr("data-no-retina", "");
                    }),
                    e(".page-loader").length && e(".page-loader").fadeOut(),
                    f(n),
                    z(),
                    R(),
                    setTimeout(function () {
                        B(), p();
                    }, 300);
            }),
            e(window).on("load", function () {
                e(".page-loader").show(),
                    setTimeout(function () {
                        e(".page-loader").hide();
                    }, 1e3);
            }),
            e(window).resize(function () {
                y(),
                    H(),
                    I(),
                    z(),
                    R(100),
                    w(),
                    e(".navbar-collapse-clone").length &&
                    "function" == typeof e.fn.mCustomScrollbar &&
                    e(".navbar-collapse-clone").mCustomScrollbar("update"),
                    o ||
                    setTimeout(function () {
                        f(n);
                    }, 300),
                    1199 >= e(window).width()
                        ? (ee.length &&
                            e(window).width() > 1199 &&
                            ee.forEach(function (e) {
                                e.__atropos__ && e.__atropos__.destroy();
                            }),
                            J())
                        : ("undefined" != typeof Atropos && te(), Y());
            }),
            e(window).on("orientationchange", function (t) {
                z(),
                    R(),
                    setTimeout(function () {
                        B(), p();
                    }, 300),
                    e(".navbar-collapse.collapse").collapse("hide"),
                    e("html, body").removeClass("show-menu"),
                    e("body").removeClass("show-search-popup"),
                    e("header nav").removeClass("submenu-light").removeClass("submenu-dark"),
                    e(".dropdown").trigger("mouseleave"),
                    e(".sub-menu.show").collapse("hide"),
                    e(".left-sidebar-header").collapse("hide"),
                    h(),
                    e(".left-modern-header").collapse("hide");
            }),
            e(window).on("scroll", I),
            document.addEventListener("DOMContentLoaded", () => {
                let e = document.getElementById("vision-heading"),
                    t = document.querySelectorAll(".our-vision-slider")[1],
                    a = (t) => {
                        t.on("slideChange", () => (e.textContent = 0 === t.realIndex ? "Our Vision" : "Our Values"));
                    };
                t?.swiper
                    ? a(t.swiper)
                    : setInterval(() => {
                        t?.swiper && (a(t.swiper), clearInterval(this));
                    }, 100);
            }),
            e(".magic-cursor").length > 0)
    ) {
        e('<div class="magic-cursor-wrapper"><div id="ball-cursor"><div id="ball-cursor-loader"></div></div></div>')
            .clone(!1)
            .appendTo("body"),
            e(".magic-cursor").hasClass("light") && e(".magic-cursor-wrapper").addClass("magic-cursor-light"),
            e(".magic-cursor").hasClass("base-color") && e(".magic-cursor-wrapper").addClass("magic-cursor-base-color"),
            e(".magic-cursor").hasClass("view-cursor") && e(".magic-cursor-wrapper").addClass("magic-view-cursor"),
            e(".magic-cursor").hasClass("drag-cursor") && e(".magic-cursor-wrapper").addClass("magic-drag-cursor"),
            e(".magic-cursor").hasClass("round-cursor") && e(".magic-cursor-wrapper").addClass("magic-round-cursor");
        var _ = { x: 0, y: 0 },
            G = { x: 0, y: 0 },
            F = document.getElementById("ball-cursor");
        document.getElementById("ball-cursor-loader"),
            "undefined" != typeof TweenLite &&
            TweenLite.set(F, { xPercent: -50, yPercent: -50, scale: 0, borderWidth: "0", opacity: 1 }),
            document.addEventListener("mousemove", function (e) {
                var t = window.pageYOffset || document.documentElement.scrollTop;
                (_.x = e.pageX), (_.y = e.pageY - t);
            }),
            "undefined" != typeof gsap &&
            gsap.ticker.add(function () {
                (G.x += 0.65 * (_.x - G.x)), (G.y += 0.65 * (_.y - G.y)), TweenLite.to(F, 0.4, { x: G.x, y: G.y });
            }),
            "undefined" != typeof TweenMax &&
            e(".magic-cursor").mouseenter(function (t) {
                TweenMax.to("#ball-cursor", 0.3, { borderWidth: "2px", scale: 1 }),
                    TweenMax.to("#ball-cursor-loader", 0.2, { borderWidth: "2px", top: 2, left: 2 }),
                    e(".magic-cursor-wrapper").addClass("sliderhover"),
                    e(this).hasClass("magic-cursor-vertical") && e(".magic-cursor-wrapper").addClass("vertical");
            }),
            "undefined" != typeof TweenMax &&
            e(".magic-cursor").mouseleave(function (t) {
                TweenMax.to("#ball-cursor", 0.3, {
                    borderWidth: "2px",
                    scale: 1,
                    borderColor: "transparent",
                    opacity: 1,
                }),
                    TweenMax.to("#ball-cursor-loader", 0.2, { borderWidth: "2px", top: 0, left: 0 }),
                    e(".magic-cursor-wrapper").removeClass("sliderhover");
            });
    }
    function N(e) {
        if (e.length) {
            var t = e.width(),
                a = e.height(),
                n = e.offset(),
                r = n.left + parseInt(e.width()),
                i = n.top + parseInt(e.height());
            (Math.max(0, Math.min(t, window.pageXOffset + window.innerWidth - n.left, r - window.pageXOffset)) *
                Math.max(0, Math.min(a, window.pageYOffset + window.innerHeight - n.top, i - window.pageYOffset))) /
                (t * a) >=
                0.5 &&
                (void 0 !== e.attr("data-animation-delay") && e.attr("data-animation-delay") > 10
                    ? setTimeout(function () {
                        e.addClass("shadow-in");
                    }, e.attr("data-animation-delay"))
                    : e.addClass("shadow-in"));
        }
    }
    function Y() {
        "undefined" != typeof skrollr &&
            (re = skrollr.init({
                forceHeight: !1,
                smoothScrollingDuration: 1e3,
                mobileCheck: function () {
                    return !1;
                },
            }));
    }
    function j() {
        J(),
            e(window).width() >= 1200 &&
            setTimeout(function () {
                Y();
            }, 1e3);
    }
    function J() {
        void 0 !== re && "undefined" != re && re.destroy();
    }
    e(document)
        .on(
            "mouseenter",
            ".swiper-button-next, .swiper-button-prev, .swiper-pagination, a:not(.force-magic-cursor)",
            function () {
                e(".magic-cursor-wrapper").css({ opacity: 0 });
            }
        )
        .on(
            "mouseleave",
            ".swiper-button-next, .swiper-button-prev, .swiper-pagination, a:not(.force-magic-cursor)",
            function () {
                e(".magic-cursor-wrapper").css({ opacity: 1 });
            }
        ),
        e(window).scroll(function (t) {
            e('[data-shadow-animation="true"]').each(function () {
                N(e(this));
            });
        }),
        e('[data-shadow-animation="true"]').removeClass("shadow-in"),
        e('[data-shadow-animation="true"]').each(function () {
            N(e(this));
        }),
        e(window).width() >= 1200 && Y();
    var $ = {
        particles: {
            number: { value: 80, density: { enable: !1, value_area: 800 } },
            color: { value: ["#fdc14c", "#fd5c4c", "#48bb0f"] },
            shape: { type: "circle" },
            size: { value: 10, random: !0, anim: { enable: !0, speed: 1 } },
            opacity: { value: 0.5, random: !1 },
            move: { direction: "right", attract: { enable: !0 } },
            line_linked: { enable: !1 },
        },
        interactivity: { events: { onhover: { enable: !1 }, onclick: { enable: !1 } } },
        retina_detect: !0,
    },
        X = e('[data-particle="true"]');
    "function" == typeof particlesJS &&
        X.length &&
        e.each(X, function (t, a) {
            var n = e(a).attr("id"),
                r = e(a).attr("data-particle-options");
            (r = "undefined" != r && void 0 !== r ? JSON.parse(r) : $), particlesJS(n, r);
        }),
        e(".animatedSvgPath").each(function () {
            var t = e(this),
                a = t.attr("pathdata:id").split(";");
            a.splice(a.length, 0, t.attr("d")),
                anime({ targets: t[0], duration: 1e4, easing: "cubicBezier(0.5, 0, 0.5, 1)", d: a, loop: !0 });
        });
    var U = !1;
    function V() {
        setTimeout(function () {
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                ? e(".cursor-page-inner").hide()
                : e(".cursor-page-inner").show();
        }, 250);
    }
    function Q() {
        if (e("body").hasClass("custom-cursor")) {
            U = !0;
            let t,
                a,
                n = document.querySelector(".circle-cursor-inner"),
                r = document.querySelector(".circle-cursor-outer"),
                i = !1,
                o = !1;
            (window.onmousemove = function (e) {
                i || (r.style.transform = "translate(" + e.clientX + "px, " + e.clientY + "px)"),
                    (n.style.opacity = "0"),
                    (n.style.opacity = "1"),
                    (n.style.transform = "translate(" + e.clientX + "px, " + e.clientY + "px)"),
                    (t = e.clientY),
                    (a = e.clientX);
            }),
                e("body").on("mouseenter", "a", function () {
                    n.classList.add("cursor-link-hover"), r.classList.add("cursor-link-hover"), (o = !0);
                }),
                e("body").on("mouseenter", ".magic-cursor", function () {
                    (n.style.visibility = "hidden"), (r.style.visibility = "hidden");
                }),
                e("body").on("mouseleave", ".magic-cursor", function () {
                    (n.style.visibility = "visible"), (r.style.visibility = "visible");
                }),
                e("body").on("mouseleave", "a", function () {
                    (!e(this).is("a") || !e(this).closest(".cursor-as-pointer").length) &&
                        (n.classList.remove("cursor-link-hover"), r.classList.remove("cursor-link-hover"), (o = !1));
                }),
                e("body").on("mouseenter", ".rounded-box", function () {
                    let t = e(this),
                        a = window.pageYOffset || document.documentElement.scrollTop;
                    o && (n.classList.remove("cursor-link-hover"), r.classList.remove("cursor-link-hover")),
                        (r.style.transition = "all .2s ease-out"),
                        (r.style.transform = "translate(" + t.offset().left + "px, " + (t.offset().top - a) + "px)"),
                        (r.style.width = t.width() + "px"),
                        (r.style.height = t.height() + "px"),
                        (r.style.marginLeft = 0),
                        (r.style.marginTop = 0),
                        (i = !0);
                }),
                e("body").on("mouseleave", ".rounded-box", function () {
                    o && (n.classList.add("cursor-link-hover"), r.classList.add("cursor-link-hover")),
                        (r.style.transition = null),
                        (r.style.width = null),
                        (r.style.height = null),
                        (r.style.marginLeft = null),
                        (r.style.marginTop = null),
                        (i = !1);
                }),
                (n.style.visibility = "visible"),
                (r.style.visibility = "visible");
        }
    }
    Q(),
        V(),
        e(window).resize(function () {
            U || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || Q(), V();
        }),
        K();
    var Z = 0;
    function K() {
        (i = window.pageYOffset || document.documentElement.scrollTop),
            e(".stack-box").each(function () {
                if (e(window).width() > 1199) {
                    var t = e(this),
                        a = t.find(".stack-item");
                    if (a.length) {
                        i > Z
                            ? (t.addClass("forward"), t.removeClass("reverse"))
                            : (t.removeClass("forward"), t.addClass("reverse"));
                        for (let l = 0; l < a.length - 1; l++) {
                            var n = (t.height() / t.find(".stack-item").length) * l,
                                r = t.offset().top;
                            if (i - r > n) {
                                var o = i - r - n;
                                o > t.outerHeight() && (o = t.outerHeight()),
                                    e(a[l]).css({ height: "calc(100vh - " + o + "px)" }),
                                    e(a[l]).addClass("active");
                            } else e(a[l]).css({ height: "calc(100vh - 0px)" }), e(a[l]).removeClass("active");
                        }
                    }
                } else e(".stack-box .stack-item").css({ height: "inherit" });
            }),
            (Z = i);
    }
    e(window).scroll(function () {
        K();
    });
    var ee = document.querySelectorAll("[data-atropos]");
    function te() {
        ee.length &&
            e(window).width() > 1199 &&
            ee.forEach(function (e) {
                Atropos({ el: e });
            });
    }
    "undefined" != typeof Atropos && null !== Atropos && te();
    var ae,
        ne,
        re,
        ie,
        oe,
        le,
        se =
            ((le = (oe = document.documentElement).clientHeight),
                function (e, t) {
                    var a,
                        n = [];
                    for (e && "resize" == e.type && (le = oe.clientHeight), a = t.elements.length; a--;) {
                        var r = t.elements[a],
                            i = r.getBoundingClientRect(),
                            o = ((i.top / le) * 100 + (i.bottom / le) * 100) / 2,
                            l = o > t.zone[1] && o < 100 - t.zone[1];
                        r.classList.toggle(t.markedClass, l), l && n.push(r);
                    }
                });
    e(window).on("scroll resize load", function (t) {
        se(t, {
            elements: document.querySelectorAll(".section-dark"),
            markedClass: "section-dark-highlight",
            zone: [10, 10],
        }),
            e(".section-dark-highlight").length > 0
                ? e(".sticky-wrap").addClass("sticky-highlight")
                : e(".sticky-wrap").removeClass("sticky-highlight");
    }),
        e(document)
            .on("appear", "footer", function (t) {
                e(".sticky-wrap").addClass("sticky-hidden");
            })
            .on("disappear", "footer", function (t) {
                e(".sticky-wrap").removeClass("sticky-hidden");
            }),
        e(".qty-plus").click(function () {
            var t = e(this).closest(".quantity").find(".qty-text");
            t.val(+t.val() + 1);
        }),
        e(".qty-minus").click(function () {
            var t = e(this).closest(".quantity").find(".qty-text");
            t.val() > 1 && t.val(+t.val() - 1);
        });
    let ce,
        de = document.querySelector(".looping-wrapper") || !1,
        ue = anime.timeline({
            duration: 60,
            complete: function () {
                ue.restart();
            },
        });
    function me(e) {
        let t = document.createElement("div"),
            a = 3.6 * e;
        t.classList.add("el"),
            (t.style.transform = "rotate(" + a + "deg) translateY(-50%)"),
            ue.add({
                begin: function () {
                    anime({
                        targets: t,
                        rotate: [a + "deg", a + 10 + "deg"],
                        translateY: ["-50%", "-40%"],
                        scale: [1, 1.25],
                        easing: "easeInOutSine",
                        direction: "alternate",
                        duration: 600,
                    });
                },
            }),
            de && de.appendChild(t);
    }
    for (let Ce = 0; Ce < 100; Ce++) me(Ce);
    function pe() {
        if (window.sections.length > 0) {
            let e = window.sections
                .map((e) => {
                    let t = e,
                        a = t.getBoundingClientRect();
                    return { el: t, rect: a };
                })
                .find((e) => e.rect.bottom >= 0.5 * window.innerHeight);
            if (e && e.el !== ce) {
                ce = e.el;
                let t = ce.getAttribute("data-background");
                ce
                    .closest(".page-content")
                    .querySelectorAll("[data-background]")
                    .forEach((e) => e.classList.remove("active")),
                    ce.classList.add("active"),
                    "undefined" != typeof gsap && gsap.to(ce.closest(".page-content"), { backgroundColor: t });
            }
        }
    }
    (window.sections = [...document.querySelectorAll("[data-background]")]),
        (window.lastScrollTop = window.pageYOffset),
        pe(),
        window.addEventListener("scroll", pe),
        "function" == typeof e.cookie &&
        e("body").find("#cookies-model").length > 0 &&
        setTimeout(function () {
            var t = e("#cookies-model");
            "closed" == e.cookie("cookieConsent") ? t.remove() : t.show(),
                t.find("[data-accept-btn]").on("click", function (a) {
                    a.preventDefault(), t.remove(), e.cookie("cookieConsent", "closed", { expires: 1, path: "/" });
                });
        }, 1e3),
        e(document).on("click", ".scroll-top", function () {
            return e("html, body").animate({ scrollTop: 0 }, 800), !1;
        }),
        e(window).scroll(function () {
            var t, a, n;
            document.documentElement.scrollTop > 200
                ? e(".scroll-progress").addClass("visible")
                : e(".scroll-progress").removeClass("visible"),
                (t = document.documentElement.scrollHeight),
                (a = document.documentElement.clientHeight),
                (n = (document.documentElement.scrollTop / (t - a - 200)) * 100),
                e(".scroll-point").css("height", Math.min(n, 100) + "%"),
                e(window).scrollTop() > 150 && e(".theme-demos").fadeIn(600);
        }),
        e(".bg-more-trusted .btn").click(function (t) {
            t.preventDefault(), e(this).parent().parent().addClass("show-trusted-customers");
        }),
        e(document).on("click", ".all-demo", function () {
            var t = e(this).parents(".theme-demos");
            t.hasClass("active")
                ? (t.removeClass("active"), e("body").removeClass("overflow-hidden"))
                : (t.append(themeDemoData), t.addClass("active"), e("body").addClass("overflow-hidden"));
        }),
        e(document).on("click", ".close-popup", function () {
            e(this).parents(".theme-demos").removeClass("active"),
                e("body").removeClass("overflow-hidden"),
                clearTimeout(ie),
                (ie = setTimeout(function () {
                    e(".theme-demos-main").animate({ scrollTop: "0" }, "slow");
                }, 800));
        }),
        e(document).on("keydown", function (t) {
            "Escape" == t.key &&
                (e(".theme-demos").removeClass("active"),
                    e("body").removeClass("overflow-hidden"),
                    clearTimeout(ie),
                    (ie = setTimeout(function () {
                        e(".theme-demos-main").animate({ scrollTop: "0" }, "slow");
                    }, 800)));
        }),
        e(".all-demo a").click(function (e) {
            e.preventDefault();
        });
})(jQuery);
const products = [
    { name: "Ulta Ghar", url: "/funplay-originals/nature-sparsh/ulta-ghar.html" },
    { name: "Aviral", url: "/funplay-originals/nature-sparsh/aviral.html" },
    { name: "Phula", url: "/funplay-originals/nature-sparsh/phula.html" },
    { name: "Archies", url: "/funplay-originals/nature-sparsh/archies.html" },
    { name: "Barrel Barrel", url: "/funplay-originals/nature-sparsh/barrel-barrel.html" },
    { name: "Card Pyramid", url: "/funplay-originals/nature-sparsh/card-pyramid.html" },
    { name: "Card Cook", url: "/funplay-originals/nature-sparsh/card-cook.html" },
    { name: "Fun", url: "/funplay-originals/nature-sparsh/fun.html" },
    { name: "Inframe", url: "/funplay-originals/nature-sparsh/inframe.html" },
    { name: "Paper Boat", url: "/funplay-originals/kagzi/paper-boat.html" },
    { name: "Paper Bird", url: "/funplay-originals/kagzi/paper-bird.html" },
    { name: "Paper Plane", url: "/funplay-originals/kagzi/paper-plane.html" },
    { name: "Paper Fish", url: "/funplay-originals/kagzi/paper-fish.html" },
    { name: "Paper Mouse", url: "/funplay-originals/kagzi/paper-mouse.html" },
    { name: "Paper Frog", url: "/funplay-originals/kagzi/paper-frog.html" },
    { name: "Ghogalo", url: "/funplay-originals/organic-play/ghogalo.html" },
    { name: "Toucan", url: "/funplay-originals/organic-play/toucan.html" },
    { name: "Pachkili", url: "/funplay-originals/organic-play/pachkili.html" },
    { name: "Hittu", url: "/funplay-originals/organic-play/hittu.html" },
    { name: "Shinga", url: "/funplay-originals/organic-play/shinga.html" },
    { name: "Monstera", url: "/funplay-originals/organic-play/monstera.html" },
    { name: "Unt Savari", url: "/funplay-originals/organic-play/unt-savari.html" },
    { name: "Kukura", url: "/funplay-originals/organic-play/kukura.html" },
    { name: "Cipu Sittu", url: "/funplay-originals/organic-play/cipu-sittu.html" },
    { name: "Bellatrix", url: "/funplay-originals/khel-khud/bellatrix.html" },
    { name: "Itsy Bitsy", url: "/funplay-originals/khel-khud/itsy-bitsy.html" },
    { name: "Shapestatic", url: "/funplay-originals/khel-khud/shapestatic.html" },
    { name: "Roo Pocket", url: "/funplay-originals/khel-khud/roo-pocket.html" },
    { name: "Into the Cheeze", url: "/funplay-originals/khel-khud/into-the-cheeze.html" },
    { name: "Candilicious Play", url: "/funplay-originals/khel-khud/candilicious-play.html" },
    { name: "Toddlers Twist", url: "/funplay-originals/khel-khud/toddlers-twist.html" },
    { name: "Goblin Gully", url: "/funplay-originals/khel-khud/goblin-gully.html" },
    { name: "Sky Hop", url: "/funplay-originals/khel-khud/sky-hop.html" },
    { name: "Patang", url: "/funplay-originals/timeless-play/patang.html" },
    { name: "Chausar", url: "/funplay-originals/timeless-play/chausar.html" },
    { name: "Paheli", url: "/funplay-originals/timeless-play/paheli.html" },
    { name: "Fugadi", url: "/funplay-originals/timeless-play/fugadi.html" },
    { name: "Udanchu", url: "/funplay-originals/wall-play/udanchu.html" },
    { name: "Ghar Ghar", url: "/funplay-originals/wall-play/ghar-ghar.html" },
    { name: "Dahi Handi", url: "/funplay-originals/wall-play/dahi-handi.html" },
    { name: "Geoboard", url: "/funplay-originals/wall-play/geoboard.html" },
    { name: "Lady Musance", url: "/funplay-originals/conceptual/lady-musance.html" },
    { name: "Ground Hogs", url: "/funplay-originals/conceptual/ground-hogs.html" },
    { name: "City Strange", url: "/funplay-originals/conceptual/city-strange.html" },
    { name: "Chidiyaan", url: "/funplay-originals/conceptual/chidiyaan.html" },
    { name: "Witch's Enchantment", url: "/funplay-originals/conceptual/witchs-enchantment.html" },
    { name: "Limlet", url: "/funplay-originals/conceptual/limlet.html" },
    { name: "Junk Park", url: "/funplay-originals/conceptual/junk-park.html" },
    { name: "Flamingo Park", url: "/funplay-originals/conceptual/flamingo-park.html" },
    { name: "Solo Fight-5", url: "/corecraft/robo-romp/solo-fight-5.html" },
    { name: "Solo Fight-7", url: "/corecraft/robo-romp/solo-fight-7.html" },
    { name: "Dual Bot", url: "/corecraft/robo-romp/dual-bot.html" },
    { name: "Triple Threat", url: "/corecraft/robo-romp/triple-threat.html" },
    { name: "Robo Kingdom", url: "/corecraft/robo-romp/robo-kingdom.html" },
    { name: "Jungle Jive-l1", url: "/corecraft/forestia/jungle-jive-l1.html" },
    { name: "Jungle Jive-l2", url: "/corecraft/forestia/jungle-jive-l2.html" },
    { name: "Gloracia", url: "/corecraft/forestia/gloracia.html" },
    { name: "Blossam Brook", url: "/corecraft/forestia/blossam-brook.html" },
    { name: "King Kong Play Park", url: "/corecraft/forestia/king-kong-play-park.html" },
    { name: "Jambore-5", url: "/corecraft/clown-capade/jambore-5.html" },
    { name: "Jambore-3", url: "/corecraft/clown-capade/jambore-3.html" },
    { name: "Tumble Twin", url: "/corecraft/clown-capade/tumble-twin.html" },
    { name: "Chuckle Chums", url: "/corecraft/clown-capade/chuckle-chums.html" },
    { name: "Jumbo Jive", url: "/corecraft/clown-capade/jumbo-jive.html" },
    { name: "Crown Court-3", url: "/corecraft/castle-crest/crown-court-3.html" },
    { name: "Crown Court-7", url: "/corecraft/castle-crest/crown-court-7.html" },
    { name: "Fortress Fun", url: "/corecraft/castle-crest/fortress-fun.html" },
    { name: "Noble Nook", url: "/corecraft/castle-crest/noble-nook.html" },
    { name: "Royal Rise", url: "/corecraft/castle-crest/royal-rise.html" },
    { name: "Giants Galore", url: "/corecraft/play-lands/giants-galore.html" },
    { name: "Joy Ridge", url: "/corecraft/play-lands/joy-ridge.html" },
    { name: "Fun Field", url: "/corecraft/play-lands/fun-field.html" },
    { name: "Gloden Hour", url: "/corecraft/play-lands/gloden-hour.html" },
    { name: "Play Pulse", url: "/corecraft/play-lands/play-pulse.html" },
    { name: "Thrill Trail", url: "/corecraft/play-lands/thrill-trail.html" },
    { name: "Azure Space", url: "/corecraft/play-lands/azure-space.html" },
    { name: "Coral Cascade", url: "/corecraft/play-lands/coral-cascade.html" },
    { name: "Tiny Tot", url: "/corecraft/play-lands/tiny-tot.html" },
    { name: "We Wonderland", url: "/corecraft/play-lands/we-wonderland.html" },
    { name: "Shrimpm Slide", url: "/corecraft/individual-equipment/slide-3foot-height/shrimp-slide.html" },
    {
        name: "Double Wave Slide - 3ft",
        url: "/corecraft/individual-equipment/slide-3foot-height/double-wave-slide.html",
    },
    { name: "Curve Slide", url: "/corecraft/individual-equipment/slide-3foot-height/curve-slide.html" },
    { name: "Straight Open Slide", url: "/corecraft/individual-equipment/slide-3foot-height/straight-open-slide.html" },
    { name: "Wave Slide", url: "/corecraft/individual-equipment/slide-5foot-height/wave-slide.html" },
    { name: "S Slide", url: "/corecraft/individual-equipment/slide-5foot-height/s-slide.html" },
    {
        name: "Straight Tunnel Slide",
        url: "/corecraft/individual-equipment/slide-5foot-height/straight-tunnel-slide.html",
    },
    { name: "Spiral Tunnel Slide", url: "/corecraft/individual-equipment/slide-5foot-height/spiral-tunnel-slide.html" },
    { name: "Spiral Slide", url: "/corecraft/individual-equipment/slide-5foot-height/spiral-slide.html" },
    { name: "Zig Zag Slide", url: "/corecraft/individual-equipment/slide-5foot-height/zig-zag-slide.html" },
    {
        name: "Double Wave Slide - 5ft",
        url: "/corecraft/individual-equipment/slide-5foot-height/double-wave-slide.html",
    },
    { name: "Straight Open Slide", url: "/corecraft/individual-equipment/slide-7foot-height/straight-open-slide.html" },
    { name: "Curve Slide", url: "/corecraft/individual-equipment/slide-7foot-height/curve-slide.html" },
    { name: "Spiral Slide", url: "/corecraft/individual-equipment/slide-7foot-height/spiral-slide.html" },
    { name: "Roto Platform MGR", url: "/corecraft/individual-equipment/merry-go-round/roto-platform-mgr.html" },
    { name: "Roto Wheel Go Round", url: "/corecraft/individual-equipment/merry-go-round/roto-wheel-go-round.html" },
    { name: "Roto Seating MGR", url: "/corecraft/individual-equipment/merry-go-round/roto-seating-mgr.html" },
    { name: "4 Seater MGR", url: "/corecraft/individual-equipment/merry-go-round/four-seater-mgr.html" },
    { name: "Laminate Standing MGR", url: "/corecraft/individual-equipment/merry-go-round/laminate-standing-mgr.html" },
    { name: "Jumbo 4 Seater MGR", url: "/corecraft/individual-equipment/merry-go-round/jumbo-four-seater-mgr.html" },
    { name: "Horse MGR", url: "/corecraft/individual-equipment/merry-go-round/horse-mgr.html" },
    { name: "Animal MGR", url: "/corecraft/individual-equipment/merry-go-round/animal-mgr.html" },
    { name: "Bucket Spinner MGR", url: "/corecraft/individual-equipment/merry-go-round/bucket-spinner-mgr.html" },
    { name: "Cage Spinner", url: "/corecraft/individual-equipment/merry-go-round/cage-spinner.html" },
    { name: "Flower Spinner", url: "/corecraft/individual-equipment/merry-go-round/flower-spinner.html" },
    { name: "Double Arc Swing", url: "/corecraft/individual-equipment/swing/double-arc-swing.html" },
    { name: "Curve Post Swing", url: "/corecraft/individual-equipment/swing/curve-post-swing.html" },
    { name: "Double Post Swing", url: "/corecraft/individual-equipment/swing/double-post-swing.html" },
    { name: "In-Curve Post Swing", url: "/corecraft/individual-equipment/swing/in-curve-post-swing.html" },
    { name: "Toddler Swing", url: "/corecraft/individual-equipment/swing/toddler-swing.html" },
    { name: "Mother Child Swing", url: "/corecraft/individual-equipment/swing/mother-child-swing.html" },
    { name: "Giraffe Swing", url: "/corecraft/individual-equipment/swing/giraffe-swing.html" },
    { name: "Double Swing", url: "/corecraft/individual-equipment/swing/double-swing.html" },
    { name: "Aeroplane Rider", url: "/corecraft/individual-equipment/spring-rider/aeroplane-rider.html" },
    { name: "Dumbo Rider", url: "/corecraft/individual-equipment/spring-rider/dumbo-rider.html" },
    { name: "See Horse Rider", url: "/corecraft/individual-equipment/spring-rider/see-horse-rider.html" },
    { name: "Dino Rider", url: "/corecraft/individual-equipment/spring-rider/dino-rider.html" },
    { name: "Alligator Rider", url: "/corecraft/individual-equipment/spring-rider/alligator-rider.html" },
    { name: "Duck Rider", url: "/corecraft/individual-equipment/spring-rider/duck-rider.html" },
    { name: "Horse Rider", url: "/corecraft/individual-equipment/spring-rider/horse-rider.html" },
    { name: "Bike Rider", url: "/corecraft/individual-equipment/spring-rider/bike-rider.html" },
    { name: "Deluxe Junior See Saw", url: "/corecraft/individual-equipment/see-saw/deluxe-junior-see-saw.html" },
    { name: "Deluxe Multi See Saw", url: "/corecraft/individual-equipment/see-saw/deluxe-multi-see-saw.html" },
    { name: "Double See Saw", url: "/corecraft/individual-equipment/see-saw/double-see-saw.html" },
    { name: "Rainbow See Saw", url: "/corecraft/individual-equipment/see-saw/rainbow-see-saw.html" },
    { name: "Horse See Saw", url: "/corecraft/individual-equipment/see-saw/horse-see-saw.html" },
    { name: "Standing See Saw", url: "/corecraft/individual-equipment/see-saw/standing-see-saw.html" },
    { name: "Abstract Climber", url: "/corecraft/individual-equipment/climber/abstract-climber.html" },
    { name: "Net Rock Climber", url: "/corecraft/individual-equipment/climber/net-rock-climber.html" },
    { name: "Igloo Climber", url: "/corecraft/individual-equipment/climber/igloo-climber.html" },
    { name: "Orbit Climber", url: "/corecraft/individual-equipment/climber/orbit-climber.html" },
    { name: "Droopy Climber", url: "/corecraft/individual-equipment/climber/droopy-climber.html" },
    { name: "Crest Climber", url: "/corecraft/individual-equipment/climber/crest-climber.html" },
    { name: "Mushroom Climber", url: "/corecraft/individual-equipment/climber/mushroom-climber.html" },
    { name: "Monkey Climber", url: "/corecraft/individual-equipment/climber/monkey-climber.html" },
    { name: "Wheel Thrill Climber", url: "/corecraft/individual-equipment/climber/wheel-thrill-climber.html" },
    { name: "S Bridge Climber", url: "/corecraft/individual-equipment/climber/s-bridge-climber.html" },
    { name: "Straight Net", url: "/corecraft/individual-equipment/climber/straight-net.html" },
    { name: "Wall Rock Climber", url: "/corecraft/individual-equipment/climber/wall-rock-climber.html" },
    { name: "Trampoline", url: "/corecraft/individual-equipment/climber/trampoline.html" },
    { name: "Crawling Tunnel", url: "/corecraft/individual-equipment/climber/crawling-tunnel.html" },
    { name: "Balancing Bridge", url: "/corecraft/individual-equipment/climber/balancing-bridge.html" },
    { name: "Balancing Beam", url: "/corecraft/individual-equipment/climber/balancing-beam.html" },
    { name: "Disc Challenger", url: "/corecraft/individual-equipment/climber/disc-challenger.html" },
    { name: "Hopping Pod", url: "/corecraft/individual-equipment/climber/hopping-pod.html" },
    { name: "Jumping Jacks", url: "/corecraft/individual-equipment/climber/jumping-jacks.html" },
    { name: "Loop Climber", url: "/corecraft/individual-equipment/climber/loop-climber.html" },
    { name: "Tornado Climber", url: "/corecraft/individual-equipment/climber/tornado-climber.html" },
    { name: "Leo Climber", url: "/corecraft/individual-equipment/climber/leo-climber.html" },
    { name: "Fun Walker Single", url: "/corecraft/fun-fitness-equipment/fun-walker-single.html" },
    { name: "Fun Walker Double", url: "/corecraft/fun-fitness-equipment/fun-walker-double.html" },
    { name: "Step Trainer", url: "/corecraft/fun-fitness-equipment/step-trainer.html" },
    { name: "Ski Trainer", url: "/corecraft/fun-fitness-equipment/ski-trainer.html" },
    { name: "Chest Press", url: "/corecraft/fun-fitness-equipment/chest-press.html" },
    { name: "Chest Press Double", url: "/corecraft/fun-fitness-equipment/chest-press-double.html" },
    { name: "Shoulder Press", url: "/corecraft/fun-fitness-equipment/shoulder-press.html" },
    { name: "Shoulder Press Double", url: "/corecraft/fun-fitness-equipment/shoulder-press-double.html" },
    {
        name: "Chest Press Cum Shoulder Press",
        url: "/corecraft/fun-fitness-equipment/chest-press-cum-shoulder-press.html",
    },
    { name: "Pull Up Station", url: "/corecraft/fun-fitness-equipment/pull-up-station.html" },
    { name: "Leg Press", url: "/corecraft/fun-fitness-equipment/leg-press.html" },
    { name: "Leg Press Double", url: "/corecraft/fun-fitness-equipment/leg-press-double.html" },
    { name: "Leg Press Cum Parallel Bar", url: "/corecraft/fun-fitness-equipment/leg-press-cum-parallel-bar.html" },
    { name: "Leg Press Cum Pendulum", url: "/corecraft/fun-fitness-equipment/leg-press-cum-pendulum.html" },
    {
        name: "Leg Press Cum Standing Twister",
        url: "/corecraft/fun-fitness-equipment/leg-press-cum-standing-twister.html",
    },
    {
        name: "Leg Press Cum Fun Walker Cum Seating Twister",
        url: "/corecraft/fun-fitness-equipment/leg-press-cum-fun-walker-cum-seating-twister.html",
    },
    { name: "Leg Extension", url: "/corecraft/fun-fitness-equipment/leg-extension.html" },
    { name: "Leg Lift Post", url: "/corecraft/fun-fitness-equipment/leg-lift-post.html" },
    { name: "Tai Chi", url: "/corecraft/fun-fitness-equipment/tai-chi.html" },
    { name: "Tai Chi Double", url: "/corecraft/fun-fitness-equipment/tai-chi-double.html" },
    { name: "Tai Chi Cum Standing Twister", url: "/corecraft/fun-fitness-equipment/tai-chi-cum-standing-twister.html" },
    { name: "Standing Twister Single", url: "/corecraft/fun-fitness-equipment/standing-twister-single.html" },
    { name: "Seating Twister Single", url: "/corecraft/fun-fitness-equipment/seating-twister-single.html" },
    { name: "Twister Three Way", url: "/corecraft/fun-fitness-equipment/twister-three-way.html" },
    { name: "Seating Twister Three Way", url: "/corecraft/fun-fitness-equipment/seating-twister-three-way.html" },
    {
        name: "2 Seating Cum 1 Standing Twister",
        url: "/corecraft/fun-fitness-equipment/2-seating-cum-1-standing-twister.html",
    },
    {
        name: "1 Seating Cum 2 Standing Twister",
        url: "/corecraft/fun-fitness-equipment/1-seating-cum-2-standing-twister.html",
    },
    { name: "Seating Twister Cum Tai Chi", url: "/corecraft/fun-fitness-equipment/seating-twister-cum-tai-chi.html" },
    { name: "Pendulum", url: "/corecraft/fun-fitness-equipment/pendulum.html" },
    { name: "Pendulum Double", url: "/corecraft/fun-fitness-equipment/pendulum-double.html" },
    { name: "Fun Rower", url: "/corecraft/fun-fitness-equipment/fun-rower.html" },
    { name: "Fun Rider", url: "/corecraft/fun-fitness-equipment/fun-rider.html" },
    { name: "Fun Cycle", url: "/corecraft/fun-fitness-equipment/fun-cycle.html" },
    { name: "Abb Trainer", url: "/corecraft/fun-fitness-equipment/abb-trainer.html" },
    { name: "Parallel Bar", url: "/corecraft/fun-fitness-equipment/parallel-bar.html" },
    { name: "Shoulder Twirl", url: "/corecraft/fun-fitness-equipment/shoulder-twirl.html" },
    { name: "Shoulder Twirl Double", url: "/corecraft/fun-fitness-equipment/shoulder-twirl-double.html" },
    { name: "Parallel Bar Double", url: "/corecraft/fun-fitness-equipment/parallel-bar-double.html" },
    { name: "8 Station Multi Gym", url: "/corecraft/fun-fitness-equipment/8-station-multi-gym.html" },
    { name: "6 Station Multi Gym", url: "/corecraft/fun-fitness-equipment/6-station-multi-gym.html" },
    { name: "Cross Fit", url: "/corecraft/fun-fitness-equipment/cross-fit.html" },
    { name: "Comfy Gazebo", url: "/corecraft/garden-decor/comfy-gazebo.html" },
    { name: "Repose Gazebo", url: "/corecraft/garden-decor/repose-gazebo.html" },
    { name: "DNA Pergola", url: "/corecraft/garden-decor/dna-pergola.html" },
    { name: "Pyramid Pergola", url: "/corecraft/garden-decor/pyramid-pergola.html" },
    { name: "Stand Out Bench", url: "/corecraft/garden-decor/stand-out-bench.html" },
    { name: "Relaxed Bench", url: "/corecraft/garden-decor/relaxed-bench.html" },
    { name: "Bastion Bench", url: "/corecraft/garden-decor/bastion-bench.html" },
    { name: "Curve Bench", url: "/corecraft/garden-decor/curve-bench.html" },
    { name: "Eco Bench", url: "/corecraft/garden-decor/eco-bench.html" },
    { name: "Maestro Bench", url: "/corecraft/garden-decor/maestro-bench.html" },
    { name: "Luxury Swing", url: "/corecraft/garden-decor/luxury-swing.html" },
    { name: "Deluxe Swing", url: "/corecraft/garden-decor/deluxe-swing.html" },
    { name: "Crevice Cube", url: "/corecraft/garden-decor/crevice-cube.html" },
    { name: "Grin Barrel Bin", url: "/corecraft/garden-decor/grin-barrel-bin.html" },
    { name: "Atypical Bin", url: "/corecraft/garden-decor/atypical-bin.html" },
    { name: "Apex", url: "/nexlev-series/pinnacle/apex.html" },
    { name: "Bouldering", url: "/nexlev-series/pinnacle/bouldering.html" },
    { name: "Capstone", url: "/nexlev-series/pinnacle/capstone.html" },
    { name: "Crestro", url: "/nexlev-series/pinnacle/crestro.html" },
    { name: "Glory", url: "/nexlev-series/pinnacle/glory.html" },
    { name: "Groovy", url: "/nexlev-series/pinnacle/groovy.html" },
    { name: "Peak", url: "/nexlev-series/pinnacle/peak.html" },
    { name: "Prime", url: "/nexlev-series/pinnacle/prime.html" },
    { name: "Sway", url: "/nexlev-series/pinnacle/sway.html" },
    { name: "Vertex", url: "/nexlev-series/pinnacle/vertex.html" },
    { name: "Baobab", url: "/nexlev-series/woody/baobab.html" },
    { name: "Beaber", url: "/nexlev-series/woody/beaber.html" },
    { name: "Colga", url: "/nexlev-series/woody/colga.html" },
    { name: "Conifer", url: "/nexlev-series/woody/conifer.html" },
    { name: "El Dorado", url: "/nexlev-series/woody/el-dorado.html" },
    { name: "Montana", url: "/nexlev-series/woody/montana.html" },
    { name: "Skuhoom", url: "/nexlev-series/woody/skuhoom.html" },
    { name: "Sundarban", url: "/nexlev-series/woody/sundarban.html" },
    { name: "Teton", url: "/nexlev-series/woody/teton.html" },
    { name: "Toss", url: "/nexlev-series/woody/toss.html" },
    { name: "Woody Go Round", url: "/nexlev-series/woody/woody-go-round.html" },
    { name: "Wiggle", url: "/nexlev-series/woody/wiggle.html" },
    { name: "Arthur", url: "/nexlev-series/castle/arthur.html" },
    { name: "Gonthina", url: "/nexlev-series/castle/gonthina.html" },
    { name: "Palamu", url: "/nexlev-series/castle/palamu.html" },
    { name: "Sunspear", url: "/nexlev-series/castle/sunspear.html" },
    { name: "Aviator", url: "/nexlev-series/escapade/aviator.html" },
    { name: "Combat", url: "/nexlev-series/escapade/combat.html" },
    { name: "Crossette", url: "/nexlev-series/escapade/crossette.html" },
    { name: "Frolic", url: "/nexlev-series/escapade/frolic.html" },
    { name: "Frisk", url: "/nexlev-series/escapade/frisk.html" },
    { name: "Tidal", url: "/nexlev-series/escapade/tidal.html" },
    { name: "Thunder Bolt", url: "/nexlev-series/escapade/thunder-bolt.html" },
    { name: "Tri Trap", url: "/nexlev-series/escapade/tri-trap.html" },
    { name: "Dravmo", url: "/nexlev-series/abstract/dravmo.html" },
    { name: "Ernoto", url: "/nexlev-series/abstract/ernoto.html" },
    { name: "Eromofy", url: "/nexlev-series/abstract/eromofy.html" },
    { name: "Rengvo", url: "/nexlev-series/abstract/rengvo.html" },
    { name: "Chalet", url: "/nexlev-series/solitaire/chalet.html" },
    { name: "Jager", url: "/nexlev-series/solitaire/jager.html" },
];
document.getElementById("search-form-input").addEventListener("input", function () {
    let e = this.value.toLowerCase(),
        t = document.getElementById("suggestions");
    if (((t.innerHTML = ""), e.length > 0)) {
        let a = products.filter((t) => t.name.toLowerCase().includes(e));
        if (a.length > 0)
            a.forEach((e) => {
                let a = document.createElement("div");
                a.classList.add("suggestion-item"),
                    (a.textContent = e.name),
                    a.addEventListener("click", () => {
                        window.location.href = e.url;
                    }),
                    t.appendChild(a);
            });
        else {
            let e = document.createElement("div");
            e.classList.add("suggestion-item"), (e.textContent = "No product found"), t.appendChild(e);
        }
    }
}),
    document.addEventListener("DOMContentLoaded", function () {
        const e = document.getElementById("latestPostsContainer");
        e &&
            fetch("./latest-blogs.json")
                .then((e) => {
                    if (!e.ok) throw new Error(`HTTP error ${e.status}`);
                    return e.json();
                })
                .then((t) => {
                    (e.innerHTML = '<p class="post-title alt-font">Latest Posts</p>'),
                        t.slice(0, 3).forEach((t, a, n) => {
                            e.innerHTML += `\n                    <a href="${t.link}">\n                        <div class="post-item">\n                            <div class="post-image">\n                                <img src="${t.image}" alt="${t.title}">\n                            </div>\n                            <div class="post-details alt-font">\n                                <p class="post-heading">${t.title}</p>\n                                <p class="post-date">${t.date}</p>\n                            </div>\n                        </div>\n                    </a>\n                    ${a < n.length - 1 ? '<div class="separator"></div>' : ""}\n                `;
                        });
                })
                .catch((t) => {
                    console.error("Error loading blog posts:", t),
                        (e.innerHTML =
                            '\n                <p class="post-title alt-font">Latest Posts</p>\n                <p class="alt-font">Unable to load latest posts. Please try again later.</p>\n            ');
                });
    });
