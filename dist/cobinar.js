(function () {
  const qs = (sel) => document.querySelector(sel);

  const show = (sel) => {
    if (!sel) return;
    const el = qs(sel);
    if (el) el.style.display = "block";
  };

  const hide = (sel) => {
    if (!sel) return;
    const el = qs(sel);
    if (el) el.style.display = "none";
  };

  const cobinar = {
    // =========================
    // 🔌 API HANDLER
    // =========================
    api: (url) => ({
      get: async () => {
        const res = await fetch(url);
        if (!res.ok) throw new Error("GET request failed");
        return res.json();
      },

      post: async (data = {}) => {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error("POST request failed");
        return res.json();
      }
    }),

    // =========================
    // ⚡ ACTION HANDLER
    // =========================
    action: ({ trigger, request, loading, success, error }) => {
      const btn = qs(trigger);
      if (!btn) return;

      btn.onclick = async () => {
        try {
          show(loading);
          hide(success);
          hide(error);

          await request();

          hide(loading);
          show(success);
        } catch (e) {
          console.error(e);
          hide(loading);
          show(error);
        }
      };
    },

    // =========================
    // 🧠 REACTIVE STATE SYSTEM
    // =========================
    state: (initial = {}) => {
      const listeners = {};

      const notify = (key, value) => {
        if (listeners[key]) {
          listeners[key].forEach((fn) => fn(value));
        }
      };

      const state = new Proxy(initial, {
        set(target, key, value) {
          target[key] = value;
          notify(key, value);
          return true;
        }
      });

      // bind UI element to state key
      state.bind = (key, selector) => {
        const el = qs(selector);
        if (!el) return;

        if (!listeners[key]) listeners[key] = [];

        listeners[key].push((value) => {
          el.style.transition = "opacity 0.2s ease";
          el.style.opacity = 0;

          setTimeout(() => {
            el.innerText =
              typeof value === "object"
                ? JSON.stringify(value, null, 2)
                : value;

            el.style.opacity = 1;
          }, 100);
        });

        // initial render
        notify(key, state[key]);
      };

      return state;
    },

    // =========================
    // 🔄 API → STATE SYNC
    // =========================
    sync: async (state, key, url) => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Sync failed");

        const data = await res.json();
        state[key] = data;
      } catch (e) {
        console.error("Sync error:", e);
      }
    },

    // =========================
    // 🧾 FORM HANDLER
    // =========================
    form: (selector, { url, method = "POST", loading, success, error }) => {
      const form = qs(selector);
      if (!form) return;

      form.onsubmit = async (e) => {
        e.preventDefault();

        const data = Object.fromEntries(new FormData(form).entries());

        try {
          show(loading);
          hide(success);
          hide(error);

          const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
          });

          if (!res.ok) throw new Error("Form request failed");

          hide(loading);
          show(success);
        } catch (e) {
          console.error(e);
          hide(loading);
          show(error);
        }
      };
    },

    // =========================
    // 💳 STRIPE / PAYMENT HELPER
    // =========================
    pay: async (url, data = {}, { loading, error } = {}) => {
      try {
        show(loading);
        hide(error);

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error("Payment request failed");

        const json = await res.json();

        if (json.url) {
          window.location.href = json.url;
        } else {
          throw new Error("No checkout URL returned");
        }
      } catch (e) {
        console.error("Payment error:", e);
        hide(loading);
        show(error);
      }
    },

    // =========================
    // ✨ SIMPLE ANIMATION
    // =========================
    fadeIn: (selector, duration = 400) => {
      const el = qs(selector);
      if (!el) return;

      el.style.opacity = 0;
      el.style.display = "block";

      let last = performance.now();

      const tick = (now) => {
        el.style.opacity =
          +el.style.opacity + (now - last) / duration;

        last = now;

        if (+el.style.opacity < 1) {
          requestAnimationFrame(tick);
        }
      };

      requestAnimationFrame(tick);
    }
  };

  // expose globally
  window.cobinar = cobinar;
})();
