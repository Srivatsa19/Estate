import prisma from "../lib/prisma.js";

export const addMessage = async (req, res) => {
    const tokenUserId = req.userId;
    const chatId = req.params.chatId;
    const text = req.body.text;
    try {
        const Chat = await prisma.chat.findUnique({
            where: {
                id: chatId,
                userIds: {
                    hasSome: [tokenUserId],
                }
            },
        })
        if (!Chat) return res.status(404).json({ message: "Chat not found" })
        const msg = await prisma.message.create({
            data: {
                text,
                chatId,
                userId: tokenUserId,
            }
        })
        await prisma.chat.update({
            where: {
                id: chatId
            },
            data: {
                seenBy: [tokenUserId],
                lastMessage: text,
            }
        })
        res.status(200).json(msg)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Failed to add messages" });
    }
}