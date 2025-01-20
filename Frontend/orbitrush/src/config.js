const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_BASE_URL = `${BASE_URL}/api`

//Login y Registro
export const LOGIN_URL = `${API_BASE_URL}/Auth/login`
export const REGISTER_URL = `${API_BASE_URL}/Auth/register`