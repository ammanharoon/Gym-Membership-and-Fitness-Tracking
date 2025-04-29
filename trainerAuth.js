const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// Secret Key (Keep it safe)
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";  

// Register Trainer
exports.registerTrainer = async (req, res) => {
    console.log("Received Data:", req.body); 
    const { name, email, phone, expertise, password } = req.body;

    try {
        // Check if trainer already exists
        const [existingTrainer] = await db.promise().query("SELECT * FROM trainers WHERE email = ?", [email]);
        if (existingTrainer.length > 0) {
            return res.status(400).json({ message: "Trainer already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert trainer into DB
        await db.promise().query(
            "INSERT INTO trainers (name, email, phone, expertise, availability, Password) VALUES (?, ?, ?, ?, ?, ?)",
            [name, email, phone, expertise, true, hashedPassword]
        );

        // Generate JWT Token
        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });

        res.status(201).json({ message: "Trainer registered successfully", token });
    } catch (error) {
        console.error("Error inserting trainer:", error); 
        res.status(500).json({ error: error.message });
    }
};

// Login Trainer
exports.loginTrainer = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if trainer exists
        const [trainer] = await db.promise().query("SELECT id, password FROM trainers WHERE email = ?", [email]);
        if (trainer.length === 0) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, trainer[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Extract trainer ID
        const trainerId = trainer[0].id;

        // Ensure JWT_SECRET is defined
        if (!JWT_SECRET) {
            console.error("JWT_SECRET is not set");
            return res.status(500).json({ message: "Internal server error" });
        }

        // Generate JWT Token with trainerId
        const token = jwt.sign({ trainerId, email, role: "trainer" }, JWT_SECRET, { expiresIn: "2h" });

        // ✅ Send trainerId in the response
        res.json({ message: "Login successful", token, trainerId });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};