'use client'

import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from 'jwt-decode'
import { Login , Register } from '@/api/auth/route'
import { LOGIN_URL , REGISTER_URL } from '@/config'


export const AuthContext = createContext();
export const useAuth = () => {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState('');
  const [decodedToken, setDecodedToken] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {},[])

  const handleLogin = async(data) => {
    try {
      const respuesta = await Login(LOGIN_URL, data);

      saveToken(respuesta.accessToken)

    } catch (error) {
      setMessage(`Error: ${error.message}`);
      throw error;
    }
  }

  const handleRegister = async(data) => {
    try {
      const respuesta = await Register(REGISTER_URL, data);
      
      saveToken(respuesta.accessToken)

    } catch (error) {
      setMessage(`Error: ${error.message}`);
      throw error;
    }
  }

  const saveToken = (newToken) =>{
    localStorage.setItem("accessToken", JSON.stringify(newToken));
    setToken(newToken);
    setDecodedToken(jwtDecode(newToken));
  }

  const contextValue = {
    token,
    saveToken,
    handleLogin,
    handleRegister
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}