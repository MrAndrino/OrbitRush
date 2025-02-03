"use client";
import React, { useState } from 'react';
import Button from '../miscelaneus/button/button';
import { useAuth } from '@/context/authcontext';
import { toast } from 'react-hot-toast';

function RegisterForm() {
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const { handleRegister } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error("Por favor, ingresa un apodo.");
      return;
    }

    if (!email.trim()) {
      toast.error("Por favor, ingresa un email.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor, ingresa un email válido.");
      return;
    }

    if (!password.trim()) {
      toast.error("Por favor, ingresa una contraseña.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    const data = new FormData();
    data.append("name", username);
    data.append("email", email);
    data.append("password", password);

    if (profileImage) {
      data.append("image", profileImage);
    }

    handleRegister(data, rememberMe);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4" noValidate>
      <section className="flex gap-8 justify-center items-center">
        <div className="flex flex-col items-center">
          <label
            htmlFor="profileImage"
            className="cursor-pointer w-24 h-24 relative rounded-full overflow-hidden border-2 border-[rgba(255,140,0,0.7)] bg-[rgba(255,140,0,0.2)] hover:bg-[rgba(255,140,0,0.7)] flex justify-center items-center"
          >
            {profileImage ? (
              <img
                src={URL.createObjectURL(profileImage)}
                alt="Imagen de perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">+</span>
            )}
            <input
              type="file"
              id="profileImage"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute opacity-0 inset-0 w-full h-full cursor-pointer"
            />
          </label>
          <p className="text-center font-secondary">Imagen de perfil <br /> (opcional)</p>
        </div>
        <section className="flex flex-col gap-4">
          <div>
            <label htmlFor="username">Apodo: </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-style form-container register"
            />
          </div>
          <div>
            <label htmlFor="email">Email: </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-style form-container register"
            />
          </div>
          <div>
            <label htmlFor="password">Contraseña: </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-style form-container register"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword">Confirmar: </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-style form-container register"
            />
          </div>
        </section>
      </section>
      <div className='flex justify-center items-center gap-1'>
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)} />
          <label htmlFor="rememberMe">Recuérdame</label>
        </div>
      <Button color="orange" type="submit" className="p-2 w-48 self-center">
        Regístrate
      </Button>
    </form>
  );
}

export default RegisterForm;
