(function () {
  const cobinar = {
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

    bind: async (selector, fn) => {
      const el = document.querySelector(selector);
      if (!el) return;

      try {
        const data = await fn();
        el.innerText =
          typeof data === "object" ? JSON.stringify(data) : data;
      } catch (err) {
        el.innerText = "Error loading data";
      }
    },

    action: ({ trigger, request, loading, success, error }) => {
      const btn = document.querySelector(trigger);
      if (!btn) return;

      btn.addEventListener("click", async () => {
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

        try {
          show(loading);
          hide(success);
          hide(error);

          await request();

          hide(loading);
          show(success);
        } catch (e) {
          hide(loading);
          show(error);
        }
      });
    }
  };

  // expose globally
  window.cobinar = cobinar;
})();
