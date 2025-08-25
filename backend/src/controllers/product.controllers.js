import { connection } from "../database/connect.js";
import util from "util";

// Promisify MySQL queries for async/await
const query = util.promisify(connection.query).bind(connection);

// 🔹 Add Product
export const addProduct = async (req, res) => {
  try {
    const { name, description, price, stock, categoryId } = req.body;

    if (!name || !price || !stock || !categoryId) {
      return res.status(400).json({ error: "Name, price, stock, and category ID are required" });
    }

    // Check if category exists
    const category = await query("SELECT id FROM categories WHERE id = ?", [categoryId]);
    if (category.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Insert product
    const result = await query(
      "INSERT INTO products (name, description, price, stock_quantity, category_id, is_deleted) VALUES (?, ?, ?, ?, ?, 0)",
      [name, description, price, stock, categoryId]
    );

    return res.status(201).json({
      message: "Product added successfully",
      productId: result.insertId,
    });
  } catch (err) {
    console.error("Error adding product:", err);
    return res.status(500).json({ error: "Database error" });
  }
};

// 🔹 Get Product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Product ID is required" });

    const product = await query("SELECT * FROM products WHERE id = ? AND is_deleted = 0", [id]);

    if (product.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json(product[0]);
  } catch (err) {
    console.error("Error fetching product:", err);
    return res.status(500).json({ error: "Database error" });
  }
};

// 🔹 Update Product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, categoryId } = req.body;

    if (!id || !name || !price || !stock || !categoryId) {
      return res.status(400).json({ error: "Product ID, name, price, stock, and category ID are required" });
    }

    // Ensure category exists
    const category = await query("SELECT id FROM categories WHERE id = ?", [categoryId]);
    if (category.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    const result = await query(
      "UPDATE products SET name = ?, description = ?, price = ?, stock_quantity = ?, category_id = ? WHERE id = ? AND is_deleted = 0",
      [name, description, price, stock, categoryId, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found or was deleted" });
    }

    return res.status(200).json({ message: "Product updated successfully" });
  } catch (err) {
    console.error("Error updating product:", err);
    return res.status(500).json({ error: "Database error" });
  }
};

// 🔹 Soft Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Product ID is required" });

    // Mark product as deleted instead of removing
    const result = await query("UPDATE products SET is_deleted = 1 WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json({ message: "Product marked as deleted" });
  } catch (err) {
    console.error("Error deleting product:", err);
    return res.status(500).json({ error: "Database error" });
  }
};

// 🔹 Get All Products
export const getAllProducts = async (req, res) => {
  try {
    const products = await query("SELECT * FROM products WHERE is_deleted = 0");
    return res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    return res.status(500).json({ error: "Database error" });
  }
};

// 🔹 Get Products by Category
export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!categoryId) return res.status(400).json({ error: "Category ID is required" });

    const products = await query("SELECT * FROM products WHERE category_id = ? AND is_deleted = 0", [categoryId]);

    if (products.length === 0) {
      return res.status(200).json({ message: "No products found for this category" });
    }

    return res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products by category:", err);
    return res.status(500).json({ error: "Database error" });
  }
};
