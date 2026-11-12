(function () {
  "use strict";

  /* ---------- 顶部导航：滚动变色 ---------- */
  var header = document.getElementById("siteHeader");

  function updateHeader() {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* ---------- 移动端菜单 ---------- */
  var nav = document.getElementById("primaryNav");
  var navToggle = document.getElementById("navToggle");

  function setNav(open) {
    nav.classList.toggle("is-open", open);
    navToggle.classList.toggle("is-active", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "关闭导航菜单" : "打开导航菜单");
    document.body.classList.toggle("nav-open", open);
  }

  navToggle.addEventListener("click", function () {
    setNav(!nav.classList.contains("is-open"));
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      setNav(false);
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      setNav(false);
      navToggle.focus();
    }
  });

  var desktopQuery = window.matchMedia("(min-width: 961px)");
  desktopQuery.addEventListener("change", function (event) {
    if (event.matches) setNav(false);
  });

  /* ---------- 滚动入场 ---------- */
  var revealItems = document.querySelectorAll(".reveal");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  /* ---------- FAQ：同时只展开一条 ---------- */
  var faqItems = Array.prototype.slice.call(document.querySelectorAll(".faq-item"));

  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (!item.open) return;
      faqItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  /* ---------- 实时营业状态 ---------- */
  var statusTargets = [
    document.getElementById("heroStatus"),
    document.getElementById("openStatus")
  ].filter(Boolean);

  var LUNCH_OPEN = 11 * 60;
  var LUNCH_CLOSE = 14 * 60 + 30;
  var DINNER_OPEN = 17 * 60;
  var DINNER_CLOSE = 21 * 60 + 30;

  function getShopStatus(now) {
    var day = now.getDay();
    var minutes = now.getHours() * 60 + now.getMinutes();

    if (day === 1) {
      return { state: "closed", text: "周一店休 · 周二 11:00 见" };
    }
    if (minutes < LUNCH_OPEN) {
      return { state: "closed", text: "已打烊 · 今日 11:00 开始营业" };
    }
    if (minutes < LUNCH_CLOSE) {
      return { state: "open", text: "营业中 · 午市至 14:30" };
    }
    if (minutes < DINNER_OPEN) {
      return { state: "closed", text: "午市已结束 · 晚市 17:00 开始" };
    }
    if (minutes < DINNER_CLOSE) {
      return { state: "open", text: "营业中 · 晚市至 21:30" };
    }
    return {
      state: "closed",
      text: day === 0 ? "已打烊 · 周一店休，周二 11:00 见" : "已打烊 · 明日 11:00 营业"
    };
  }

  function renderStatus() {
    var status = getShopStatus(new Date());
    statusTargets.forEach(function (target) {
      target.setAttribute("data-state", status.state);
      var textNode = target.querySelector(".status-text");
      if (textNode) textNode.textContent = status.text;
    });
  }

  renderStatus();
  window.setInterval(renderStatus, 30000);

  /* ---------- 复制地址 ---------- */
  var copyButton = document.getElementById("copyAddress");
  var toast = document.getElementById("toast");
  var toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2200);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      var succeeded = false;
      try {
        succeeded = document.execCommand("copy");
      } catch (error) {
        succeeded = false;
      }
      document.body.removeChild(field);
      succeeded ? resolve() : reject(new Error("copy failed"));
    });
  }

  if (copyButton) {
    copyButton.addEventListener("click", function () {
      var address = copyButton.getAttribute("data-address") || "";
      copyText(address).then(
        function () {
          showToast("地址已复制，期待你来");
        },
        function () {
          showToast("复制失败，请手动选择地址");
        }
      );
    });
  }
})();
