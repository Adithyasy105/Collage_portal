import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styles from "../styles/Home.module.css";
import Navbar from "../components/Navbar";
import { createAdmissionApi } from "../api/admissionAPI.js";
import { createContactApi } from "../api/contactAPI.js";
import {
  FaGraduationCap,
  FaUsers,
  FaAward,
  FaBuilding,
  FaTools,
  FaLaptopCode,
  FaIndustry,
  FaWrench,
  FaCertificate,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";

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
  {
    title: "CNC Operator",
    description: "Master Computer Numerical Control (CNC) machinery for precision manufacturing.",
    icon: <FaIndustry />,
    duration: "1 Year",
  },
  {
    title: "Industrial Fitter",
    description: "Expert training in assembling and maintaining industrial machinery and systems.",
    icon: <FaTools />,
    duration: "1 Year",
  },
  {
    title: "Welding Technology",
    description: "Hands-on experience with advanced welding techniques and safety protocols.",
    icon: <FaWrench />,
    duration: "1 Year",
  },
  {
    title: "Software Development",
    description: "Foundational and advanced skills in modern programming and software engineering.",
    icon: <FaLaptopCode />,
    duration: "2 Years",
  },
  {
    title: "Electrical & Power Systems",
    description: "Comprehensive course on electrical wiring, power generation, and distribution networks.",
    icon: <FaBuilding />,
    duration: "2 Years",
  },
  {
    title: "Automotive Technician",
    description: "A practical course covering engine diagnostics, repair, and vehicle maintenance.",
    icon: <FaTools />,
    duration: "1 Year",
  },
];

const facilitiesData = [
  {
    title: "Modern Laboratories",
    description: "State-of-the-art equipment and technology for hands-on learning",
    icon: <FaBuilding />,
  },
  {
    title: "Experienced Faculty",
    description: "Industry experts and certified instructors with years of experience",
    icon: <FaUsers />,
  },
  {
    title: "Industry Partnerships",
    description: "Strong ties with leading companies for internships and placements",
    icon: <FaIndustry />,
  },
  {
    title: "Certification Programs",
    description: "Recognized certifications that enhance your career prospects",
    icon: <FaCertificate />,
  },
];

const statsData = [
  { number: "500+", label: "Students Enrolled", icon: <FaGraduationCap /> },
  { number: "50+", label: "Expert Faculty", icon: <FaUsers /> },
  { number: "15+", label: "Years Experience", icon: <FaAward /> },
  { number: "95%", label: "Placement Rate", icon: <FaCheckCircle /> },
];

const Home = () => {
  const location = useLocation();
  const [admissionForm, setAdmissionForm] = useState({
    name: "",
    email: "",
    phone: "",
    course: "",
  });
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [admissionMessage, setAdmissionMessage] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  useEffect(() => {
    if (location.state?.scrollTarget) {
      const section = document.getElementById(location.state.scrollTarget);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

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

    const sections = document.querySelectorAll(`[data-section]`);
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Navbar />
      </header>

      {/* Hero Section */}
      <section id="home" className={styles.hero}>
        <video className={styles.heroVideo} src="/COLLAGE_VIDEO.mp4" autoPlay loop muted playsInline></video>
        <div className={styles.overlay}></div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Umacahgi ITI, Hassan</h1>
          <p className={styles.heroSubtitle}>
            Empowering the future with <strong>quality technical education</strong>
            <br /> through innovation, skill, and industry excellence.
          </p>
          <div className={styles.heroButtons}>
            <a href="#admission" className={styles.ctaBtnPrimary}>
              Apply for Admission
            </a>
            <a href="#courses" className={styles.ctaBtnSecondary}>
              Explore Courses
            </a>
          </div>
        </div>
        <div className={styles.scrollIndicator}>
          <span>Scroll Down</span>
          <div className={styles.scrollArrow}></div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className={`${styles.statsSection} ${styles.section}`} data-section>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {statsData.map((stat, index) => (
              <div key={index} className={styles.statCard}>
                <div className={styles.statIcon}>{stat.icon}</div>
                <div className={styles.statNumber}>{stat.number}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className={`${styles.about} ${styles.section}`} data-section>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>About Our Institute</h2>
            <p className={styles.subtitle}>
              A premier technical education institute committed to excellence and innovation
            </p>
          </div>
          <div className={styles.visionMissionGrid}>
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <FaAward />
              </div>
              <h3>Our Vision</h3>
              <p>
                To be a premier institution of technical education, empowering students with practical skills and knowledge to become industry-ready professionals.
              </p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <FaGraduationCap />
              </div>
              <h3>Our Mission</h3>
              <p>
                To provide quality technical education through innovative teaching methods, state-of-the-art facilities, and industry-relevant curriculum that prepares students for successful careers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className={`${styles.courses} ${styles.section}`} data-section>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Courses We Offer</h2>
            <p className={styles.subtitle}>
              Industry-relevant programs designed to shape your technical career
            </p>
          </div>
          <div className={styles.coursesGrid}>
            {coursesData.map((course, index) => (
              <article key={course.title} className={styles.courseCard}>
                <div className={styles.courseIcon}>{course.icon}</div>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className={styles.courseDuration}>
                  <FaClock /> {course.duration}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className={`${styles.facilities} ${styles.section}`} data-section>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Why Choose Us</h2>
            <p className={styles.subtitle}>
              Excellence in technical education with modern infrastructure and industry partnerships
            </p>
          </div>
          <div className={styles.facilitiesGrid}>
            {facilitiesData.map((facility, index) => (
              <div key={index} className={styles.facilityCard}>
                <div className={styles.facilityIcon}>{facility.icon}</div>
                <h3>{facility.title}</h3>
                <p>{facility.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section id="leadership" className={`${styles.leadership} ${styles.section}`} data-section>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Our Leadership</h2>
            <p className={styles.subtitle}>
              Experienced leaders dedicated to your success
            </p>
          </div>
          <div className={styles.leadershipGrid}>
            {leadershipData.map(({ name, title, bio, img }) => (
              <article key={name} className={styles.leaderCard}>
                <div className={styles.leaderImgContainer}>
                  <img src={img} alt={`${name}, ${title}`} className={styles.leaderImg} loading="lazy" />
                </div>
                <h3>{name}</h3>
                <p className={styles.leaderTitle}>{title}</p>
                <p className={styles.leaderBio}>{bio}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Admission Section */}
      <section id="admission" className={`${styles.admission} ${styles.section}`} data-section>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Apply for Admission</h2>
            <p className={styles.subtitle}>
              Start your journey towards a successful technical career
            </p>
          </div>
          {admissionMessage && (
            <p
              className={
                admissionMessage.type === "success" ? styles.successMsg : styles.errorMsg
              }
            >
              {admissionMessage.text}
            </p>
          )}
          <form className={styles.form} onSubmit={handleAdmissionSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="admission-name">Full Name</label>
              <input
                type="text"
                id="admission-name"
                placeholder="Enter your full name"
                value={admissionForm.name}
                onChange={(e) => setAdmissionForm({ ...admissionForm, name: e.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="admission-email">Email Address</label>
              <input
                type="email"
                id="admission-email"
                placeholder="you@example.com"
                value={admissionForm.email}
                onChange={(e) => setAdmissionForm({ ...admissionForm, email: e.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="admission-phone">Phone Number</label>
              <input
                type="tel"
                id="admission-phone"
                placeholder="+91 98765 43210"
                value={admissionForm.phone}
                onChange={(e) => setAdmissionForm({ ...admissionForm, phone: e.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="admission-course">Course of Interest</label>
              <select
                id="admission-course"
                value={admissionForm.course}
                onChange={(e) => setAdmissionForm({ ...admissionForm, course: e.target.value })}
                required
              >
                <option value="" disabled>Select a course</option>
                {coursesData.map(({ title }) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className={styles.submitBtn}>
              Submit Admission Form
            </button>
          </form>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className={`${styles.contact} ${styles.section}`} data-section>
        <div className={styles.container}>
          <div className={styles.contactGrid}>
            <div className={styles.contactInfo}>
              <h2>Get in Touch</h2>
              <p className={styles.contactDescription}>
                Have questions? We're here to help! Reach out to us through any of the following channels.
              </p>
              <div className={styles.contactDetails}>
                <div className={styles.contactItem}>
                  <FaMapMarkerAlt className={styles.contactIcon} />
                  <div>
                    <h4>Address</h4>
                    <p>Umacahgi ITI, Hassan<br />Karnataka, India</p>
                  </div>
                </div>
                <div className={styles.contactItem}>
                  <FaPhone className={styles.contactIcon} />
                  <div>
                    <h4>Phone</h4>
                    <p>+91 98765 43210</p>
                  </div>
                </div>
                <div className={styles.contactItem}>
                  <FaEnvelope className={styles.contactIcon} />
                  <div>
                    <h4>Email</h4>
                    <p>info@umacahgiiti.ac.in</p>
                  </div>
                </div>
                <div className={styles.contactItem}>
                  <FaClock className={styles.contactIcon} />
                  <div>
                    <h4>Working Hours</h4>
                    <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.contactFormContainer}>
              <h3>Send us a Message</h3>
              {contactMessage && (
                <p
                  className={
                    contactMessage.type === "success" ? styles.successMsg : styles.errorMsg
                  }
                >
                  {contactMessage.text}
                </p>
              )}
              <form className={styles.form} onSubmit={handleContactSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="contact-name">Your Name</label>
                  <input
                    type="text"
                    id="contact-name"
                    placeholder="Enter your name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="contact-email">Email Address</label>
                  <input
                    type="email"
                    id="contact-email"
                    placeholder="you@example.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    rows="5"
                    placeholder="Write your message here..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                  ></textarea>
                </div>

                <button type="submit" className={styles.submitBtn}>
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section id="map" className={`${styles.mapSection} ${styles.section}`} data-section>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Find Us</h2>
            <p className={styles.subtitle}>
              Visit our campus in Hassan, Karnataka
            </p>
          </div>
          <div className={styles.mapContainer}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3910.218211803648!2d76.10274677481764!3d13.00730421409085!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bbf16f9c8c0a2f5%3A0x123456789abcdef!2sHassan%2C%20Karnataka%2C%20India!5e0!3m2!1sen!2sin!4v1693942400000!5m2!1sen!2sin"
              width="100%"
              height="450"
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
