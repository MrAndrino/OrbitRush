export async function Login(url, request) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request)
  });

  if (!response.ok){
    throw new Error("Credenciales erróneas");
  }

  const data = await response.json();

  return data;
}


export async function Register(request) {
  const response = await fetch(REGISTER_URL, {
    method: "POST",
    body: request
  });

  if (!response.ok){
    throw new Error("Credenciales erróneas");
  }

  const data = await response.json();

  return data;
}