"use client";
import React, { useState, useEffect } from "react";
import LoginForm from "@/components/login-register/loginForm";
import RegisterForm from "@/components/login-register/registerForm";
import styles from "@/components/login-register/login-register.module.css";
import Line from "../line/line";

function AuthPage() {
  const [showLogin, setShowLogin] = useState(true);
  const [renderLogin, setRenderLogin] = useState(true);
  const [renderRegister, setRenderRegister] = useState(false);

  useEffect(() => {
    if (showLogin) {
      setRenderLogin(true);
      setTimeout(() => setRenderRegister(false), 500); // Tiempo de la transición
    } else {
      setRenderRegister(true);
      setTimeout(() => setRenderLogin(false), 500); // Tiempo de la transición
    }
  }, [showLogin]);

  const handleLogin = (data: { usernameOrEmail: string; password: string }) => {
    console.log("Login Data:", data);
  };

  const handleRegister = (data: {
    profileImage: File | string | null;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    console.log("Register Data:", data);
  };

  return (
    <div
      className={`${styles["auth-container"]} ${showLogin ? styles["login"] : styles["register"]
        }`}
    >
      {/* Botón Inicia Sesión */}
      <button
        onClick={() => setShowLogin(true)}
        className={`${styles["auth-button"]} ${styles["login"]
          } ${showLogin ? styles["active"] : ""}`}
      >
        Inicia Sesión
      </button>

      {/* Formulario Login */}
      <div
        className={`${styles["form-container"]} ${showLogin ? styles["active"] : ""
          }`}
      >
        {renderLogin && <LoginForm onSubmit={handleLogin} />}
      </div>

        <Line />

      {/* Botón Regístrate */}
      <button
        onClick={() => setShowLogin(false)}
        className={`${styles["auth-button"]} ${styles["register"]
          } ${!showLogin ? styles["active"] : ""}`}
      >
        Regístrate
      </button>

      {/* Formulario Register */}
      <div
        className={`${styles["form-container"]} ${!showLogin ? styles["active"] : ""
          }`}
      >
        {renderRegister && <RegisterForm onSubmit={handleRegister} />}
      </div>
    </div>
  );
}

export default AuthPage;
