import { handleWebhook } from "./controllers/payment.controllers.js";
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';

const App = express();
App.use(cors({
  origin: ["http://localhost:5500", "http://127.0.0.1:5500", 'http://localhost:5173'],
  credentials: true,
}));


App.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);
App.use(express.json());
App.use(express.urlencoded({ extended: true }));
App.use(cookieParser());
App.use(express.static("public"));

export default App;