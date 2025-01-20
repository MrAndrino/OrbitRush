"use client";
import React, { useState } from 'react';
import Button from '../button/button';
import { useAuth } from '@/context/authcontext';

function LoginForm() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");

  const { handleLogin } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
        nameLabel: usernameOrEmail,
        password: password
    }

    handleLogin(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="usernameOrEmail">Apodo o Email: </label>
        <input
          type="text"
          id="usernameOrEmail"
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Contraseña: </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button color="blue" type="submit" className='p-2 m-8'>
        Iniciar Sesión
      </Button>
    </form>
  );
}

export default LoginForm;