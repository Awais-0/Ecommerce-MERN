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
        SELECT o.id, o.total_amount,o.status, o.user_id, u.email 
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
                client_reference_id: order.user_id,
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
                success_url: "http://localhost:5173/paymentSuccess?session_id={CHECKOUT_SESSION_ID}",
                cancel_url: "http://localhost:4000/payment-cancel.html",
                metadata: { order_id: order.id.toString(), user_id: order.user_id.toString()},
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
        const orderId = session.metadata.order_id;

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

// Get payment details by session
export const getPaymentDetailsBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // 1️⃣ Get checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    // 2️⃣ Retrieve PaymentIntent with charges expanded
    const paymentIntent = await stripe.paymentIntents.retrieve(
      session.payment_intent.id,
      { expand: ["charges"] } // ✅ only expand charges, not deeper
    );

    // 3️⃣ Safely grab first charge (if exists)
    const charge = paymentIntent.charges?.data?.[0] || null;

    const paymentData = {
      order_id: session.metadata?.order_id || null,
        user_id: session.metadata?.user_id || null,
      provider: "stripe",
      payment_intent_id: paymentIntent.id,
      session_id: session.id,
      charge_id: charge?.id || null,
      payment_status: paymentIntent.status,
      amount_paid: paymentIntent.amount_received,
      currency: paymentIntent.currency,
      card_brand: charge?.payment_method_details?.card?.brand || null,
      card_last4: charge?.payment_method_details?.card?.last4 || null,
      receipt_url: charge?.receipt_url || null,
    };

    // 4️⃣ Save to DB
    const query = `
      INSERT INTO payments 
      (order_id, user_id, provider, payment_intent_id, session_id, charge_id,
       payment_status, amount_paid, currency, card_brand, card_last4, receipt_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        payment_status = VALUES(payment_status),
        amount_paid = VALUES(amount_paid),
        card_brand = VALUES(card_brand),
        card_last4 = VALUES(card_last4),
        receipt_url = VALUES(receipt_url)
    `;

    connection.query(query, Object.values(paymentData), (err) => {
      if (err) {
        console.error("❌ Error saving payment:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ message: "✅ Payment details saved", paymentData });
    });

  } catch (err) {
    console.error("❌ Error retrieving payment details:", err);
    res.status(500).json({ error: err.message });
  }
};
