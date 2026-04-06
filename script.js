const header = document.querySelector(".site-header");
const revealItems = document.querySelectorAll(".reveal");
const videoCards = document.querySelectorAll("[data-video-card]");
const tiltCards = document.querySelectorAll("[data-tilt-card]");
const parallaxArea = document.querySelector("[data-parallax-area]");
const parallaxItem = document.querySelector("[data-parallax-item]");
const cursorGlow = document.querySelector(".cursor-glow");
const cursorRing = document.querySelector(".cursor-ring");
const cursorDot = document.querySelector(".cursor-dot");
const processSection = document.querySelector(".process");
const processProgress = document.querySelector(".process-line-progress");
const followLight = document.querySelector("[data-follow-light]");

const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouchDevice = window.matchMedia("(hover: none)").matches;

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
);

revealItems.forEach((item) => revealObserver.observe(item));

const syncHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

const playPreview = async (video) => {
  if (!video || isReducedMotion) return;
  try {
    video.currentTime = 0;
    await video.play();
  } catch (error) {
    // Ignore autoplay restrictions.
  }
};

const pausePreview = (video, reset = true) => {
  if (!video) return;
  video.pause();
  if (reset) {
    video.currentTime = 0;
  }
};

videoCards.forEach((card) => {
  const video = card.querySelector("video");
  if (!video) return;

  card.addEventListener("mouseenter", () => playPreview(video));
  card.addEventListener("mouseleave", () => pausePreview(video));
  card.addEventListener("focusin", () => playPreview(video));
  card.addEventListener("focusout", () => pausePreview(video));

  if (isTouchDevice) {
    const touchObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const active = entry.isIntersecting && entry.intersectionRatio > 0.6;
          card.classList.toggle("is-touch-active", active);
          if (active) {
            playPreview(video);
          } else {
            pausePreview(video, false);
          }
        });
      },
      { threshold: [0.2, 0.6, 0.9] }
    );

    touchObserver.observe(card);
  }
});

if (!isReducedMotion && parallaxArea && parallaxItem && !isTouchDevice) {
  parallaxArea.addEventListener("mousemove", (event) => {
    const bounds = parallaxArea.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    parallaxItem.style.transform = `translate3d(${x * 18}px, ${y * 18}px, 0)`;
    parallaxArea.style.transform = `translate3d(${x * -10}px, ${y * -10}px, 0) scale(1.01)`;
  });

  parallaxArea.addEventListener("mouseleave", () => {
    parallaxItem.style.transform = "";
    parallaxArea.style.transform = "";
  });
}

if (!isReducedMotion && !isTouchDevice) {
  document.body.classList.add("has-custom-cursor");

  const interactiveTargets = document.querySelectorAll("a, button, .video-card, .process-card, .logo-chip");
  const pointer = {
    currentX: window.innerWidth / 2,
    currentY: window.innerHeight / 2,
    targetX: window.innerWidth / 2,
    targetY: window.innerHeight / 2,
    ringX: window.innerWidth / 2,
    ringY: window.innerHeight / 2,
  };

  const animateCursor = () => {
    pointer.currentX += (pointer.targetX - pointer.currentX) * 0.22;
    pointer.currentY += (pointer.targetY - pointer.currentY) * 0.22;
    pointer.ringX += (pointer.targetX - pointer.ringX) * 0.12;
    pointer.ringY += (pointer.targetY - pointer.ringY) * 0.12;

    cursorDot.style.transform = `translate(${pointer.currentX}px, ${pointer.currentY}px) translate(-50%, -50%)`;
    cursorRing.style.transform = `translate(${pointer.ringX}px, ${pointer.ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateCursor);
  };

  requestAnimationFrame(animateCursor);

  document.addEventListener("mousemove", (event) => {
    pointer.targetX = event.clientX;
    pointer.targetY = event.clientY;
    cursorGlow.style.opacity = "1";
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
    cursorRing.style.opacity = "1";
    cursorDot.style.opacity = "1";
  });

  document.addEventListener("mouseleave", () => {
    cursorGlow.style.opacity = "0";
    cursorRing.style.opacity = "0";
    cursorDot.style.opacity = "0";
  });

  interactiveTargets.forEach((target) => {
    target.addEventListener("mouseenter", () => {
      cursorRing.classList.add("is-active");
      cursorDot.classList.add("is-active");
    });

    target.addEventListener("mouseleave", () => {
      cursorRing.classList.remove("is-active");
      cursorDot.classList.remove("is-active");
      target.style.transform = "";
    });

    target.addEventListener("mousemove", (event) => {
      const bounds = target.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const deltaX = event.clientX - centerX;
      const deltaY = event.clientY - centerY;
      const moveX = deltaX * 0.08;
      const moveY = deltaY * 0.08;

      pointer.targetX = centerX + deltaX * 0.2;
      pointer.targetY = centerY + deltaY * 0.2;

      if (!target.hasAttribute("data-tilt-card")) {
        target.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
      }
    });
  });
}

if (!isReducedMotion && !isTouchDevice) {
  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.transform = `perspective(1200px) rotateX(${y * -5}deg) rotateY(${x * 5}deg) translateY(-6px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

const syncProcessLine = () => {
  if (!processSection || !processProgress) return;
  const bounds = processSection.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const distance = viewportHeight - bounds.top;
  const total = bounds.height + viewportHeight * 0.25;
  const progress = Math.max(0, Math.min(distance / total, 1));
  processProgress.style.width = `${progress * 100}%`;
};

syncProcessLine();
window.addEventListener("scroll", syncProcessLine, { passive: true });
window.addEventListener("resize", syncProcessLine);

if (!isReducedMotion && followLight && !isTouchDevice) {
  followLight.addEventListener("mousemove", (event) => {
    const bounds = followLight.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    followLight.style.setProperty("--light-x", `${x}%`);
    followLight.style.setProperty("--light-y", `${y}%`);
  });
}
