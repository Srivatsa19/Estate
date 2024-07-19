import { Server } from "socket.io";

const io = new Server({
    cors: {
        // origin: "http://localhost:5173",
        origin: "https://estate-front-indol.vercel.app",
        methods: ["GET", "POST"],
        credentials: true
    },
})

let onlineUser = []

const addUser = (userId, socketId) => {
    const userExists = onlineUser.find(user => user.userId === userId);
    if (!userExists) {
        onlineUser.push({userId, socketId});
    }
}

const removeUser = (socketId) => {
    onlineUser = onlineUser.filter((user) => user.socketId !== socketId)
}

const getUser = (userId) => {
    return onlineUser.find((user) => user.userId === userId);
}

io.on("connection", (socket) => {
    socket.on("newUser", (userId) => {
        addUser(userId, socket.id);
        console.log(onlineUser)
    })
    socket.on("sendMessage", ({receiverId, data}) => {
        const receiver = getUser(receiverId)
        io.to(receiver.socketId).emit("getMessage", data);
    })
    socket.on("disconnect", () => {
        removeUser(socket.id);
    })
})

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://estate-front-indol.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

io.listen("4000");