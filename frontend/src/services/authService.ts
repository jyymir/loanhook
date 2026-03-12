const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const AUTH_API_URL = `${API_BASE_URL}/api/auth`;

export interface AuthResponse {
  token?: string;
  message?: string;
  error?: string;
  user?: {
    fullName?: string;
    email?: string;
  };
}

export const signup = async (fullName: string, email: string, password: string) => {
  try {
    const response = await fetch(`${AUTH_API_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ fullName, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || data.error || "Signup failed" };
    }

    return data;
  } catch (error) {
    console.error("Signup Error:", error);
    return { error: "Could not connect to backend." };
  }
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${AUTH_API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || data.error || "Login failed" };
    }

    return data;
  } catch (error) {
    console.error("Login Error:", error);
    return { error: "Could not connect to backend." };
  }
};

export const loginAsGuest = async () => {
  try {
    const response = await fetch(`${AUTH_API_URL}/guest-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || data.error || "Guest login failed" };
    }

    return data;
  } catch (error) {
    console.error("Guest Login Error:", error);
    return { error: "Could not connect to backend." };
  }
};