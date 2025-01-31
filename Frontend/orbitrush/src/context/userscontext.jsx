'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./authcontext";
import { FRIENDLIST_URL, USERLIST_URL, SEARCH_URL, DELETE_FRIEND_URL } from "@/config";
import { getFriendList, getUserList, searchUsers, deleteFriend } from "@/lib/users";

export const UsersContext = createContext();
export const useUsers = () => useContext(UsersContext);

export const UsersProvider = ({ children }) => {
  const { token } = useAuth();

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
    try {
      const respuesta = await searchUsers(SEARCH_URL, token, searchTerm, includeFriends);
      setSearchResults(respuesta);
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
    }
  };

  const removeFriend = async (friendId) => {
    try {
      await deleteFriend(DELETE_FRIEND_URL, token, friendId);
      setFriendList((prevList) => prevList.filter((friend) => friend.id !== friendId));
    } catch (error) {
      console.error("Error al eliminar amigo:", error);
    }
  };

  useEffect(() => {
    if (token) getFriends();
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
