import { connection } from "../database/connect.js";

export const getStats = async (req, res) => {
  try {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM products) AS total_products,
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

      // Results[0] contains totals
      const stats = results[0];

      // Now fetch sales by date separately
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

        return res.json({
          totalUsers: stats.total_users,
          totalProducts: stats.total_products,
          totalPendingOrders: stats.total_pending_orders,
          totalIncome: stats.total_income,
          topSpender: {
            userId: stats.top_spender_id,
            amount: stats.top_spender_amount,
          },
          salesByDate: salesResults, // array of { date, total_sales }
        });
      });
    });
  } catch (err) {
    console.error("Error in getStats:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
