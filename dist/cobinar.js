(function () {
  const qs = (s) => document.querySelector(s);

  const config = {
    baseURL: ""
  };

  const cobinar = {
    // =========================
    // ⚙️ CONFIG
    // =========================
    config: (opts) => {
      Object.assign(config, opts);
    },

    // =========================
    // 🔌 API
    // =========================
    api: (endpoint) => {
      const url = config.baseURL + endpoint;

      return {
        get: async () => {
          const res = await fetch(url);
          if (!res.ok) throw new Error("GET failed");
          return res.json();
        },

        post: async (data = {}) => {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
          });

          if (!res.ok) throw new Error("POST failed");
          return res.json();
        }
      };
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
    // 🧩 COMPONENTS
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
    // 🌐 ROUTER (SPA)
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
        if (e.target.matches("[data-link]")) {
          e.preventDefault();
          history.pushState(null, "", e.target.href);
          render();
        }
      });

      render();
    },

    // =========================
    // 🧾 FORM
    // =========================
    form: (selector, { url }) => {
      const form = qs(selector);
      if (!form) return;

      form.onsubmit = async (e) => {
        e.preventDefault();

        const data = Object.fromEntries(
          new FormData(form).entries()
        );

        await fetch(config.baseURL + url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
      };
    },

    // =========================
    // 💳 PAYMENT
    // =========================
    pay: async (endpoint, data = {}) => {
      const res = await fetch(config.baseURL + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const json = await res.json();

      if (json.url) {
        window.location.href = json.url;
      }
    }
  };

  window.cobinar = cobinar;
})();
