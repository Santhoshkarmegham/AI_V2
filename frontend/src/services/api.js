import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "https://ai-v2-1bue.onrender.com";

const API = axios.create({
  baseURL,
});

export default API;