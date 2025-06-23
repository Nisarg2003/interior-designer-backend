import userModel from "../Model/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = async(req,res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
        return res.status(400).send({ message: "All fields are required" });
        }
    
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
        return res.status(400).send({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
    
        const newUser = new userModel({ name, email, password : hashedPassword });
        await newUser.save();
    
        return res.status(201).send({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).send({ message: "Error registering user" });
    }
}

export const loginUser = async(req,res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({ message: "All fields are required" });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send({ message: "Invalid password" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return res.status(200).send({ message: "Login successful", token });

    } catch (error) {
        console.error("Error logging in user:", error);
        return res.status(500).send({ message: "Error logging in user" });
    }
}