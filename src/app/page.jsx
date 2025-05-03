"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import FaceEnrollmentPage from "./signup/page";
import { FaceVerificationPage } from "./signin/page";
import SignupPage from "./signup/page";
import LoginPage from "./signin/page";

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);

  // Charger le mode depuis localStorage au montage
  useEffect(() => {
    const storedMode = localStorage.getItem('darkMode');
    if (storedMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Mettre à jour localStorage et <html> à chaque changement
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <div>
    </div>
  );
}
