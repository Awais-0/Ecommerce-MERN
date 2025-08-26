import { connection } from "../database/connect.js";

/**
 * 📌 1. Overall Stats (cards at top of dashboard)
 * - total users
 * - total products
 * - pending orders
 * - total income
 * - top spender
 */
export const getStats = (req, res) => {
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM users WHERE is_deleted = 0) AS total_users,
      (SELECT COUNT(*) FROM products WHERE is_deleted = 0) AS total_products,
      (SELECT COUNT(*) FROM orders WHERE status = 'pending') AS total_pending_orders,
      (SELECT IFNULL(SUM(total_amount),0) FROM orders WHERE status = 'paid') AS total_income,
      (
        SELECT user_id 
        FROM orders 
        WHERE status = 'paid' 
        GROUP BY user_id 
        ORDER BY SUM(total_amount) DESC 
        LIMIT 1
      ) AS top_spender_id,
      (
        SELECT SUM(total_amount) 
        FROM orders o2 
        WHERE o2.status = 'paid' 
        AND o2.user_id = (
          SELECT user_id 
          FROM orders 
          WHERE status = 'paid' 
          GROUP BY user_id 
          ORDER BY SUM(total_amount) DESC 
          LIMIT 1
        )
      ) AS top_spender_amount
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching stats:", error);
      return res.status(500).json({ error: "Database error" });
    }

    const stats = results[0];

    // Run second query for sales over time
    const salesByDateQuery = `
      SELECT DATE(created_at) AS date, SUM(total_amount) AS total_sales
      FROM orders
      WHERE status = 'paid'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    connection.query(salesByDateQuery, (err2, salesResults) => {
      if (err2) {
        console.error("Error fetching sales by date:", err2);
        return res.status(500).json({ error: "Database error" });
      }

      res.json({
        totalUsers: stats.total_users,
        totalProducts: stats.total_products,
        totalPendingOrders: stats.total_pending_orders,
        totalIncome: stats.total_income,
        topSpender: {
          userId: stats.top_spender_id,
          amount: stats.top_spender_amount,
        },
        salesByDate: salesResults, // ✅ added back
      });
    });
  });
};

/**
 * 📌 2. Revenue Trend (sales over time)
 */
export const getRevenueTrend = (req, res) => {
  const query = `
    SELECT DATE(created_at) AS date, SUM(total_amount) AS revenue
    FROM orders
    WHERE status = 'paid'
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching revenue trend:", error);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results); // [{ date: "2025-08-01", revenue: 450 }, ...]
  });
};

/**
 * 📌 3. Orders by Status
 */
export const getOrderStatusSummary = (req, res) => {
  const query = `
    SELECT status, COUNT(*) AS value
    FROM orders
    GROUP BY status
  `;
  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching order status:", error);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results); // [{ status: "pending", value: 10 }, ...]
  });
};

/**
 * 📌 4. Top Selling Products
 */
export const getTopSellingProducts = (req, res) => {
  const query = `
    SELECT p.name, SUM(oi.quantity) AS sales
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    GROUP BY p.id
    ORDER BY sales DESC
    LIMIT 10
  `;
  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching top products:", error);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results); // [{ name: "Laptop", sales: 320 }, ...]
  });
};

/**
 * 📌 5. Category Sales Summary
 */
export const getCategorySalesSummary = (req, res) => {
  const query = `
    SELECT c.name AS category, SUM(oi.quantity * oi.price) AS value
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN categories c ON p.category_id = c.id
    GROUP BY c.id
  `;
  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching category sales:", error);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results); // [{ category: "Electronics", value: 8500 }, ...]
  });
};

/**
 * 📌 6. User Growth
 */
export const getUserGrowth = (req, res) => {
  const query = `
    SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS users
    FROM users
    WHERE is_deleted = 0
    GROUP BY month
    ORDER BY month
  `;
  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching user growth:", error);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results); // [{ month: "2025-01", users: 50 }, ...]
  });
};

/**
 * 📌 7. Low Stock Products
 */
export const getLowStockProducts = (req, res) => {
  const query = `
    SELECT name, stock_quantity
    FROM products
    WHERE stock_quantity <= 10 AND is_deleted = 0
    ORDER BY stock_quantity ASC
  `;
  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching low stock products:", error);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results); // [{ name: "Smartphone", stock_quantity: 5 }, ...]
  });
};

export const getTopSellingProductsByMonth = (req, res) => {
  const { month } = req.query; 
  // Example: /api/top-products?month=2025-08

  if (!month) {
    return res.status(400).json({ error: "Month (YYYY-MM) is required" });
  }

  const query = `
    SELECT 
      p.id AS product_id,
      p.name AS product_name,
      SUM(oi.quantity) AS total_quantity,
      SUM(oi.quantity * oi.price) AS total_revenue
    FROM order_items oi
    INNER JOIN orders o ON oi.order_id = o.id
    INNER JOIN products p ON oi.product_id = p.id
    WHERE o.status = 'paid'
      AND DATE_FORMAT(o.created_at, '%Y-%m') = ?
    GROUP BY p.id, p.name
    ORDER BY total_quantity DESC
    LIMIT 10;
  `;

  connection.query(query, [month], (error, results) => {
    if (error) {
      console.error("Error fetching top products by month:", error);
      return res.status(500).json({ error: "Database error", details: error.message });
    }

    res.json(results);
    // Example response:
    // [
    //   { product_id: 3, product_name: "iPhone 15", total_quantity: 120, total_revenue: 120000 },
    //   { product_id: 7, product_name: "MacBook Pro", total_quantity: 85, total_revenue: 170000 }
    // ]
  });
};


export const getAvailableMonths = (req, res) => {
  const query = `
    SELECT DISTINCT DATE_FORMAT(created_at, '%Y-%m') AS month
    FROM orders
    WHERE status = 'paid'
    ORDER BY month DESC;
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching months:", error);
      return res.status(500).json({ error: "Database error", details: error.message });
    }

    res.json(results.map(r => r.month));
    // Example: ["2025-08", "2025-07", "2025-06"]
  });
};
