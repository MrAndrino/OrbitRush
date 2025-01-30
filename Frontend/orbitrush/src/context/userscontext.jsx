'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./authcontext";
import { FRIENDLIST_URL } from "@/config";
import { getFriendList } from "@/lib/users"

export const UsersContext = createContext();
export const useUsers = () => {
  return useContext(UsersContext);
};

export const UsersProvider = ({ children }) => {

  const { token } = useAuth();
  const { friendList, setFriendList } = useState(null);
  const { userList, setUserList } = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    getFriends();
  }, [token]);

  const getFriends = async () => {
    try {
      const respuesta = await getFriendList(FRIENDLIST_URL, token);
      setFriendList(respuesta);
    } catch (error) {
      console.error("Error al obtener la lista", error);
    }
  }

  const getUsers = async () => {
    try {
      const respuesta = await getUserList(USERLIST_URL, token);
      setUserList(respuesta);
    } catch (error) {
      console.error("Error al obtener la lista", error);
    }
  }

  const search = async () => {
    try {
      const respuesta = await searchUsers(USER_SEARCH_URL, token, searchTerm, includeFriends);
      setSearchResults(respuesta);
    } catch (error) {
      console.error("Error al buscar usuarios", error);
    }
  }

  const removeFriend = async (friendId) => {
    try {
      await deleteFriend(DELETE_FRIEND_URL, token, friendId);
      setFriendList((prevList) => prevList.filter((friend) => friend.id !== friendId));
    } catch (error) {
      console.error("Error al eliminar amigo", error);
    }
  };

  const contextValue = {
    friendList,
    userList,
    searchResults,
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