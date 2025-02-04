export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export const API_BASE_URL = `${BASE_URL}/api`

//Login y Registro
export const LOGIN_URL = `${API_BASE_URL}/Auth/login`
export const REGISTER_URL = `${API_BASE_URL}/Auth/register`

//Friend Requests
export const GET_REQUEST_URL = `${API_BASE_URL}/FriendRequest/getrequests`
export const DELETE_REQUEST_URL = `${API_BASE_URL}/FriendRequest/deleterequests`

//Lista de Users
export const FRIENDLIST_URL = `${API_BASE_URL}/User/friendlist`
export const USERLIST_URL = `${API_BASE_URL}/User/userlist`
export const DELETE_FRIEND_URL = `${API_BASE_URL}/UserFriend/deletefriend`
export const SEARCH_URL = `${API_BASE_URL}/User/search`

//Perfiles de usuarios
export const SELF_PROFILE_URL = `${API_BASE_URL}/User/selfprofile`
export const USER_PROFILE_URL = `${API_BASE_URL}/User/userprofile`