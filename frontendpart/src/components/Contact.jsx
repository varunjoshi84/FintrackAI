import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    message: '',
    agreeTerms: false,
  });

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Hero Section
    gsap.from(".hero h2", {
      y: -50,
      autoAlpha: 0,
      duration: 1,
      ease: "power3.out",
    });

    gsap.from(".hero p", {
      y: 50,
      autoAlpha: 0,
      duration: 1,
      delay: 0.3,
      ease: "power3.out",
    });

    // Intro Section
    gsap.from(".intro-image img", {
      x: -100,
      autoAlpha: 0,
      duration: 1,
      delay: 0.5,
      ease: "power2.out",
      clearProps: "all",
    });

    gsap.from(".intro-text", {
      x: 100,
      autoAlpha: 0,
      duration: 1,
      delay: 0.6,
      ease: "power2.out",
      clearProps: "all",
    });

    // Contact Form Rows
    gsap.from(".contact-form .row", {
      autoAlpha: 0,
      y: 30,
      duration: 0.8,
      delay: 0.9,
      stagger: 0.2,
      ease: "power2.out",
      clearProps: "all",
    });

    // Contact Info
    gsap.from(".contact-info p", {
      scrollTrigger: {
        trigger: ".contact-info",
        start: "top 80%",
        toggleActions: "play none none none",
      },
      x: -30,
      autoAlpha: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.out",
      clearProps: "all",
    });

    // Footer Reveal
    gsap.from("footer", {
      scrollTrigger: {
        trigger: "footer",
        start: "top 85%",
        toggleActions: "play none none none",
      },
      autoAlpha: 0,
      y: 100,
      duration: 1,
      ease: "power2.out",
      clearProps: "all",
    });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      alert('Please agree to the terms and policy.');
      return;
    }
    alert('Message sent! We will get back to you shortly.');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      department: '',
      message: '',
      agreeTerms: false,
    });
  };

  return (
    <div className="font-inter bg-gray-50 text-gray-800">
      <Header />
      {/* Hero Section */}
      <section className="hero bg-gradient-to-r from-blue-100 to-yellow-100 text-center py-12 border-b border-gray-200">
        <h2 className="text-3xl font-bold mb-2">Get in Touch</h2>
        <p className="text-lg text-gray-600">
          Have any questions? Reach out to us from our contact form and we’ll get back to you shortly.
        </p>
      </section>

      {/* Contact Intro */}
      <section className="contact-intro flex flex-wrap justify-center items-center py-12 px-6 bg-white gap-6">
        <div className="intro-image">
          <img src="/images/people-chat.png" alt="People holding speech bubbles" className="max-w-full rounded-lg w-[450px]" />
        </div>
        <div className="intro-text max-w-md">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">Let’s Talk</h3>
          <p className="mb-2 text-gray-600">
            Let’s make something great together. We’re trusted by 5000+ users. Join them by using FinTrackAI.
          </p>
          <p className="mb-4 text-gray-600">
            Reach out for queries, partnership, or feedback—we’d love to hear from you.
          </p>
          <a href="#" className="join-btn inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold transition-colors hover:bg-blue-700">
            Join Us
          </a>
        </div>
      </section>

      {/* Form and Contact Info */}
      <section className="contact-main py-12 px-6">
        <form className="contact-form max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md mb-6" onSubmit={handleSubmit}>
          <div className="row flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="row flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a department</option>
              <option value="Support">Support</option>
              <option value="Feedback">Feedback</option>
              <option value="Careers">Careers</option>
            </select>
          </div>
          <textarea
            placeholder="Your Message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px] resize-y"
          ></textarea>
          <div className="row checkbox-row flex items-center mb-4">
            <label className="checkbox-label flex items-center gap-2 text-gray-600 font-medium">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                required
                className="w-4 h-4 accent-blue-600"
              />
              I agree to terms and policy.
            </label>
          </div>
          <div className="row button-row">
            <button
              type="submit"
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-full font-semibold shadow-md hover:transform hover:-translate-y-1 hover:shadow-lg transition-all duration-200 ml-auto"
            >
              Send Message
            </button>
          </div>
        </form>

        <div className="contact-info max-w-2xl mx-auto text-left mt-6 text-gray-800">
          <p className="mb-2 flex items-center">
            <i className="fas fa-map-marker-alt text-blue-600 mr-2"></i> Moonshine St. 14/05, Light City, London
          </p>
          <p className="mb-2 flex items-center">
            <i className="fas fa-phone text-blue-600 mr-2"></i> 00 (123) 456 78 90
          </p>
          <p className="mb-2 flex items-center">
            <i className="fas fa-envelope text-blue-600 mr-2"></i> contact@fintrackai.com
          </p>
        </div>
      </section>

      {/* Map */}
      <section className="map py-12 px-6">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d14424.998842483148!2d74.6061824!3d25.3294004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1751818273373!5m2!1sen!2sin"
          width="100%"
          height="300"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </section>

      <div id="footer"></div>
      <Footer />
    </div>
  );
};

export default Contact;