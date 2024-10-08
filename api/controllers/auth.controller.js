import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken"

export const register = async (req, res) => {
    const {username, email, password} = req.body;
    try {
        const hashPassword = await bcrypt.hash(password, 10)
        const newUser = await prisma.user.create({
            data: {
                username, email, password: hashPassword,
            }
        })
        res.status(201).json({ message: "User created successfully" });
    }
    catch(err) {
        console.log(err);
        res.status(500).json({ message: "Failed to create the user" })
    }
}
export const login = async (req, res) => {
    const {username, password} = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: {username}
        })
        if (!user) return res.status(401).json({ message:"Invalid Credentials" })
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message:"Invalid Credentials" })
        const mage = 1000 * 60 * 60 * 24 * 7;
        const token = jwt.sign({
            id: user.id
        }, process.env.JWT_SECRET_KEY, { expiresIn: mage })
        const {password: userPassword, ...userInfo} = user
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: mage,
            secure: isProduction,
            sameSite: 'none'
        }).status(200).json(userInfo)
    }
    catch(err) {
        console.log(err)
        res.status(500).json({ message: "Failed to login" })
    }
}
export const logout = (req, res) => {
    res.clearCookie("token").status(200).json({ message: "Logout Succesful" })
}