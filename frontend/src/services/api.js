import axios from "axios";

const API = axios.create({
  baseURL: "https://ai-v2-1bue.onrender.com/"
});

export default API;