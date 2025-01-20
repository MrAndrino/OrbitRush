'use client'

import { createContext, useContext, useState } from "react";
import { jwtDecode } from 'jwt-decode'
import { Login } from '@/api/auth/route'
import { LOGIN_URL } from '@/config'

export const AuthContext = createContext();
export const useAuth = () => {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState('');
  const [decodedToken, setDecodedToken] = useState(null);
  const [message, setMessage] = useState("");

  const handleLogin = async(data) => {
    try {
      const respuesta = await Login(LOGIN_URL, data);
      setToken(respuesta.accessToken);
      console.log(respuesta.accessToken);
      saveToken(token)

    } catch (error) {
      setMessage(`Error: ${error.message}`);
      throw error;
    }
  }

  const saveToken = (newToken) =>{
    localStorage.setItem("accessToken", JSON.stringify(newToken));
    setDecodedToken(jwtDecode(newToken));
  }

  const contextValue = {
    token,
    saveToken,
    handleLogin
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}