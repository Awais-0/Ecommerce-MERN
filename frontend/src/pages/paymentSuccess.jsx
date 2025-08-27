import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
    const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [showConfetti, setShowConfetti] = React.useState(true);

  useEffect(() => {
    if (!sessionId) return;
    const fetchDetails = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/api/payment/session/${sessionId}`
        );
        if (!res.ok) throw new Error(`Failed to fetch details for ${sessionId}`);
        const data = await res.json();
        console.log(data);
      } catch (error) {
        console.log("Error occurred while fetching details: ", error);
      }
    };
    fetchDetails();

    // stop confetti after 5s
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 relative">
      {showConfetti && <Confetti />}

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1.2 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 10,
            delay: 0.2,
          }}
          className="flex items-center justify-center mb-4"
        >
          <span className="text-6xl">✅</span>
        </motion.div>

        <h1 className="text-2xl font-bold text-green-600 mb-3">
          Payment Successful
        </h1>
        <p className="text-gray-700 mb-2">Thank you for your purchase!</p>
        <p className="text-gray-600 text-sm">
          Your payment has been processed successfully.
        </p>

        {sessionId && (
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-500">Session ID:</p>
            <p className="font-mono text-sm text-gray-800 break-words">
              {sessionId}
            </p>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/products')}
          className="mt-6 bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg shadow-md transition"
        >
          Continue Shopping
        </motion.button>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
