export async function getFriendRequests(url, token) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error("Error al obtener las solicitudes de amistad");
  }
  
  return await response.json();
}

export async function rejectFriendRequest(url, token, senderId) {
  const response = await fetch(`${url}?senderId=${senderId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error("Error al rechazar la solicitud de amistad");
  }
  
  return await response.json();
}