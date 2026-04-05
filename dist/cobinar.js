(function () {
  const qs = (sel) => document.querySelector(sel);

  const show = (sel) => {
    const el = qs(sel);
    if (el) el.style.display = "block";
  };

  const hide = (sel) => {
    const el = qs(sel);
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

    // ⚡ ACTION
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
        } catch {
          hide(loading);
          show(error);
        }
      };
    },

    // 🧠 STATE (FIXED + SMOOTH)
    state: (initial) => {
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

      // bind UI
      state.bind = (key, selector) => {
        const el = qs(selector);
        if (!el) return;

        if (!listeners[key]) listeners[key] = [];

        listeners[key].push((value) => {
          el.style.transition = "opacity 0.3s";
          el.style.opacity = 0;

          setTimeout(() => {
            el.innerText =
              typeof value === "object"
                ? JSON.stringify(value, null, 2)
                : value;

            el.style.opacity = 1;
          }, 150);
        });

        // initial render
        notify(key, state[key]);
      };

      return state;
    },

    // 🔄 API → STATE SYNC (NEW)
    sync: async (state, key, url) => {
      try {
        const data = await fetch(url).then((r) => r.json());
        state[key] = data;
      } catch {
        console.error("Sync failed");
      }
    },

    // 🧾 FORM
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

          if (!res.ok) throw new Error();

          hide(loading);
          show(success);
        } catch {
          hide(loading);
          show(error);
        }
      };
    },

    // 💳 STRIPE HELPER (READY FOR YOUR API)
    pay: async (url) => {
      try {
        const res = await fetch(url, { method: "POST" });
        const data = await res.json();

        if (data.url) {
          window.location.href = data.url;
        } else {
          console.error("No checkout URL returned");
        }
      } catch {
        console.error("Payment failed");
      }
    }
  };

  window.cobinar = cobinar;
})();
