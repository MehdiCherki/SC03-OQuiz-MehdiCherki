const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const api = {
  getUsers,
  login,
};

async function getUsers(): Promise<UserDTO[]> {
  const httpResponse = await fetch(`${apiBaseUrl}/users`, { credentials: "include" });

  if (! httpResponse.ok) {
    throw new Error(`Failed request : ${httpResponse}`);
  }

  return await httpResponse.json();
}

async function login(email: string, password: string): Promise<void> {
  const httpResponse = await fetch(`${apiBaseUrl}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!httpResponse.ok) {
    throw new Error("Identifiants incorrects");
  }
}

export interface UserDTO {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}
