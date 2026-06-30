(() => {
  "use strict";

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const topbar = document.querySelector("[data-topbar]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  const updateTopbar = () => {
    topbar?.classList.toggle("scrolled", window.scrollY > 24);
  };

  updateTopbar();
  window.addEventListener("scroll", updateTopbar, { passive: true });

  menuToggle?.addEventListener("click", () => {
    mobileMenu?.classList.toggle("open");
  });

  mobileMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
    });
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".reveal").forEach((element) => {
    revealObserver.observe(element);
  });

  const heroScene = document.querySelector("[data-hero-scene]");

  if (heroScene && !reducedMotion) {
    const depthItems = heroScene.querySelectorAll("[data-depth]");

    heroScene.addEventListener("pointermove", (event) => {
      const rect = heroScene.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      heroScene.style.transform =
        `rotateX(${y * -2.5}deg) rotateY(${x * 3.5}deg)`;

      depthItems.forEach((item) => {
        const depth = Number(item.dataset.depth || 0.1);
        item.style.translate =
          `${x * depth * 150}px ${y * depth * 110}px`;
      });
    });

    heroScene.addEventListener("pointerleave", () => {
      heroScene.style.transform = "";
      depthItems.forEach((item) => {
        item.style.translate = "";
      });
    });
  }

  document.querySelectorAll("[data-count]").forEach((counter) => {
    const target = Number(counter.dataset.count || 0);
    let current = 0;

    const animate = () => {
      current += Math.max(1, Math.round((target - current) * 0.08));
      counter.textContent = `${Math.min(current, target)}%`;

      if (current < target) {
        requestAnimationFrame(animate);
      }
    };

    window.setTimeout(animate, 900);
  });

  document.querySelectorAll(".tilt").forEach((card) => {
    if (reducedMotion) return;

    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const rotateX = (0.5 - py) * 9;
      const rotateY = (px - 0.5) * 11;

      card.style.transform =
        `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`;
      card.style.setProperty("--mx", `${px * 100}%`);
      card.style.setProperty("--my", `${py * 100}%`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });

  const chip = document.querySelector("[data-chip]");
  const chipScene = document.querySelector("[data-chip-scene]");

  if (chip && chipScene && !reducedMotion) {
    chipScene.addEventListener("pointermove", (event) => {
      const rect = chipScene.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      chip.style.transform =
        `translate(-50%, -50%) translateZ(115px) rotateX(${7 - y * 14}deg) rotateY(${-10 + x * 18}deg)`;
    });

    chipScene.addEventListener("pointerleave", () => {
      chip.style.transform =
        "translate(-50%, -50%) translateZ(115px) rotateX(7deg) rotateY(-10deg)";
    });
  }

  const canvas = document.getElementById("ambientCanvas");
  const context = canvas?.getContext("2d");

  if (canvas && context) {
    let width = 0;
    let height = 0;
    let particles = [];
    let pointer = { x: -1000, y: -1000 };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      const count = Math.min(
        76,
        Math.max(36, Math.floor(width / 22))
      );

      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: Math.random() * 1.4 + 0.3,
      }));
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);

      for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -20) particle.x = width + 20;
        if (particle.x > width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = height + 20;
        if (particle.y > height + 20) particle.y = -20;

        const distanceToPointer = Math.hypot(
          particle.x - pointer.x,
          particle.y - pointer.y
        );

        if (distanceToPointer < 140) {
          particle.x += (particle.x - pointer.x) * 0.002;
          particle.y += (particle.y - pointer.y) * 0.002;
        }

        context.beginPath();
        context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        context.fillStyle = "rgba(117,172,255,.28)";
        context.fill();
      }

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);

          if (distance > 110) continue;

          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.strokeStyle =
            `rgba(110,160,220,${(1 - distance / 110) * 0.11})`;
          context.lineWidth = 0.6;
          context.stroke();
        }
      }

      if (!reducedMotion) {
        requestAnimationFrame(draw);
      }
    };

    window.addEventListener("pointermove", (event) => {
      pointer = { x: event.clientX, y: event.clientY };
    });

    window.addEventListener("resize", resize);
    resize();
    draw();
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const selector = link.getAttribute("href");
      const target = document.querySelector(selector);

      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  });
})();
