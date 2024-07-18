import { defer } from "react-router-dom";
import apiRequests from "../lib/apiRequests";


export const singlePageLoader = async ({request, params}) => {
    const res = await apiRequests("/posts/" + params.id);
    console.log(res.data)
    return res.data;
}

export const listPageLoader = async ({request, params}) => {
    const query = request.url.split("?")[1]
    const postPromise = apiRequests("/posts?" + query);
    return defer({
        postResponse: postPromise
    });
}

export const profilePageLoader = async () => {
    console.log("profile page loader")
    const postPromise = apiRequests("/users/profilePosts");
    const chatPromise = apiRequests("/chats");
    return defer({
        postResponse: postPromise,
        chatResponse: chatPromise,
    });
}