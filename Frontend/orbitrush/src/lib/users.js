export async function getFriendList(url, token) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Error al obtener la lista de amigos");
  }

  const data = await response.json();
  return data;
}


export async function getUserList(url, token) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("No hay usuarios");
    }
    throw new Error("Error al obtener la lista de usuarios");
  }

  const data = await response.json();
  return data;
}


export async function searchUsers(url, token, search, includeFriends) {
  const queryParams = new URLSearchParams({ search, includeFriends });
  const response = await fetch(`${url}?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Error al buscar usuarios");
  }

  const data = await response.json();
  return data;
}


export async function deleteFriend(url, token, friendId) {
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(friendId)
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("No se ha encontrado el amigo");
    }
    throw new Error("Error al eliminar el amigo");
  }
}