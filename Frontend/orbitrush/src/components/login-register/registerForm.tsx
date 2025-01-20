"use client";
import React, { useState } from 'react';
import Button from '../button/button';
import { useAuth } from '@/context/authcontext';

function RegisterForm() {
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { handleRegister } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    const data = new FormData();
    data.append("name", username)
    data.append("email", email)
    data.append("password", password)

    if (profileImage) {
      data.append("image", profileImage)
    }

    handleRegister(data);
  };



  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label
          htmlFor="profileImage"
          className="flex justify-center items-center cursor-pointer w-24 h-24 text-white relative m-auto rounded-full overflow-hidden border-2 border-custom-orange mb-2"
        >
          {profileImage ? (
            <img
              src={URL.createObjectURL(profileImage)}
              alt="Imagen de perfil"
              className='w-full h-full object-cover'
            />
          ) : (
            <span className="text-3xl text-custom-orange">+</span>
          )}
          <input
            type="file"
            id="profileImage"
            accept="image/*"
            onChange={handleImageChange}
            className="absolute opacity-0 w-full h-full cursor-pointer"
          />
        </label>
        <p className=' mb-4 font-secondary text-center'>Imagen de perfil (opcional)</p>
      </div>
      <div>
        <label htmlFor="username">Apodo: </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="email">Email: </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
      <div>
        <label htmlFor="confirmPassword">Confirmar: </label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <Button color="orange" type="submit" className='p-2 m-8 w-48'>
        Registrarse
      </Button>
    </form>
  )
}

export default RegisterForm;