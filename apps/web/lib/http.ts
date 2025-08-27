import axios from "axios";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const http = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalize common API error shapes into a single Error(message)
    const status = error?.response?.status;
    const data = error?.response?.data;

    let message = "Request failed";

    if (data) {
      if (typeof data === "string") {
        message = data;
      } else if (typeof data?.message === "string") {
        message = data.message;
      } else if (Array.isArray(data?.message)) {
        // class-validator ValidationPipe often returns string[] in message
        message = data.message.join("; ");
      } else if (data?.error) {
        message = String(data.error);
      }
    } else if (error?.message) {
      message = error.message;
    }

    if (status === 401) message = message || "Unauthorized";
    if (status === 403) message = message || "Forbidden";
    if (status === 404) message = message || "Not found";

    return Promise.reject(new Error(message));
  },
);
