"use client";
import React, { useState } from 'react';
import Button from '../button/button';

type RegisterFormProps = {
  onSubmit: (data: {
    profileImage: File | string | null;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => void;
};

function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    const imageToSubmit = profileImage || "/images/OrbitRush-TrashCan.jpg";

    onSubmit({
      profileImage: imageToSubmit,
      username,
      email,
      password,
      confirmPassword,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  return (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="profileImage">Imagen de perfil (opcional):</label>
            <input
              type="file"
              id="profileImage"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          <div>
            <label htmlFor="username">Apodo:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <div>
            <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button color="orange" type="submit" className='p-2'>
            Registrarse
          </Button>
        </form>
      )}

export default RegisterForm;