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
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 z-50">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
        <p className="text-sm mb-4 sm:mb-0">
          We use cookies on this website. Please indicate whether or not you
          accept our use of cookies. For more information read our{" "}
          <a
            href="/cookie-policy"
            className="text-blue-300 hover:text-blue-100 underline"
          >
            Cookie Policy
          </a>
          .
        </p>
        <div className="flex space-x-4">
          <button
            onClick={acceptCookies}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Accept
          </button>
          <button
            onClick={declineCookies}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
