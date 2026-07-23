"use client";
import React, { useState } from 'react';

export default function MaintenanceClient() {
  const [copied, setCopied] = useState(false);

  const handleEmailClick = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText("anuragstudy24@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
    window.location.href = "mailto:anuragstudy24@gmail.com";
  };

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      backgroundColor: "#000000",
      color: "#ededed",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      padding: "2rem",
      textAlign: "center"
    }}>
      <div style={{ maxWidth: "520px", width: "100%" }}>
        <h1 style={{
          fontSize: "2.5rem",
          fontWeight: 600,
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          color: "#ffffff",
          marginBottom: "1rem",
        }}>We'll be back tomorrow!</h1>
        
        <p style={{
          fontSize: "1.125rem",
          color: "#a1a1aa",
          lineHeight: 1.6,
          marginBottom: "2rem",
          fontWeight: 400
        }}>
          We're currently performing scheduled maintenance to improve your experience. We sincerely apologize for the delay and appreciate your patience.
        </p>

        <a
          href="mailto:anuragstudy24@gmail.com"
          onClick={handleEmailClick}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
            color: "#000000",
            textDecoration: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "6px",
            fontSize: "1rem",
            fontWeight: 500,
            transition: "opacity 0.2s ease",
            cursor: "pointer"
          }}
        >
          {copied ? "Email is copied!" : "Send Email"}
        </a>
      </div>
    </div>
  );
}
