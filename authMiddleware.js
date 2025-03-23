const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

exports.verifyToken = (req, res, next) => {
    console.log("🔹 Full Request Headers:", req.headers); // Debugging step

    const token = req.header("Authorization");
    console.log("🔹 Received Token:", token);  

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const cleanedToken = token.replace("Bearer ", "").trim();
        console.log("🔹 Cleaned Token:", cleanedToken); // Debugging step

        const decoded = jwt.verify(cleanedToken, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("🔴 JWT Verification Error:", error.message);
        res.status(400).json({ message: "Invalid token" });
    }
};

