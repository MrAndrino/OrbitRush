'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from 'jwt-decode';
import { Login, Register } from '@/lib/auth';
import { LOGIN_URL, REGISTER_URL } from '@/config';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useWebSocket } from "@/context/websocketcontext"

export const AuthContext = createContext();
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("accessToken")) || "";
    }
    return "";
  });

  const [decodedToken, setDecodedToken] = useState(() => {
    if (token) return jwtDecode(token);
    return null;
  });

  const { connectWebSocket, closeWebSocket } = useWebSocket();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      setDecodedToken(decoded);
      connectWebSocket(decodedToken?.id);
    }
  }, [token]);


  const handleLogin = async (data, rememberMe) => {
    try {
      const respuesta = await Login(LOGIN_URL, data);
      await connectWebSocket(decodedToken?.id);
      const username = await saveToken(respuesta.accessToken, rememberMe);
      router.push('/menu');
      toast.success(`¡Bienvenid@, ${username}!`);
    } catch (error) {
      toast.error(error.message || "Ocurrió un error al iniciar sesión");
      throw error;
    }
  };

  const handleRegister = async (data) => {
    try {
      const respuesta = await Register(REGISTER_URL, data);
      await connectWebSocket(decodedToken?.id);
      const username = await saveToken(respuesta.accessToken, rememberMe);
      router.push('/menu');
      toast.success(`Registro exitoso, bienvenid@, ${username}!`);
    } catch (error) {
      toast.error(error.message || "Ocurrió un error al registrarse");
      throw error;
    }
  };

  const saveToken = async (newToken, rememberMe) => {
    if (rememberMe) {
      localStorage.setItem("accessToken", JSON.stringify(newToken));
    } else {
      sessionStorage.setItem("accessToken", JSON.stringify(newToken));
    }
    setToken(newToken);
    const decoded = jwtDecode(newToken);
    setDecodedToken(decoded);
    return decoded.name;
  };

  const logout = () => {
    const username = decodedToken?.name || "Usuario";
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
    setToken(null);
    setDecodedToken(null);
    closeWebSocket();
    router.push('/login/');
    toast.custom(
      <div style={{
        backgroundColor: 'var(--backgroundtoast)',
        color: 'var(--foreground)',
        fontSize: '16px',
        borderRadius: '8px',
        padding: '10px 20px',
        border: '2px solid rgb(0, 153, 255)',
        boxShadow: '0 0 10px rgba(0, 153, 255, 1), 0 0 15px rgba(0, 153, 255, 0.6)',
      }}>
        ¡Vuelve pronto, {username}!
      </div>
    );
  };

  const contextValue = {
    token,
    decodedToken,
    saveToken,
    logout,
    handleLogin,
    handleRegister
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};