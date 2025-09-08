import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styles from "../styles/Home.module.css";
import Navbar from "../components/Navbar";
import { createAdmissionApi } from "../api/admissionAPI";
import { createContactApi } from "../api/contactAPI";

const leadershipData = [
  {
    name: "Dr. K. L. Verma",
    title: "Principal",
    bio: "With over 25 years of experience, Dr. Verma is dedicated to fostering an environment of innovation and academic rigor.",
    img: "https://randomuser.me/api/portraits/men/72.jpg",
  },
  {
    name: "Dr. P. S. Rao",
    title: "Vice-Principal",
    bio: "Dr. Rao's passion for technical education drives our institute's commitment to hands-on, practical learning and student success.",
    img: "https://randomuser.me/api/portraits/men/73.jpg",
  },
];

const coursesData = [
  { title: "CNC Operator", description: "Master Computer Numerical Control (CNC) machinery for precision manufacturing." },
  { title: "Industrial Fitter", description: "Expert training in assembling and maintaining industrial machinery and systems." },
  { title: "Welding Technology", description: "Hands-on experience with advanced welding techniques and safety protocols." },
  { title: "Software Development", description: "Foundational and advanced skills in modern programming and software engineering." },
  { title: "Electrical & Power Systems", description: "Comprehensive course on electrical wiring, power generation, and distribution networks." },
  { title: "Automotive Technician", description: "A practical course covering engine diagnostics, repair, and vehicle maintenance." },
];

const Home = () => {
  const location = useLocation();
  // ✅ Handle scroll when navigating from other routes
  useEffect(() => {
    if (location.state?.scrollTarget) {
      const section = document.getElementById(location.state.scrollTarget);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);
  const [admissionForm, setAdmissionForm] = useState({
    name: "",
    email: "",
    phone: "",
    course: "",
  });

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  // Success & Error Messages
  const [admissionMessage, setAdmissionMessage] = useState("");
  const [contactMessage, setContactMessage] = useState("");

   // Auto clear messages after 10 seconds
  useEffect(() => {
    if (admissionMessage) {
      const timer = setTimeout(() => setAdmissionMessage(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [admissionMessage]);

  useEffect(() => {
    if (contactMessage) {
      const timer = setTimeout(() => setContactMessage(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [contactMessage]);

  // Handle Admission Form Submit
  const handleAdmissionSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAdmissionApi(admissionForm);
      setAdmissionMessage({ type: "success", text: "✅ Admission form submitted successfully!" });
      setAdmissionForm({ name: "", email: "", phone: "", course: "" });
    } catch (err) {
      console.error(err);
      setAdmissionMessage({ type: "error", text: "❌ Failed to submit admission form." });
    }
  };

  // Handle Contact Form Submit
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await createContactApi(contactForm);
      setContactMessage({ type: "success", text: "✅ Message sent successfully!" });
      setContactForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error(err);
      setContactMessage({ type: "error", text: "❌ Failed to send message." });
    }
  };

  // ✅ Animate sections when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll(`.${styles.section}`);
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <main>
      <header className={styles.header}>
        <Navbar />
      </header>

    {/* 🌟 Hero Section with Video Background */}
<section id="home" className={styles.hero}>
  {/* Background Video */}
  <video
    className={styles.heroVideo}
    src="https://www.cmrit.ac.in/wp-content/uploads/2023/10/CMRIT-Banner-Video-1.mp4"
    autoPlay
    loop
    muted
    playsInline
  ></video>

  {/* Dark Overlay for readability */}
  <div className={styles.overlay}></div>

  {/* Hero Content */}
  <div className={styles.heroContent }>
    <h1>Umacahgi ITI, Hassan</h1>
    <p>
      Empowering the future with <strong>quality technical education</strong>  
      through innovation, skill, and industry excellence.
    </p>
    <a href="#admission" className={styles.ctaBtn}>
      Apply for Admission
    </a>
  </div>
</section>

      {/* About Section */}
      <section id="about" className={`${styles.about} ${styles.section}`}>
        <div className={styles.container}>
          <h2>About Our Institute</h2>
          <div className={styles.visionMissionGrid}>
            <div className={styles.card}>
              <h3>Our Vision</h3>
              <p>
                To be a premier institution of technical education, empowering students with practical skills and knowledge to become industry-ready professionals.
              </p>
            </div>
            <div className={styles.card}>
              <h3>Our Mission</h3>
              <p>
                To provide quality technical education through innovative teaching methods, state-of-the-art facilities, and industry-relevant curriculum that prepares students for successful careers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section id="leadership" className={`${styles.leadership} ${styles.section}`}>
        <div className={styles.container}>
          <h2>Our Leadership</h2>
          <div className={styles.leadershipGrid}>
            {leadershipData.map(({ name, title, bio, img }) => (
              <article key={name} className={styles.leaderCard}>
                <img src={img} alt={`${name}, ${title}`} className={styles.leaderImg} loading="lazy" />
                <h3>{name}</h3>
                <p className={styles.leaderTitle}>{title}</p>
                <p className={styles.leaderBio}>{bio}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className={`${styles.courses} ${styles.section}`}>
        <div className={styles.container}>
          <h2>Courses We Offer</h2>
          <div className={styles.coursesGrid}>
            {coursesData.map(({ title, description }) => (
              <article key={title} className={styles.courseCard}>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Admission Section */}
      <section id="admission" className={`${styles.admission} ${styles.section}`}>
        <div className={styles.container}>
          <h2>Admission Form</h2>
          {admissionMessage && (
            <p
              className={
                admissionMessage.type === "success"
                  ? styles.successMsg
                  : styles.errorMsg
              }
            >
              {admissionMessage.text}
            </p>
          )}
          <form className={styles.form} onSubmit={handleAdmissionSubmit}>
            <label htmlFor="admission-name">Name</label>
            <input
              type="text"
              id="admission-name"
              placeholder="Your full name"
              value={admissionForm.name}
              onChange={(e) => setAdmissionForm({ ...admissionForm, name: e.target.value })}
              required
            />

            <label htmlFor="admission-email">Email</label>
            <input
              type="email"
              id="admission-email"
              placeholder="you@example.com"
              value={admissionForm.email}
              onChange={(e) => setAdmissionForm({ ...admissionForm, email: e.target.value })}
              required
            />

            <label htmlFor="admission-phone">Phone</label>
            <input
              type="tel"
              id="admission-phone"
              placeholder="+91 98765 43210"
              value={admissionForm.phone}
              onChange={(e) => setAdmissionForm({ ...admissionForm, phone: e.target.value })}
              required
            />

            <label htmlFor="admission-course">Course of Interest</label>
            <select
              id="admission-course"
              value={admissionForm.course}
              onChange={(e) => setAdmissionForm({ ...admissionForm, course: e.target.value })}
              required
            >
              <option value="" disabled>
                Select a course
              </option>
              {coursesData.map(({ title }) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>

            <button type="submit" className={styles.submitBtn}>
              Submit Admission
            </button>
          </form>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className={`${styles.contact} ${styles.section}`}>
        <div className={styles.container}>
          <h2>Contact Us</h2>
          {contactMessage && (
            <p
              className={
                contactMessage.type === "success"
                  ? styles.successMsg
                  : styles.errorMsg
              }
            >
              {contactMessage.text}
            </p>
          )}
          <form className={styles.form} onSubmit={handleContactSubmit}>
            <label htmlFor="contact-name">Name</label>
            <input
              type="text"
              id="contact-name"
              placeholder="Your full name"
              value={contactForm.name}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              required
            />

            <label htmlFor="contact-email">Email</label>
            <input
              type="email"
              id="contact-email"
              placeholder="you@example.com"
              value={contactForm.email}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              required
            />

            <label htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              rows="5"
              placeholder="Write your message here..."
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              required
            ></textarea>

            <button type="submit" className={styles.submitBtn}>
              Send Message
            </button>
          </form>
        </div>
      </section>
            {/* Map Section */}
      <section id="map" className={`${styles.mapSection} ${styles.section}`}>
        <div className={styles.container}>
          <h2>Find Us</h2>
          <div className={styles.mapContainer}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3910.218211803648!2d76.10274677481764!3d13.00730421409085!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bbf16f9c8c0a2f5%3A0x123456789abcdef!2sHassan%2C%20Karnataka%2C%20India!5e0!3m2!1sen!2sin!4v1693942400000!5m2!1sen!2sin"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Map"
            ></iframe>
          </div>
        </div>
      </section>

    </main>
  );
};

export default Home;
