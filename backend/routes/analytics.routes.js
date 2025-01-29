import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { getAnalyticsData, getDailySalesData } from "../controller/analytics.controller.js";

const router = express.Router();

router.get("/analytics", protectRoute, adminRoute, async (req, res) => {
    try {
        const analyticsData = await getAnalyticsData();

        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

        const dailySalesData = await getDailySalesData(startDate, endDate);

        res.status(200).json({ analyticsData, dailySalesData });
    } catch (error) {
        console.error("Error in getting analytics data: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
