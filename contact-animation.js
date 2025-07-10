// contact-animations.js
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  // Hero Section
  gsap.from(".hero h2", {
    y: -50,
    autoAlpha: 1,
    duration: 1,
    ease: "power3.out"
  });

  gsap.from(".hero p", {
    y: 50,
    autoAlpha: 1,
    duration: 1,
    delay: 0.3,
    ease: "power3.out"
  });

  // Intro Section
  gsap.from(".intro-image img", {
    x: -100,
    autoAlpha: 1,
    duration: 1,
    delay: 0.5,
    ease: "power2.out",
    clearProps: "all"
  });

  gsap.from(".intro-text", {
    x: 100,
    autoAlpha: 1,
    duration: 1,
    delay: 0.6,
    ease: "power2.out",
    clearProps: "all"
  });

  // Contact Form Rows
  gsap.from(".contact-form .row", {
    autoAlpha: 1,
    y: 30,
    duration: 0.8,
    delay: 0.9,
    stagger: 0.2,
    ease: "power2.out",
    clearProps: "all"
  });

  // Contact Info (Fix disappearing issue by ensuring visibility)
  gsap.from(".contact-info p", {
    scrollTrigger: {
      trigger: ".contact-info",
      start: "top 80%",
      toggleActions: "play none none none"
    },
    x: -30,
    autoAlpha: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: "power2.out",
    clearProps: "all"
  });

  // Footer Reveal
  gsap.from("footer", {
    scrollTrigger: {
      trigger: "footer",
      start: "top 85%",
      toggleActions: "play none none none"
    },
    autoAlpha: 0,
    y: 100,
    duration: 1,
    ease: "power2.out",
    clearProps: "all"
  });
});
