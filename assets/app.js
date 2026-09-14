(() => {
  const data = window.siteData || {};
  const site = data.site || {};
  const escapeHtml = (value = "") =>
    String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]);

  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  const menuButton = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-site-menu]");
  if (menuButton && menu) {
    menuButton.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("menu-open", isOpen);
    });
    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menu.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
      });
    });
  }

  document.querySelectorAll("[data-social-links]").forEach((container) => {
    container.innerHTML = (data.socialLinks || []).map((link) =>
      `<a class="social-link" href="${escapeHtml(link.href)}" target="_blank" rel="noreferrer">
        <span>${escapeHtml(link.label)}</span>
        <small>${escapeHtml(link.handle)}</small>
        <span aria-hidden="true">↗</span>
      </a>`
    ).join("");
  });

  document.querySelectorAll("[data-current-projects]").forEach((container) => {
    container.innerHTML = (data.currentProjects || []).map((project) =>
      `<article class="current-card current-card-${escapeHtml(project.accent)}">
        <div class="card-meta"><span>${escapeHtml(project.eyebrow)}</span><span>${escapeHtml(project.status)}</span></div>
        <h3>${escapeHtml(project.title)}</h3>
        <p>${escapeHtml(project.summary)}</p>
        <div class="card-detail">${escapeHtml(project.detail)}</div>
      </article>`
    ).join("");
  });

  const projectList = document.querySelector("[data-project-list]");
  const filterButtons = document.querySelectorAll("[data-project-filter]");
  const renderProjects = (filter = "All") => {
    if (!projectList) return;
    const projects = (data.projects || []).filter((project) => filter === "All" || project.tags.includes(filter));
    projectList.innerHTML = projects.map((project) =>
      `<article class="project-card project-card-${escapeHtml(project.accent)}">
        <div class="card-meta"><span>${escapeHtml(project.category)}</span><span>${escapeHtml(project.status)}</span></div>
        <div class="project-card-content">
          <h3>${escapeHtml(project.title)}</h3>
          <p class="project-role">${escapeHtml(project.role)}</p>
          <p>${escapeHtml(project.summary)}</p>
          <p class="project-detail">${escapeHtml(project.detail)}</p>
          <ul>${(project.highlights || []).map((highlight) => `<li>${escapeHtml(highlight)}</li>`).join("")}</ul>
        </div>
      </article>`
    ).join("");
  };
  if (projectList) {
    renderProjects();
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        filterButtons.forEach((item) => {
          item.classList.toggle("is-active", item === button);
          item.setAttribute("aria-pressed", String(item === button));
        });
        renderProjects(button.dataset.projectFilter || "All");
      });
    });
  }

  document.querySelectorAll("[data-career-list]").forEach((container) => {
    container.innerHTML = (data.career || []).map((item) =>
      `<article class="timeline-item">
        <div class="timeline-period">${escapeHtml(item.period)}</div>
        <div><h3>${escapeHtml(item.title)}</h3><p class="timeline-role">${escapeHtml(item.role)}</p><p>${escapeHtml(item.summary)}</p></div>
      </article>`
    ).join("");
  });

  document.querySelectorAll("[data-expertise]").forEach((container) => {
    container.innerHTML = (data.expertise || []).map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("");
  });

  document.querySelectorAll("[data-collaboration-types]").forEach((container) => {
    container.innerHTML = (data.collaborationTypes || []).map((item, index) =>
      `<article class="numbered-card"><span>0${index + 1}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary)}</p></article>`
    ).join("");
  });

  document.querySelectorAll("[data-sponsor-formats]").forEach((container) => {
    container.innerHTML = (data.sponsorFormats || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  });

  document.querySelectorAll("[data-sponsor-slot]").forEach((slot) => {
    const activeAd = (data.adSlots || []).find((ad) => ad.active && ad.placement === slot.dataset.sponsorSlot);
    if (!activeAd) return;
    slot.hidden = false;
    slot.innerHTML = `<a href="${escapeHtml(activeAd.destinationUrl)}" target="_blank" rel="sponsored noreferrer">
      <span class="sponsor-label">Sponsored partner</span>
      <strong>${escapeHtml(activeAd.advertiser)}</strong>
      <span>${escapeHtml(activeAd.altText)}</span>
    </a>`;
  });

  const configureAnalytics = () => {
    if (!site.plausibleDomain || document.querySelector("[data-plausible]")) return;
    const script = document.createElement("script");
    script.defer = true;
    script.dataset.domain = site.plausibleDomain;
    script.src = "https://plausible.io/js/script.js";
    script.dataset.plausible = "true";
    document.head.appendChild(script);
  };
  configureAnalytics();

  const setupTurnstile = () => {
    if (!site.turnstileSiteKey || !document.querySelector("[data-turnstile]")) return;
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => {
      document.querySelectorAll("[data-turnstile]").forEach((container) => {
        container._turnstileWidgetId = window.turnstile.render(container, { sitekey: site.turnstileSiteKey });
      });
    };
    document.head.appendChild(script);
  };
  setupTurnstile();

  document.querySelectorAll("form[data-contact-form]").forEach((form) => {
    const submitButton = form.querySelector("button[type=submit]");
    const status = form.querySelector("[data-form-status]");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const originalLabel = submitButton ? submitButton.textContent : "";
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending…";
      }
      if (status) {
        status.className = "form-status";
        status.textContent = "Sending your note…";
      }
      const payload = Object.fromEntries(new FormData(form).entries());
      const turnstile = form.querySelector("[data-turnstile]");
      if (turnstile && turnstile._turnstileWidgetId !== undefined && window.turnstile) {
        payload.turnstileToken = window.turnstile.getResponse(turnstile._turnstileWidgetId);
      }
      try {
        const response = await fetch(form.getAttribute("action") || "/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload)
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || "The form could not be sent.");
        form.reset();
        if (status) {
          status.className = "form-status is-success";
          status.textContent = result.message || "Thanks — your note is on its way.";
        }
      } catch (error) {
        if (status) {
          status.className = "form-status is-error";
          status.innerHTML = `${escapeHtml(error.message)} You can also email <a href="mailto:${escapeHtml(site.email)}">${escapeHtml(site.email)}</a> directly.`;
        }
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalLabel;
        }
      }
    });
  });
})();