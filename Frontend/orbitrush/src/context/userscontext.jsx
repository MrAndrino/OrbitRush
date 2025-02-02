'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { FRIENDLIST_URL, USERLIST_URL, SEARCH_URL, DELETE_FRIEND_URL } from "@/config";
import { getFriendList, getUserList, searchUsers, deleteFriend } from "@/lib/users";
import { useWebSocket } from "./websocketcontext";

export const UsersContext = createContext();
export const useUsers = () => useContext(UsersContext);

export const UsersProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const { ws } = useWebSocket();

  useEffect(() => {
    const loadToken = () => {
      const storedToken = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
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

  const [friendList, setFriendList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [includeFriends, setIncludeFriends] = useState(false);

  const mapState = (stateValue) => {
    switch (stateValue) {
      case 0:
        return "Disconnected";
      case 1:
        return "Connected";
      case 2:
        return "Playing";
      default:
        return "Disconnected";
    }
  };

  const getFriends = async () => {
    if (!token) {
      console.log("No hay token disponible");
      return;
    }
    try {
      const respuesta = await getFriendList(FRIENDLIST_URL, token);
      const friendsWithState = respuesta.map(friend => ({
        ...friend,
        state: mapState(friend.state)
      }));
      setFriendList(friendsWithState);
    } catch (error) {
      console.error("Error al obtener la lista de amigos:", error);
    }
  };

  const getUsers = async () => {
    if (!token) {
      console.log("No hay token disponible");
      return;
    }
    try {
      const respuesta = await getUserList(USERLIST_URL, token);
      const usersWithState = respuesta.map(user => ({
        ...user,
        state: mapState(user.state)
      }));
      setUserList(usersWithState);
    } catch (error) {
      console.error("Error al obtener la lista de usuarios:", error);
    }
  };

  const search = async () => {
    if (!token) {
      console.log("No hay token disponible");
      return;
    }
    try {
      const respuesta = await searchUsers(SEARCH_URL, token, searchTerm, includeFriends);
      setSearchResults(respuesta);
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
    }
  };

  const removeFriend = async (friendId) => {
    if (!token) {
      console.log("No hay token disponible");
      return;
    }
    try {
      await deleteFriend(DELETE_FRIEND_URL, token, friendId);
      setFriendList((prevList) => prevList.filter((friend) => friend.id !== friendId));
    } catch (error) {
      console.error("Error al eliminar amigo:", error);
    }
  };

  const updateFriendState = (userId, newState) => {
    setFriendList((prevList) =>
      prevList.map((friend) =>
        friend.id === userId ? { ...friend, state: newState } : friend))
  }

  useEffect(() => {
    if (!ws) return;
    const handleMessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.Action === "userStateChanged") {
        updateFriendState(data.userId, data.State);
      }
    }
    ws.addEventListener("message", handleMessage);

    return () => {
      ws.removeEventListener("message", handleMessage);
    };
  }, [ws]);

  useEffect(() => {
    if (token) {
      console.log("Token disponible, cargando listas...");
      getFriends();
      getUsers();
    }
  }, [token]);

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
  };

  return (
    <UsersContext.Provider value={contextValue}>
      {children}
    </UsersContext.Provider>
  );
};
