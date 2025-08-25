import { connection } from "../database/connect.js";
import bcrypt from 'bcrypt';

export const getUserProfile = (req, res) => {
    console.log("Fetching user profile for user ID:", req.user.userId);
    try {
        const userId = req.user.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const query = "SELECT id, name, email, role FROM users WHERE id = ? AND is_deleted = 0";
        connection.query(query, [userId], (error, results) => {
            if (error) {
                console.error("Error fetching user profile:", error);
                return res.status(500).json({ message: "Database error" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }
            const user = results[0];
            return res.status(200).json({
                userId: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            });
        });
    } catch (error) {
        console.error("Error in getUserProfile:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, email, password } = req.body;
        if (!userId || !name || !email) {
            return res.status(400).json({ message: "User ID, name, and email are required" });
        }

        let hashedPassword;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const query =
            "UPDATE users SET name = ?, email = ?" +
            (hashedPassword ? ", password = ?" : "") +
            " WHERE id = ? AND is_deleted = 0";

        const params = [name, email];
        if (hashedPassword) {
            params.push(hashedPassword);
        }
        params.push(userId);

        connection.query(query, params, (error, results) => {
            if (error) {
                console.error("Error updating user profile:", error);
                return res.status(500).json({ message: "Database error" });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "User not found or already deleted" });
            }
            return res.status(200).json({ message: "User profile updated successfully" });
        });
    } catch (error) {
        console.error("Error in updateUserProfile:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateUserProfileById = async (req, res) => {
    try {
        const {userId} = req.params;
        const { name, email, role } = req.body;
        if (!userId || !name || !email || !role) {
            return res.status(400).json({ message: "User ID, name, role and email are required" });
        }

        const query =
            "UPDATE users SET name = ?, email = ?, role = ?" +
            " WHERE id = ? AND is_deleted = 0";

        const params = [name, email, role];
        params.push(userId);

        connection.query(query, params, (error, results) => {
            if (error) {
                console.error("Error updating user profile:", error);
                return res.status(500).json({ message: "Database error" });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "User not found or already deleted" });
            }
            return res.status(200).json({ message: "User profile updated successfully" });
        });
    } catch (error) {
        console.error("Error in updateUserProfile:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteUserProfile = (req, res) => {
    try {
        const userId = req.user.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const query = "UPDATE users SET is_deleted = 1 WHERE id = ?";
        connection.query(query, [userId], (error, results) => {
            if (error) {
                console.error("Error soft-deleting user profile:", error);
                return res.status(500).json({ message: "Database error" });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "User not found or already deleted" });
            }
            return res.status(200).json({ message: "User profile deleted successfully (soft delete)" });
        });
    } catch (error) {
        console.error("Error in deleteUserProfile:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getUserProfileById = (req, res) => {
    try {
        const userId = req.params.id;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const query = "SELECT id, name, email FROM users WHERE id = ? AND is_deleted = 0";
        connection.query(query, [userId], (error, results) => {
            if (error) {
                console.error("Error fetching user profile by ID:", error);
                return res.status(500).json({ message: "Database error" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }
            const user = results[0];
            return res.status(200).json({
                userId: user.id,
                name: user.name,
                email: user.email
            });
        });
    } catch (error) {
        console.error("Error in getUserProfileById:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const query = `
            SELECT 
                u.id,
                u.name,
                u.email,
                u.role,
                COUNT(CASE WHEN o.status = 'paid' THEN 1 END) AS paidOrders,
                COUNT(CASE WHEN o.status = 'pending' THEN 1 END) AS unpaidOrders
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_Id
            WHERE u.is_deleted = 0
            GROUP BY u.id, u.name, u.email
        `;

        connection.query(query, (error, results) => {
            if (error) {
                console.error("Error fetching users:", error);
                return res.status(500).json({ message: "Database error" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "No users found" });
            }
            return res.status(200).json({ users: results });
        });
    } catch (error) {
        console.error("Error in getAllUsers:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteUserProfileById = (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const query = "UPDATE users SET is_deleted = 1 WHERE id = ?";
        connection.query(query, [id], (error, results) => {
            if (error) {
                console.error("Error soft-deleting user profile by ID:", error);
                return res.status(500).json({ message: "Database error" });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "User not found or already deleted" });
            }
            return res.status(200).json({ message: "User profile deleted successfully (soft delete)" });
        });
    } catch (error) {
        console.error("Error in deleteUserProfileById:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
