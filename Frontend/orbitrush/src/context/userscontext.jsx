'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { FRIENDLIST_URL, USERLIST_URL, SEARCH_URL, DELETE_FRIEND_URL, GET_REQUEST_URL, DELETE_REQUEST_URL } from "@/config";
import { getFriendList, getUserList, searchUsers, deleteFriend } from "@/lib/users";
import { getFriendRequests, rejectFriendRequest } from "@/lib/request";
import { useAuth } from "./authcontext";
import { useWebSocket } from "./websocketcontext";

export const UsersContext = createContext();
export const useUsers = () => useContext(UsersContext);

export const UsersProvider = ({ children }) => {

  // ========== Estados de Autenticación y Token ==========
  const [token, setToken] = useState(null);
  const { token: authToken } = useAuth();
  const { ws } = useWebSocket();

  // ========== Estados de Listas y Parámetros ==========
  const [friendList, setFriendList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [includeFriends, setIncludeFriends] = useState(false);

  // ========== Estados de Solicitudes de Amistad ==========
  const [friendRequests, setFriendRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

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

  // ========== Funciones de API ==========

  // ----- Obtener lista de amigos -----
  const getFriends = async () => {
    if (!token) return;
    try {
      const response = await getFriendList(FRIENDLIST_URL, token);
      setFriendList(response.map(friend => ({ ...friend, state: mapState(friend.state) })));
    } catch (error) {
      console.error("Error al obtener la lista de amigos:", error);
    }
  };

  // ----- Obtener lista de usuarios -----
  const getUsers = async () => {
    if (!token) return;
    try {
      const response = await getUserList(USERLIST_URL, token);
      setUserList(response.map(user => ({ ...user, state: mapState(user.state) })));
    } catch (error) {
      console.error("Error al obtener la lista de usuarios:", error);
    }
  };

  // ----- Buscar usuarios -----
  const search = async () => {
    if (!token) return;
    try {
      const response = await searchUsers(SEARCH_URL, token, searchTerm, includeFriends);
      setSearchResults(response);
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
    }
  };

  // ----- Eliminar amigo -----
  const removeFriend = async (friendId) => {
    if (!token) return;
    try {
      await deleteFriend(DELETE_FRIEND_URL, token, friendId);
      setFriendList(prevList => prevList.filter(friend => friend.id !== friendId));
    } catch (error) {
      console.error("Error al eliminar amigo:", error);
    }
  };

  // // ----- Obtener solicitudes de amistad -----
  // useEffect(() => {
  //   if (!authToken) return;
  //   const fetchRequests = async () => {
  //     setLoadingRequests(true);
  //     try {
  //       const requests = await getFriendRequests(GET_REQUEST_URL, authToken);
  //       setFriendRequests(requests);
  //     } catch (error) {
  //       console.error("Error al obtener solicitudes de amistad:", error);
  //     }
  //     setLoadingRequests(false);
  //   };
  //   fetchRequests();
  // }, [authToken]);

  // ----- Rechazar solicitud de amistad -----
  const handleRejectRequest = async (senderId) => {
    if (!authToken) return;
    try {
      await rejectFriendRequest(DELETE_REQUEST_URL, authToken, senderId);
      setFriendRequests(prevRequests => prevRequests.filter(req => req.senderId !== senderId));
    } catch (error) {
      console.error("Error al rechazar solicitud de amistad:", error);
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
      const {friends} = event.detail;
      setFriendList(friends.map((friend)=> {
        ({id:friend.userId, state:friend.State})
      }))
    };

    window.addEventListener("updateFriendList", handleUpdateFriendList);

    return () => {
      window.removeEventListener("updateFriendList", handleUpdateFriendList);
    };
  }, []);


  // ========== Efecto para cargar listas al obtener el Token ==========
  useEffect(() => {
    if (token) {
      getFriends();
      getUsers();
    }
  }, [token]);

  // ========== Valor del Contexto y Renderizado ==========
  const contextValue = {
    friendList,
    userList,
    searchResults,
    searchTerm,
    includeFriends,
    setSearchTerm,
    setIncludeFriends,
    getFriends,
    getUsers,
    search,
    removeFriend,
    friendRequests,
    loadingRequests,
    handleRejectRequest
  };

  return (
    <UsersContext.Provider value={contextValue}>
      {children}
    </UsersContext.Provider>
  );
};