import { connection } from "../database/connect.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const generateAccessToken = (userId, username, email, role) => {
    console.log('generating access token')
    return jwt.sign({ userId, username, email, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION || '1d' });
}

export const registerUser = async (req, res) => {
    console.log("Registering user with data:", req.body);
    try {
        const { name, email, password } = req.body;
        const role = 'customer';
        if (!name.trim() || !email.trim() || !password || !role.trim()) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";;
        connection.query(query, [name, email, hashedPassword, role], (error, results) => {
            if (error) {
                console.error("Error inserting user:", error);
                return res.status(500).json({ message: "Database insertion error" });
            }
            return res.status(201).json({ message: "User registered successfully", userId: results.insertId });
        });
    } catch (error) {
        console.error("Error in registerUser:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const loginUser = async (req, res) => {
    console.log("Login attempt with data:", req.body);
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        
        const query = "SELECT * FROM users WHERE email = ?";
        connection.query(query, [email], async (error, results) => {
            if (error) {
                console.error("Error fetching user:", error);
                return res.status(500).json({ message: "Database error" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }
            const user = results[0];
            
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid credentials" });
            }
            
            const accessToken = generateAccessToken(user.id, user.name, user.email, user.role);
            if(accessToken) console.log('Token generated!')
            res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
            console.log("User logged in successfully:", user.id);
            return res.status(200).json({ message: "Login successful", userId: user.id });
        });
    } catch (error) {
        console.error("Error in loginUser:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const logoutUser = (req, res) => {
    console.log("Logging out user...");
    try {
        res.clearCookie('accessToken');
        return res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Error in logoutUser:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const registerUserAsAdmin = async (req, res) => {
    console.log("Registering user with data:", req.body);
    try {
        const role = 'admin';
        const { username, email, password } = req.body;
        if (!username.trim() || !email.trim() || !password || !role.trim()) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";;
        connection.query(query, [username, email, hashedPassword, role], (error, results) => {
            if (error) {
                console.error("Error inserting user:", error);
                return res.status(500).json({ message: "Database insertion error" });
            }
            return res.status(201).json({ message: "User registered successfully", userId: results.insertId });
        });
    } catch (error) {
        console.error("Error in registerUser:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
