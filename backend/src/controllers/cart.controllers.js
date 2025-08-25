import { connection } from "../database/connect.js";
import util from "util";

// Promisify connection.query for async/await
const query = util.promisify(connection.query).bind(connection);

// 🔹 Helper: Get or create a cart for a user
const getOrCreateCart = async (userId) => {
  const cart = await query("SELECT id FROM carts WHERE user_id = ?", [userId]);
  if (cart.length > 0) return cart[0].id;

  const result = await query("INSERT INTO carts (user_id) VALUES (?)", [userId]);
  return result.insertId;
};

// 🔹 Add to Cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { productId, quantity } = req.body;

    if (!userId || !productId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: "Valid userId, productId and quantity are required" });
    }

    const cartId = await getOrCreateCart(userId);

    const cartItemQuery = `
      INSERT INTO cart_items (cart_id, product_id, quantity)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
    `;
    await query(cartItemQuery, [cartId, productId, quantity]);

    return res.status(200).json({ message: "Item added to cart successfully" });
  } catch (err) {
    console.error("Error adding to cart:", err);
    return res.status(500).json({ error: "Database error" });
  }
};

// 🔹 Remove from Cart
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { productId } = req.params;

    if (!userId || !productId) {
      return res.status(400).json({ error: "Valid userId and productId are required" });
    }

    const cart = await query("SELECT id FROM carts WHERE user_id = ?", [userId]);
    if (cart.length === 0) return res.status(404).json({ error: "Cart not found for user" });

    const cartId = cart[0].id;

    const items = await query("SELECT quantity FROM cart_items WHERE cart_id = ? AND product_id = ?", [cartId, productId]);
    if (items.length === 0) return res.status(404).json({ error: "Product not in cart" });

    const currentQty = items[0].quantity;

    if (currentQty > 1) {
      await query("UPDATE cart_items SET quantity = quantity - 1 WHERE cart_id = ? AND product_id = ?", [cartId, productId]);
      return res.status(200).json({ message: "Item quantity decremented by 1" });
    } else {
      await query("DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?", [cartId, productId]);
      return res.status(200).json({ message: "Item removed from cart" });
    }
  } catch (err) {
    console.error("Error removing from cart:", err);
    return res.status(500).json({ error: "Database error" });
  }
};

// 🔹 Get Cart Items
export const getCartItems = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const cart = await query("SELECT id FROM carts WHERE user_id = ?", [userId]);
    if (cart.length === 0) return res.status(404).json({ error: "Cart not found for user" });

    const cartId = cart[0].id;

    const items = await query(`
      SELECT 
        ci.product_id, 
        ci.quantity, 
        p.name AS product_name, 
        p.price 
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `, [cartId]);

    return res.status(200).json({
      cartId,
      totalItems: items.length,
      items
    });
  } catch (err) {
    console.error("Error fetching cart items:", err);
    return res.status(500).json({ error: "Database error" });
  }
};

// 🔹 Clear Cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const cart = await query("SELECT id FROM carts WHERE user_id = ?", [userId]);
    if (cart.length === 0) return res.status(404).json({ error: "Cart not found for user" });

    const cartId = cart[0].id;
    await query("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);

    return res.status(200).json({ message: "Cart cleared successfully" });
  } catch (err) {
    console.error("Error clearing cart:", err);
    return res.status(500).json({ error: "Database error" });
  }
};
