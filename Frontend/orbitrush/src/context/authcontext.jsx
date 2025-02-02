'use client';

import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from 'jwt-decode';
import { Login, Register } from '@/lib/auth';
import { LOGIN_URL, REGISTER_URL } from '@/config';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useWebSocket } from "@/context/websocketcontext";

export const AuthContext = createContext();
export const useAuth = () => {
  return useContext(AuthContext);
};

// ========== AuthProvider ==========
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("accessToken")) || 
             JSON.parse(sessionStorage.getItem("accessToken")) || "";
    }
    return "";
  });
  const [decodedToken, setDecodedToken] = useState(null);

  // ----- Otros Hooks -----
  const { connectWebSocket, closeWebSocket } = useWebSocket();
  const router = useRouter();

  // ----- Decodificación del Token cuando cambia -----
  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      setDecodedToken(decoded);
    }
  }, [token]);

  // ----- Conexión del WebSocket cuando el token y su decodificación están disponibles -----
  useEffect(() => {
    if (token && decodedToken && decodedToken.id) {
      connectWebSocket(decodedToken.id);
    }
  }, [token, decodedToken, connectWebSocket]);

  // ----- Manejo del Login -----
  const handleLogin = async (data, rememberMe) => {
    try {
      const respuesta = await Login(LOGIN_URL, data);
      const username = await saveToken(respuesta.accessToken, rememberMe);
      router.push('/menu');
      toast.success(`¡Bienvenid@, ${username}!`);
    } catch (error) {
      toast.error(error.message || "Ocurrió un error al iniciar sesión");
      throw error;
    }
  };

  // ----- Manejo del Registro -----
  const handleRegister = async (data) => {
    try {
      const respuesta = await Register(REGISTER_URL, data);
      await saveToken(respuesta.accessToken);
      router.push('/menu');
      toast.success(`Registro exitoso, bienvenid@, ${respuesta.username}!`);
    } catch (error) {
      toast.error(error.message || "Ocurrió un error al registrarse");
      throw error;
    }
  };

  // ----- Guardar el Token y Actualizar Estados -----
  const saveToken = (newToken, rememberMe) => {
    if (rememberMe) {
      localStorage.setItem("accessToken", JSON.stringify(newToken));
    } else {
      sessionStorage.setItem("accessToken", JSON.stringify(newToken));
    }
  
    window.dispatchEvent(new Event("storage"));
  
    const decoded = jwtDecode(newToken);
    setToken(newToken);
    setDecodedToken(decoded);
  
    return decoded.name;
  };

  // ----- Logout -----
  const logout = () => {
    const username = decodedToken ? decodedToken.name : "Usuario";
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
        border: '2px solid rgba(255, 140, 0)',
        boxShadow: '0 0 10px rgba(255, 140, 0, 1), 0 0 15px rgba(255, 140, 0, 0.6)',
      }}>
        ¡Vuelve pronto, {username}!
      </div>
    );
  };

  // ----- Valor del Contexto y Renderizado -----
  const contextValue = {
    token,
    decodedToken,
    setDecodedToken,
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
