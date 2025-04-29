const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Ensure correct MySQL database connection

router.post("/remove-program", async (req, res) => {
    let { trainerId, programId } = req.body;

    console.log("🟡 Received delete request:", { trainerId, programId });

    // 🛑 Ensure IDs are integers
    trainerId = parseInt(trainerId, 10);
    programId = parseInt(programId, 10);

    if (isNaN(trainerId) || isNaN(programId)) {
        console.error("❌ Invalid ID format:", { trainerId, programId });
        return res.status(400).json({ error: "Invalid trainerId or programId format" });
    }

    try {
        // 🔥 DELETE query using `await db.promise().query()`
        const [result] = await db.promise().query(
            "DELETE FROM programs WHERE id = ? AND trainer_id = ?",
            [programId, trainerId]
        );

        if (result.affectedRows === 0) {
            console.error("❌ Program not found:", { trainerId, programId });
            return res.status(404).json({ error: "Program not found" });
        }

        console.log("✅ Program removed successfully!");
        res.status(200).json({ message: "Program removed successfully!" });
    } catch (error) {
        console.error("❌ Error deleting program:", error);
        res.status(500).json({ error: "Error deleting program" });
    }
});

module.exports = router;
