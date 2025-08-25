import Stripe from "stripe";
import { connection } from "../database/connect.js";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = (req, res) => {
    const { orderId } = req.body;
    if (!orderId) {
        return res.status(400).json({ error: "Order ID is required" });
    }

    const orderQuery = `
        SELECT o.id, o.total_amount,o.status, u.email 
        FROM orders o 
        JOIN users u ON o.user_id = u.id 
        WHERE o.id = ?
    `;

    connection.query(orderQuery, [orderId], async (err, results) => {
        if (err) {
            console.error("Error fetching order:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        const order = results[0];

        if (order.status === "paid") {
            return res.status(400).json({ error: "Order already paid" });
        }
        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                mode: "payment",
                customer_email: order.email,
                line_items: [
                    {
                        price_data: {
                            currency: "usd",
                            product_data: { name: `Order #${order.id}` },
                            unit_amount: Math.round(order.total_amount * 100),
                        },
                        quantity: 1,
                    },
                ],
                success_url: "http://localhost:4000/payment-success.html?session_id={CHECKOUT_SESSION_ID}",
                cancel_url: "http://localhost:4000/payment-cancel.html",
                metadata: { orderId: order.id.toString() }, // force string
            });

            return res.json({ id: session.id });
        } catch (error) {
            console.error("Stripe error:", error);
            return res.status(500).json({ error: "Stripe session error" });
        }
    });
};

export const handleWebhook = (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body, // raw body because of express.raw
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error("⚠️ Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const orderId = session.metadata.orderId;

        const updateQuery = `UPDATE orders SET status = 'paid' WHERE id = ?`;
        connection.query(updateQuery, [orderId], (err) => {
            if (err) {
                console.error("Error updating order:", err);
            } else {
                console.log(`✅ Order ${orderId} marked as PAID`);
            }
        });
    }

    res.json({ received: true });
};
