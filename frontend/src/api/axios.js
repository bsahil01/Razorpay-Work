import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:7002",
    withCredentials: true,
});

export default api;