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

export async function getSelfProfile(url, token) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener tu perfil");
  }

  const data = await response.json();
  return data;
}

export async function getUserProfile(url, token, userId) {
  const response = await fetch(`${url}?id=${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener el perfil del usuario");
  }

  const data = await response.json();
  return data;
}

export async function updateUserProfile(url, token, formData) {
  const response = await fetch(url, {
    method: "PUT",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al modificar el perfil del usuario");
  }
  return { message: "Datos cambiados exitosamente" }
}

export async function getAllUsers(url, token) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener la lista de usuarios");
  }

  const data = await response.json();
  return data;
}

export async function updateUserRole(url, token, newRole) {
  const response = await fetch(url, {  // ✅ URL correcta sin newRole
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(newRole)  // ✅ Enviar el role en el body
  });

  if (!response.ok) {
    throw new Error("Error al actualizar el rol del usuario");
  }

  return await response.json();
}


export async function toggleBanUser(url, token) {
  const response = await fetch(url, {  // ✅ URL correcta sin "undefined"
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Error al cambiar el estado de baneo del usuario");
  }

  return await response.json();
}