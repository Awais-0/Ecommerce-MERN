import { Router } from "express";
import authCheck from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/adminCheck.middleware.js";
import { getAvailableMonths, getCategorySalesSummary, getLowStockProducts, getOrderStatusSummary, getRevenueTrend, getStats, getTopSellingProducts, getTopSellingProductsByMonth, getUserGrowth } from "../controllers/stats.controllers.js";

const statsRouter = Router();

statsRouter.route('/getStats').get(authCheck, verifyAdmin, getStats);
statsRouter.route('/status-summary').get(authCheck, verifyAdmin, getOrderStatusSummary);
statsRouter.route('/top-selling').get(authCheck, verifyAdmin, getTopSellingProducts);
statsRouter.route('/sales-summary').get(authCheck, verifyAdmin, getCategorySalesSummary);
statsRouter.route('/growth').get(authCheck, verifyAdmin, getUserGrowth);
statsRouter.route('/low-stock').get(authCheck, verifyAdmin, getLowStockProducts);
statsRouter.route('/revenue-trend').get(authCheck, verifyAdmin, getRevenueTrend);
statsRouter.route('/available-months').get(authCheck, verifyAdmin, getAvailableMonths);
statsRouter.route('/top-products').get(authCheck, verifyAdmin, getTopSellingProductsByMonth);



export default statsRouter;