const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const api = {
  getUsers
};

async function getUsers(): Promise<UserDTO[]> {
  const httpResponse = await fetch(`${apiBaseUrl}/users`, { credentials: "include" });

  if (! httpResponse.ok) {
    throw new Error(`Failed request : ${httpResponse}`);
  }
  
  return await httpResponse.json();
}

export interface UserDTO {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}
