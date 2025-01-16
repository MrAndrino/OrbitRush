"use client";
import React, { useState } from 'react';
import Button from '../button/button';

type LoginFormProps = {
  onSubmit: (data: { usernameOrEmail: string; password: string }) => void;
};

function LoginForm({ onSubmit }: LoginFormProps) {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ usernameOrEmail, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="usernameOrEmail">Apodo o Email:</label>
        <input
          type="text"
          id="usernameOrEmail"
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Contraseña:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button color="blue" type="submit" className='p-2'>
        Iniciar Sesión
      </Button>
    </form>
  );
}

export default LoginForm;