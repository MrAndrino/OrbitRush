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


export async function Register(url, request) {
  const response = await fetch(url, {
    method: "POST",
    body: request
  });

  if (!response.ok){
    throw new Error("Credenciales erróneas");
  }

  const data = await response.json();

  return data;
}