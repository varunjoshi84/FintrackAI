document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(TextPlugin, ScrollTrigger);

  // Hero text typing effect
  gsap.to(".hero p", {
    text: "Have any questions? Reach out to us and we’ll get back to you shortly.",
    duration: 2,
    delay: 0.5,
    ease: "power1.inOut"
  });

  // Intro image zoom effect
  gsap.from(".intro-image img", {
    scale: 0.8,
    rotate: 5,
    opacity: 0,
    duration: 1,
    delay: 0.3,
    ease: "back.out(1.7)"
  });

  // Intro text slide-in
  gsap.from(".intro-text", {
    x: 100,
    opacity: 0,
    duration: 1,
    delay: 0.5,
    ease: "power2.out"
  });

  // Contact form fields stagger in
  gsap.from(".contact-form input, .contact-form select, .contact-form textarea", {
    opacity: 0,
    y: 40,
    duration: 0.6,
    stagger: 0.1,
    delay: 1
  });

  // Scroll-triggered contact section
  gsap.from(".contact-main", {
    scrollTrigger: ".contact-main",
    opacity: 0,
    y: 50,
    duration: 1,
    ease: "power2.out"
  });

  // Scroll-triggered footer
  gsap.from("footer", {
    scrollTrigger: "footer",
    opacity: 0,
    y: 100,
    duration: 1,
    ease: "power2.out"
  });

  // Floating social icons in footer
  gsap.to(".social-icons a img", {
    y: -8,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut",
    duration: 1.5,
    stagger: 0.3
  });

  // Newsletter input shimmer
  gsap.to(".footer-newsletter input", {
    boxShadow: "0 0 10px #63b3ed",
    repeat: -1,
    yoyo: true,
    duration: 1.2,
    ease: "power1.inOut"
  });

  // Just for fun: pulsing join button
  gsap.to(".join-btn", {
    scale: 1.05,
    repeat: -1,
    yoyo: true,
    duration: 1.2,
    ease: "power1.inOut"
  });
});
