'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { FRIENDLIST_URL, USERLIST_URL, SEARCH_URL, GET_REQUEST_URL, DELETE_REQUEST_URL, SELF_PROFILE_URL, USER_PROFILE_URL, EDIT_PROFILE_URL, ALLLIST_URL, ROLE_URL, BANN_URL } from "@/config";
import { getFriendList, getUserList, searchUsers, getSelfProfile, getUserProfile, updateUserProfile, getAllUsers, updateUserRole, toggleBanUser } from "@/lib/users";
import { getFriendRequests, rejectFriendRequest } from "@/lib/request";
import { useAuth } from "@/context/authcontext";

export const UsersContext = createContext();
export const useUsers = () => useContext(UsersContext);

export const UsersProvider = ({ children }) => {

  // ========== Token ==========
  const [token, setToken] = useState(null);

  // ========== Estados de Listas y Parámetros ==========
  const [friendList, setFriendList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [includeFriends, setIncludeFriends] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  // ========== Estados de Solicitudes de Amistad y Perfiles ==========
  const [friendRequests, setFriendRequests] = useState([]);
  const [selfProfile, setSelfProfile] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const { logout } = useAuth();

  // ----- Función para mapear el estado del usuario -----
  const mapState = (stateValue) => {
    switch (stateValue) {
      case 0: return "Disconnected";
      case 1: return "Connected";
      case 2: return "Playing";
      default: return "Disconnected";
    }
  };

  // ========== Carga del Token ==========
  useEffect(() => {
    const loadToken = () => {
      const storedToken = sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");
      if (storedToken) {
        setToken(JSON.parse(storedToken));
      }
    };

    loadToken();
    window.addEventListener("storage", loadToken);
    return () => {
      window.removeEventListener("storage", loadToken);
    };
  }, []);

  // ----- Obtener lista de amigos -----
  const getFriends = async () => {
    try {
      const response = await getFriendList(FRIENDLIST_URL, token);
      setFriendList(response.map(friend => ({ ...friend, state: mapState(friend.state) })));
    } catch (error) {
      console.error("Error al obtener la lista de amigos:", error);
    }
  };

  // ----- Obtener lista de usuarios -----
  const getUsers = async () => {
    try {
      const response = await getUserList(USERLIST_URL, token);
      setUserList(response.map(user => ({ ...user, state: mapState(user.state) })));
    } catch (error) {
      console.error("Error al obtener la lista de usuarios:", error);
    }
  };

  // ----- Obtener lista de TODOS los usuarios menos el usuario autenticado -----
  const getAllUsersList = async () => {
    try {
      const response = await getAllUsers(ALLLIST_URL, token);
      setAllUsers(response.map(user => ({ ...user, state: mapState(user.state) })));
    } catch (error) {
      console.error("Error al obtener la lista de todos los usuarios:", error);
    }
  };

  // ----- Cambiar el rol de un usuario -----
  const changeUserRole = async (userId, newRole) => {
    try {
      console.log("URL para actualizar rol:", ROLE_URL(userId));

      await updateUserRole(ROLE_URL(userId), token, newRole);
      await getAllUsersList();
    } catch (error) {
      console.error("Error al actualizar el rol del usuario:", error);
    }
  };

  // ----- Banear o desbanear un usuario -----
  const banUnbanUser = async (userId) => {
    try {
      await toggleBanUser(BANN_URL(userId), token);
      await getAllUsersList();
    } catch (error) {
      console.error("Error al cambiar el estado de baneo del usuario:", error);
    }
  };

  // ----- Actualizar lista de amigos -----
  const updateFriendState = (userId, newState) => {
    setFriendList((prevList) => {
      const updatedList = prevList.map((friend) =>
        friend.id === parseInt(userId) ? { ...friend, state: newState } : friend
      );
      return updatedList;
    });
  };

  // ----- Buscar usuarios -----
  const search = async () => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }
    try {
      const response = await searchUsers(SEARCH_URL, token, searchTerm, includeFriends);
      const mappedResults = response.map(user => ({
        ...user, state: mapState(user.state)
      }));
      setSearchResults(mappedResults);
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
    }
  };

  // ----- Obtener lista de solicitudes de amistad -----
  const getFriendReq = async () => {
    try {
      const requests = await getFriendRequests(GET_REQUEST_URL, token);
      console.log("requests:", requests)
      setFriendRequests(requests);
    } catch (error) {
      console.error("Error al obtener solicitudes de amistad:", error);
    }
  };

  // ----- Rechazar solicitud de amistad -----
  const handleRejectFriend = async (senderId) => {
    try {
      await rejectFriendRequest(DELETE_REQUEST_URL, token, senderId);
      setFriendRequests(prevRequests => prevRequests.filter(req => req.senderId !== senderId));
    } catch (error) {
      console.error("Error al rechazar solicitud de amistad:", error);
    }
  };

  // ----- Obtener el perfil propio -----
  const getSelfProfileData = async () => {
    try {
      const profile = await getSelfProfile(SELF_PROFILE_URL, token);
      setSelfProfile(profile);
    } catch (error) {
      console.error("No se pudo cargar tu perfil.");
    }
  };

  // ----- Obtener el perfil de otro usuario -----
  const getUserProfileData = async (userId) => {
    try {
      const profile = await getUserProfile(USER_PROFILE_URL, token, userId);
      setUserProfile(profile);
      return profile;
    } catch (error) {
      console.error("No se pudo cargar el perfil del usuario.");
    }
  };

  // ----- Actualizar el perfil del usuario -----
  const updateUserProfileData = async (formData) => {
    if (!token) {
      console.error("No se encontró el token de autenticación.");
      return;
    }

    try {
      const response = await updateUserProfile(EDIT_PROFILE_URL, token, formData);
      console.log(response.message);
      await getSelfProfileData();
      logout();
    } catch (error) {
      console.error("Error al actualizar el perfil del usuario:", error);
    }
  };


  // ----- Efecto para actualizar notificaciones a tiempo real -----
  useEffect(() => {
    const handleFriendReq = (event) => {
      getFriendReq()
    };

    window.addEventListener("friendRequestReceived", handleFriendReq);

    return () => {
      window.removeEventListener("friendRequestReceived", handleFriendReq);
    };
  }, [getFriendReq]);

  // ----- Efectos para actualizar lista de amigos a tiempo real -----
  useEffect(() => {
    const handleFriendStateUpdate = (event) => {
      const { userId, newState } = event.detail;
      if (userId && newState) {
        updateFriendState(userId, newState);
      }
    };

    window.addEventListener("friendStateUpdate", handleFriendStateUpdate);

    return () => {
      window.removeEventListener("friendStateUpdate", handleFriendStateUpdate);
    };
  }, []);

  useEffect(() => {
    const handleUpdateFriendList = (event) => {
      getFriends()
    };

    window.addEventListener("updateFriendList", handleUpdateFriendList);
    window.addEventListener("acceptFriendRequest", handleUpdateFriendList);
    window.addEventListener("deleteFriend", handleUpdateFriendList);

    return () => {
      window.removeEventListener("updateFriendList", handleUpdateFriendList);
      window.removeEventListener("acceptFriendRequest", handleUpdateFriendList);
      window.removeEventListener("deleteFriend", handleUpdateFriendList);
    };
  }, [getFriends]);


  // ========== Efecto para cargar listas al obtener el Token ==========
  useEffect(() => {
    if (token) {
      getFriends();
      getFriendReq();
    }
  }, [token]);

  // ========== Valor del Contexto y Renderizado ==========
  const contextValue = {
    friendList,
    userList,
    allUsers,
    getAllUsersList,
    searchResults,
    searchTerm,
    includeFriends,
    setSearchTerm,
    setIncludeFriends,
    getFriends,
    getUsers,
    search,
    friendRequests,
    handleRejectFriend,
    getFriendReq,
    getSelfProfileData,
    getUserProfileData,
    updateUserProfileData,
    changeUserRole,
    banUnbanUser,
    selfProfile,
    userProfile
  };

  return (
    <UsersContext.Provider value={contextValue}>
      {children}
    </UsersContext.Provider>
  );
};