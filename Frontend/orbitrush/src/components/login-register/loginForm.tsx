"use client";
import React, { useState } from 'react';
import Button from '../miscelaneus/button/button';
import { useAuth } from '@/context/authcontext';
import { toast } from 'react-hot-toast';


function LoginForm() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const { handleLogin } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!usernameOrEmail.trim()) {
      toast.error("Por favor, ingresa un apodo o email.");
      return;
    }

    if (!password.trim()) {
      toast.error("Por favor, ingresa tu contraseña.");
      return;
    }

    const data = {
      nameLabel: usernameOrEmail,
      password: password
    }

    handleLogin(data, rememberMe);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <section className="flex flex-col gap-4">
        <div>
          <label htmlFor="usernameOrEmail">Apodo o Email: </label>
          <input
            type="text"
            id="usernameOrEmail"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña: </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className='flex justify-center items-center gap-1 select-none'>
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)} />
          <label htmlFor="rememberMe">Recuérdame</label>
        </div>
      </section>
      <Button color="blue" type="submit" className='p-2 m-8 w-48 self-center'>
        Inicia Sesión
      </Button>
    </form>
  );
}

export default LoginForm;