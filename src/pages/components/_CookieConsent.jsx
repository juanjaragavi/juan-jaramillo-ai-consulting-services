// CookieConsent.jsx
import React, { useState, useEffect } from "react";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "true");
    setIsVisible(false);
  };

  const declineCookies = () => {
    setIsVisible(false);
    setTimeout(() => {
      window.history.back();
    }, 100);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex flex-col items-center justify-between sm:flex-row">
        <p className="mb-4 text-sm sm:mb-0">
          We use cookies on this website. Please indicate whether or not you
          accept our use of cookies. For more information read our{" "}
          <a
            href="/cookie-policy"
            className="text-blue-300 underline hover:text-blue-100"
          >
            Cookie Policy
          </a>
          .
        </p>
        <div className="flex space-x-4">
          <button
            onClick={acceptCookies}
            className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600"
          >
            Accept
          </button>
          <button
            onClick={declineCookies}
            className="rounded bg-gray-500 px-4 py-2 font-bold text-white hover:bg-gray-600"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
