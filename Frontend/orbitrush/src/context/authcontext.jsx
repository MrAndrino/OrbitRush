'use client'

import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from 'jwt-decode';
import { Login, Register } from '@/lib/auth';
import { LOGIN_URL, REGISTER_URL } from '@/config';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export const AuthContext = createContext();
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState('');
  const [decodedToken, setDecodedToken] = useState(null);
  const router = useRouter();

  const handleLogin = async (data) => {
    try {
      const respuesta = await Login(LOGIN_URL, data);

      const username = await saveToken(respuesta.accessToken);
      router.push('/menu');
      toast.success(`¡Bienvenido, ${username}!`);

    } catch (error) {
      toast.error(error.message || "Ocurrió un error al iniciar sesión");
      throw error;
    }
  };

  const handleRegister = async (data) => {
    try {
      const respuesta = await Register(REGISTER_URL, data);

      const username = await saveToken(respuesta.accessToken);
      router.push('/menu');
      toast.success(`Registro exitoso, bienvenido, ${username}!`);

    } catch (error) {
      toast.error(error.message || "Ocurrió un error al registrarse");
      throw error;
    }
  };

  const saveToken = async (newToken) => {
    localStorage.setItem("accessToken", JSON.stringify(newToken));
    setToken(newToken);
    const decoded = jwtDecode(newToken);
    setDecodedToken(decoded);
    return decoded.name;
  };

  const contextValue = {
    token,
    saveToken,
    handleLogin,
    handleRegister
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};