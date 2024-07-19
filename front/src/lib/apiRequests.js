import axios from "axios";

const apiRequests = axios.create({
    // baseURL: "http://localhost:5000/api",
    baseURL: "https://estate-api-1kk8.onrender.com/api",
    withCredentials: true
})

export default apiRequests