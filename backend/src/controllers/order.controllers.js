import { connection } from "../database/connect.js";
import util from "util";

const query = util.promisify(connection.query).bind(connection);

// 🔹 Create Order
export const createOrder = async (req, res) => {

  const userId = req.user?.userId;
  console.log('creating order for, ', req.user?.userId)
  if (!userId) return res.status(400).json({ error: "User ID is required" });

  try {
    // Start transaction
    console.log('asdad')
    await query("START TRANSACTION");
    
    // Step 1: Get user's cart
    const cart = await query("SELECT id FROM carts WHERE user_id = ?", [userId]);
    if (cart.length === 0) {
      return res.status(404).json({ error: "Cart not found" });
    }
    const cartId = cart[0].id;
    console.log(cartId)
    // Step 2: Get cart items
    const cartItems = await query(
      `SELECT ci.product_id, ci.quantity, p.price, p.stock_quantity
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = ?`,
      [cartId]
    );
    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }
    console.log(cartItems)
    // Step 3: Check stock availability
    for (const item of cartItems) {
      if (item.quantity > item.stock_quantity) {
        await query("ROLLBACK");
        return res.status(400).json({ 
          error: `Not enough stock for product ${item.product_id}` 
        });
      }
    }

    // Step 4: Calculate total
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Step 5: Create order
    const orderResult = await query(
      "INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, 'pending')",
      [userId, totalAmount]
    );
    const orderId = orderResult.insertId;

    // Step 6: Insert order items
    const orderItemsValues = cartItems.map(item => [
      orderId,
      item.product_id,
      item.quantity,
      item.price,
    ]);
    await query(
      "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?",
      [orderItemsValues]
    );

    // Step 7: Update stock
    for (const item of cartItems) {
      await query(
        "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
        [item.quantity, item.product_id]
      );
    }

    // Step 8: Clear cart
    await query("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);

    // Commit transaction
    await query("COMMIT");

    return res.status(201).json({
      message: "Order created successfully",
      orderId,
      totalAmount,
    });
  } catch (err) {
    await query("ROLLBACK"); // rollback on error
    console.error("Error creating order:", err);
    return res.status(500).json({ error: "Database error" });
  }
};

// 🔹 Get User Orders
export const getUserOrders = async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(400).json({ error: "User ID is required" });

  try {
    const orders = await query(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    return res.status(200).json({ orders });
  } catch (err) {
    console.error("Error fetching orders:", err);
    return res.status(500).json({ error: "Database error" });
  }
};

// 🔹 Get Order Details
export const getOrderDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const orders = await query("SELECT * FROM orders WHERE id = ?", [id]);
    if (orders.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    const order = orders[0];

    const items = await query(
      `SELECT oi.product_id, oi.quantity, oi.price, p.name 
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    );

    order.items = items;
    return res.status(200).json(order);
  } catch (err) {
    console.error("Error fetching order details:", err);
    return res.status(500).json({ error: "Database error" });
  }
};

// 🔹 Update Order Status (Admin)
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ["pending", "paid", "shipped", "delivered", "cancelled"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const result = await query("UPDATE orders SET status = ? WHERE id = ?", [
      status,
      id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    return res.status(200).json({ message: "Order status updated successfully" });
  } catch (err) {
    console.error("Error updating order status:", err);
    return res.status(500).json({ error: "Database error" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
        const query = `SELECT * FROM orders WHERE status='pending'`;

        connection.query(query, (error, results) => {
            if (error) {
                console.error("Error fetching orders:", error);
                return res.status(500).json({ message: "Database error" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "No orders found" });
            }
            return res.status(200).json({ orders: results });
        });
    } catch (error) {
        console.error("Error in getAllOrders:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getAllPaidOrdersWithPayments = async (req, res) => {
  try {
    const query = `
      SELECT 
        o.id AS order_id,
        o.total_amount,
        o.status,
        o.user_id,
        o.CREATED_AT,
        p.session_id,
        p.payment_intent_id,
        p.provider
      FROM orders o
      JOIN payments p ON o.id = p.order_id
      WHERE o.status = 'paid'
      ORDER BY o.id DESC
    `;

    connection.query(query, (error, results) => {
      if (error) {
        console.error("Error fetching paid orders and payments:", error);
        return res.status(500).json({ message: "Database error" });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "No paid orders found" });
      }
      return res.status(200).json({ orders: results });
    });
  } catch (error) {
    console.error("Error in getAllPaidOrdersWithPayments:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
