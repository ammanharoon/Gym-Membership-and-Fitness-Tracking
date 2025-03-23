const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const db = require("../config/db"); // Import database connection

// Route: Select membership tier
router.post("/select", verifyToken, async (req, res) => {
    try {
        const { membershipTier } = req.body;
        const userId = req.user?.id; // Use optional chaining to avoid crashes

        console.log("🔹 Request Data:", { membershipTier, userId, userEmail: req.user?.email });

        if (!membershipTier) {
            return res.status(400).json({ message: "Membership tier is required" });
        }

        // If user ID is missing, try fetching from email
        let userIdToUpdate = userId;
        if (!userIdToUpdate && req.user?.email) {
            const [user] = await db.promise().query(
                "SELECT id FROM users WHERE email = ?",
                [req.user.email]
            );
            if (user.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }
            userIdToUpdate = user[0].id;
            console.log("✅ Retrieved user ID:", userIdToUpdate);
        }

        // Log the SQL query before execution
        console.log(`Executing: UPDATE users SET membership_tier = "${membershipTier}" WHERE id = ${userIdToUpdate}`);

        // Update database
        const [result] = await db.promise().query(
            "UPDATE users SET membership_tier = ? WHERE id = ?", 
            [membershipTier, userIdToUpdate]
        );

        console.log("🔹 Database update result:", result);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found or membership not updated" });
        }

        res.json({ 
            message: "Membership selected successfully", 
            membershipTier,
            userId: userIdToUpdate
        });

    } catch (error) {
        console.error("🔴 Error selecting membership:", error);
        res.status(500).json({ message: "Server error. Try again later." });
    }
});

// Route: Get user membership status
router.get("/status", verifyToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(400).json({ message: "Invalid user" });
        }

        const [user] = await db.promise().query(
            "SELECT membership_tier FROM users WHERE id = ?", 
            [userId]
        );

        if (user.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ 
            message: "Membership status retrieved successfully", 
            membershipTier: user[0].membership_tier 
        });

    } catch (error) {
        console.error("🔴 Error getting membership status:", error);
        res.status(500).json({ message: "Server error. Try again later." });
    }
});

module.exports = router;
