import { connection } from "../database/connect.js";

// ✅ Get category by ID
export const getCategoryById = (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ error: "Valid category ID is required" });
    }

    const query = "SELECT * FROM categories WHERE id = ?";
    connection.query(query, [id], (error, results) => {
        if (error) {
            console.error("Error fetching category:", error);
            return res.status(500).json({ error: "Database error" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Category not found" });
        }
        return res.status(200).json(results[0]);
    });
};

// ✅ Add category
export const addCategory = (req, res) => {
    const { name, description = null } = req.body;

    if (!name || name.trim() === "") {
        return res.status(400).json({ error: "Category name is required" });
    }

    const query = "INSERT INTO categories (name, description) VALUES (?, ?)";
    connection.query(query, [name.trim(), description], (error, results) => {
        if (error) {
            console.error("Error adding category:", error);
            return res.status(500).json({ error: "Database error" });
        }
        return res.status(201).json({
            message: "Category added successfully",
            categoryId: results.insertId,
        });
    });
};

// ✅ Update category (partial update allowed)
export const updateCategory = (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!id || isNaN(id)) {
        return res.status(400).json({ error: "Valid category ID is required" });
    }
    if (!name && !description) {
        return res.status(400).json({ error: "At least one field (name/description) is required" });
    }

    const query = "UPDATE categories SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?";
    connection.query(query, [name, description, id], (error, results) => {
        if (error) {
            console.error("Error updating category:", error);
            return res.status(500).json({ error: "Database error" });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Category not found" });
        }
        return res.status(200).json({ message: "Category updated successfully", categoryId: id });
    });
};

// ✅ Delete category
export const deleteCategory = (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ error: "Valid category ID is required" });
    }

    const query = "DELETE FROM categories WHERE id = ?";
    connection.query(query, [id], (error, results) => {
        if (error) {
            console.error("Error deleting category:", error);
            return res.status(500).json({ error: "Database error" });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Category not found" });
        }
        return res.status(200).json({ message: "Category deleted successfully", categoryId: id });
    });
};

// ✅ Get all categories
export const getAllCategories = (req, res) => {
    console.log('getting categories for user: ', req.user.userId);
    const query = `SELECT c.*, COUNT(p.id) AS total_products
    FROM categories c
    JOIN products p ON c.id = p.category_id
    GROUP BY c.id
    ORDER BY c.id DESC`; // latest first
    connection.query(query, (error, results) => {
        if (error) {
            console.error("Error fetching categories:", error);
            return res.status(500).json({ error: "Database error" });
        }
        console.log(results)
        return res.status(200).json(results);
    });
};
