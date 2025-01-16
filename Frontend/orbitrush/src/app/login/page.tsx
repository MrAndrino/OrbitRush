"use client";

import React from 'react';
import LoginForm from '@/components/login-register/loginForm';
import RegisterForm from '@/components/login-register/registerForm';
function AuthPage() {
  const handleLogin = (data: { usernameOrEmail: string; password: string }) => {
    console.log('Login Data:', data);
    // Aquí iría la lógica para manejar el login
  };

  const handleRegister = (data: {
    profileImage: File | null;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    console.log('Register Data:', data);
    // Aquí iría la lógica para manejar el registro
  };

  return (
    <div>
      <h1>Autenticación</h1>
      <h2>Iniciar Sesión</h2>
      <LoginForm onSubmit={handleLogin} />
      <h2>Registrarse</h2>
      <RegisterForm onSubmit={handleRegister} />
    </div>
  );
}

export default AuthPage;
