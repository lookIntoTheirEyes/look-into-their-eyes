import React from "react";
import styles from "./AccessibilityStatement.module.css";

const AccessibilityStatement: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Accessibility Statement</h1>
      <p className={styles.paragraph}>
        <b>look-into-their-eyes</b> strives to ensure that its digital services
        are accessible to people with disabilities. <b>look-into-their-eyes</b>{" "}
        has invested significant resources to help ensure access for all users,
        including people with disabilities, with the strong belief that every
        person has the right to live with dignity, equality, comfort, and
        independence.
      </p>
      <p className={styles.paragraph}>
        Digital accessibility is not just a target we aim to achieve, but an
        ongoing commitment that we carry in every aspect of our digital service
        delivery. We recognize that this requires continuous monitoring,
        improvement, and adaptation. In the sections below, we elaborate on the
        various efforts that have been undertaken to address our progress in
        ensuring digital accessibility for all.
      </p>
      <p className={styles.paragraph}>
        A key element of our accessibility initiative is our engagement with a
        third-party accessibility consulting organization UserWay to help bring
        the website into conformance. We use industry standard accessibility
        methods and tools to accomplish this, in accordance with the relevant
        version of{" "}
        <a
          className={styles.link}
          href='https://www.w3.org/TR/WCAG21/'
          title='Web Content Accessibility Guidelines'
          rel='nofollow'
        >
          Web Content Accessibility Guidelines (WCAG)
        </a>{" "}
        as set forth by the World Wide Web Consortium (W3C), the internet’s main
        international standards-setting organization.
      </p>
      <h2 className={styles.subTitle}>Please Contact Us</h2>
      <p className={styles.paragraph}>
        We are here to assist you and make your experience as smooth and
        inclusive as possible. If you encounter any digital accessibility issues
        with our products or services, or need information related to digital
        accessibility, we want to hear from you! Also, we appreciate and welcome
        feedback, and we are always ready to embrace suggestions for enhancing
        our digital accessibility efforts.
      </p>
      <p className={styles.contactHeader}>Contact Information:</p>
      <ul className={styles.list}>
        <li>look-into-their-eyes</li>
        <li>
          Email:{" "}
          <a
            className={styles.link}
            href='mailto:look.into.their.eyes.0710@gmail.com'
            rel='nofollow'
          >
            look.into.their.eyes.0710@gmail.com
          </a>
        </li>
      </ul>
      <p className={styles.paragraph}>
        We take accessibility seriously and will get back to you shortly.
      </p>
    </div>
  );
};

export default AccessibilityStatement;
