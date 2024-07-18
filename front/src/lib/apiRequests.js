import axios from "axios";

const apiRequests = axios.create({
    // baseURL: "http://localhost:5000/api",
    baseURL: "https://estate-api-phi.vercel.app",
    withCredentials: true
})

export default apiRequests