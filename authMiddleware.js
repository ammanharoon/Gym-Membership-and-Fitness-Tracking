// src/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const db = require('../config/db');

exports.verifyToken = async (req, res, next) => {
    console.log("🔹 Full Request Headers:", req.headers);
    
    const authHeader = req.header("Authorization");
    console.log("🔹 Received Auth Header:", authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }
    
    try {
        const token = authHeader.split(' ')[1];
        console.log("🔹 Extracted Token:", token);
        
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("🔹 Decoded User:", decoded);
        
        // If token only contains email and not id, try to fetch the id
        if (decoded.email && !decoded.id) {
            console.log("🔹 Token doesn't contain user ID, fetching from database");
            try {
                const [users] = await db.query(
                    "SELECT id FROM users WHERE email = ?",
                    [decoded.email]
                );
                
                if (users.length > 0) {
                    decoded.id = users[0].id;
                    console.log("🔹 User ID found:", decoded.id);
                }
            } catch (dbError) {
                console.error("🔴 Database error:", dbError);
                // Continue with the request even if ID lookup fails
            }
        }
        
        req.user = decoded;
        next();
    } catch (error) {
        console.error("🔴 JWT Verification Error:", error.message);
        res.status(401).json({ message: "Invalid or expired token" });
    }
};