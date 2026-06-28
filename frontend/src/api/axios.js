import axios from "axios";

const api = axios.create({
    baseURL: "https://razorpay-work-production.up.railway.app",
    withCredentials: true,
});

export default api;