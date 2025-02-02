import { createContext, useContext, useState, useEffect } from "react";
import { GET_REQUEST_URL, DELETE_REQUEST_URL } from "../config";
import { getFriendRequests, rejectFriendRequest } from "../api/friendRequestsApi";

export const FriendRequestsContext = createContext();
export const useRequest = () => {
  return useContext(FriendRequestsContext);
};

export function FriendRequestsProvider({ children, token }) {
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchRequests() {
      setLoading(true);
      try {
        const requests = await getFriendRequests(GET_REQUEST_URL, token);
        setFriendRequests(requests);
      } catch (error) {
        console.error("Error fetching friend requests:", error);
      }
      setLoading(false);
    }
    
    fetchRequests();
  }, [token]);

  async function handleRejectRequest(senderId) {
    try {
      await rejectFriendRequest(DELETE_REQUEST_URL, token, senderId);
      setFriendRequests(prevRequests => prevRequests.filter(req => req.senderId !== senderId));
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  }

  return (
    <FriendRequestsContext.Provider value={{ friendRequests, loading, handleRejectRequest }}>
      {children}
    </FriendRequestsContext.Provider>
  );
}

export function useFriendRequests() {
  return useContext(FriendRequestsContext);
}
