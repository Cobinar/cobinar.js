(function () {
  const qs = (s) => document.querySelector(s);

  const config = {
    baseURL: "",
    headers: {
      "Content-Type": "application/json"
    }
  };

  const cobinar = {
    // =========================
    // ⚙️ CONFIG
    // =========================
    config: (opts) => {
      Object.assign(config, opts);
    },

    // =========================
    // 🔌 UNIVERSAL REQUEST
    // =========================
    request: async ({
      url,
      method = "GET",
      data,
      headers = {}
    }) => {
      const res = await fetch(config.baseURL + url, {
        method,
        headers: { ...config.headers, ...headers },
        body: data ? JSON.stringify(data) : undefined
      });

      if (!res.ok) throw new Error("Request failed");

      return res.json();
    },

    // =========================
    // 🧠 STATE
    // =========================
    state: (initial = {}) => {
      const listeners = {};

      const notify = (k, v) => {
        (listeners[k] || []).forEach((fn) => fn(v));
      };

      const state = new Proxy(initial, {
        set(target, key, value) {
          target[key] = value;
          notify(key, value);
          return true;
        }
      });

      state.bind = (key, selector) => {
        const el = qs(selector);
        if (!el) return;

        listeners[key] = listeners[key] || [];

        listeners[key].push((val) => {
          el.innerText =
            typeof val === "object"
              ? JSON.stringify(val, null, 2)
              : val;
        });

        notify(key, state[key]);
      };

      return state;
    },

    // =========================
    // 🧩 COMPONENT
    // =========================
    component: (selector, render) => {
      const el = qs(selector);
      if (!el) return;

      const update = () => {
        el.innerHTML = render();
      };

      update();
      return { update };
    },

    // =========================
    // 🌐 ROUTER
    // =========================
    route: (routes) => {
      const render = () => {
        const path = location.pathname;
        const view = routes[path] || routes["/"];

        const app = qs("#app");
        if (app) app.innerHTML = view();
      };

      window.addEventListener("popstate", render);

      document.addEventListener("click", (e) => {
        const link = e.target.closest("[data-link]");
        if (!link) return;

        e.preventDefault();
        history.pushState(null, "", link.href);
        render();
      });

      render();
    },

    // =========================
    // 🧾 FORM (UNIVERSAL)
    // =========================
    form: (selector, handler) => {
      const form = qs(selector);
      if (!form) return;

      form.onsubmit = async (e) => {
        e.preventDefault();

        const data = Object.fromEntries(
          new FormData(form).entries()
        );

        await handler(data);
      };
    },

    // =========================
    // ⚡ ACTION (GENERIC)
    // =========================
    action: (selector, handler) => {
      const el = qs(selector);
      if (!el) return;

      el.onclick = async () => {
        await handler();
      };
    },

    // =========================
    // 💳 PAYMENT (GLOBAL)
    // =========================
    pay: async (handler) => {
      try {
        const result =
          typeof handler === "function"
            ? await handler()
            : await cobinar.request({
                url: handler.url,
                method: "POST",
                data: handler.data
              });

        if (result.url) {
          window.location.href = result.url;
        } else {
          throw new Error("No checkout URL returned");
        }
      } catch (e) {
        console.error("Payment error:", e);
      }
    }
  };

  window.cobinar = cobinar;
})();
