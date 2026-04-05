(function () {
  const show = (sel) => {
    if (!sel) return;
    const el = document.querySelector(sel);
    if (el) el.style.display = "block";
  };

  const hide = (sel) => {
    if (!sel) return;
    const el = document.querySelector(sel);
    if (el) el.style.display = "none";
  };

  const cobinar = {
    // 🔌 API
    api: (url) => ({
      get: async () => {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      },

      post: async (data = {}) => {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error("Request failed");
        return res.json();
      }
    }),

    // 🔥 SMART BIND (accepts function OR URL)
    bind: async (selector, source) => {
      const el = document.querySelector(selector);
      if (!el) return;

      try {
        let data;

        if (typeof source === "string") {
          data = await fetch(source).then(res => res.json());
        } else {
          data = await source();
        }

        el.innerText =
          typeof data === "object" ? JSON.stringify(data, null, 2) : data;
      } catch {
        el.innerText = "Error loading data";
      }
    },

    // ⚡ ACTION (improved)
    action: ({ trigger, request, loading, success, error }) => {
      const btn = document.querySelector(trigger);
      if (!btn) return;

      btn.addEventListener("click", async () => {
        try {
          show(loading);
          hide(success);
          hide(error);

          await request();

          hide(loading);
          show(success);
        } catch {
          hide(loading);
          show(error);
        }
      });
    },

    // 🧾 FORM HANDLER (NEW 🔥)
    form: (selector, { url, method = "POST", loading, success, error }) => {
      const form = document.querySelector(selector);
      if (!form) return;

      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
          show(loading);
          hide(success);
          hide(error);

          const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
          });

          if (!res.ok) throw new Error();

          hide(loading);
          show(success);
        } catch {
          hide(loading);
          show(error);
        }
      });
    },

    // ✨ SIMPLE ANIMATIONS (NEW 🔥)
    fadeIn: (selector, duration = 500) => {
      const el = document.querySelector(selector);
      if (!el) return;

      el.style.opacity = 0;
      el.style.display = "block";

      let last = +new Date();
      const tick = function () {
        el.style.opacity = +el.style.opacity + (new Date() - last) / duration;
        last = +new Date();

        if (+el.style.opacity < 1) {
          requestAnimationFrame(tick);
        }
      };

      tick();
    }
  };

  window.cobinar = cobinar;
})();
