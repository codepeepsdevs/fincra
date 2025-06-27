import axios from "axios";
import Cookies from "js-cookie";
import useUserStore from "@/store/user.store";

const api = process.env.NEXT_PUBLIC_BACKEND_API;
const apiKey = process.env.NEXT_PUBLIC_BACKEND_API_KEY;

export const client = axios.create({
  baseURL: `${api}`,
  headers: {
    "x-api-key": apiKey,
  },
});

client.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (useUserStore.getState().isLoggedIn && error.response?.status === 401) {
      const logout = useUserStore.getState().logout;
      removeHeaderToken();

      logout();

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const request = ({ ...options }) => {
  const token = Cookies.get("accessToken");
  if (token) {
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
  client.defaults.withCredentials = true;
  return client(options);
};

export const removeHeaderToken = (): void => {
  delete client.defaults.headers.common["Authorization"];
};
