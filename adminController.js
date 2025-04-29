// src/controllers/adminController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const AdminModel = require("../models/adminModel");
const db = require("../config/db");

// Secret Key for Admin JWT (should be different from regular user JWT for security)
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "admin_jwt_secret_key";

// Admin Login
exports.adminLogin = async (req, res) => {
  const { username, password } = req.body;

  console.log("Admin login attempt:", { username });
  
  try {
    // Find admin by username in database
    const admin = await AdminModel.findByUsername(username);
    
    // If no admin found with that username
    if (!admin) {
      console.log("Admin not found:", username);
      return res.status(401).json({ message: "Invalid admin credentials" });
    }
    
    // Compare the provided password with stored hash
    const passwordMatch = await bcrypt.compare(password, admin.password);
    
    if (passwordMatch) {
      console.log("Admin credentials verified successfully for:", username);
      
      // Update last login timestamp
      await AdminModel.updateLastLogin(admin.id);
      
      // Generate Admin JWT Token
      const token = jwt.sign(
        { 
          id: admin.id,
          username: admin.username, 
          isAdmin: true 
        },
        ADMIN_JWT_SECRET,
        { expiresIn: "12h" } // Longer expiry for admin tokens
      );

      console.log("Admin JWT token generated successfully");
      
      // Return success with token
      res.status(200).json({ 
        message: "Admin login successful", 
        token,
        isAdmin: true
      });
    } else {
      console.log("Invalid admin password for:", username);
      res.status(401).json({ message: "Invalid admin credentials" });
    }
  } catch (error) {
    console.error("Error during admin login:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Validate Admin Token
exports.validateAdminToken = (req, res) => {
  // The middleware has already verified the token
  res.status(200).json({ 
    valid: true, 
    admin: req.admin,
    message: "Admin token is valid" 
  });
};

// Get Admin Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Total users count
    const [userCountResult] = await db.promise().query(
      "SELECT COUNT(*) as count FROM users"
    );
    const userCount = userCountResult[0].count;

    // 2. Total trainers count
    const [trainerCountResult] = await db.promise().query(
      "SELECT COUNT(*) as count FROM trainers"
    );
    const trainerCount = trainerCountResult[0].count;

    // 3. Total programs count
    const [programCountResult] = await db.promise().query(
      "SELECT COUNT(*) as count FROM programs"
    );
    const programCount = programCountResult[0].count;

    // 4. Membership distribution
    const [membershipDistribution] = await db.promise().query(`
      SELECT 
        m.name as tier, 
        COUNT(u.id) as count 
      FROM memberships m
      LEFT JOIN users u ON m.id = u.membershipId
      GROUP BY m.id, m.name
    `);

    // 5. Recent users
    const [recentUsers] = await db.promise().query(`
      SELECT id, name, email, created_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    // 6. Recent trainers
    const [recentTrainers] = await db.promise().query(`
      SELECT id, name, email, created_at 
      FROM trainers 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    res.status(200).json({
      userCount,
      trainerCount,
      programCount,
      membershipDistribution,
      recentUsers,
      recentTrainers
    });
  } catch (error) {
    console.error("Error fetching admin statistics:", error);
    res.status(500).json({ message: "Error fetching statistics", error: error.message });
  }
};

// Admin Logout - Not required on server side, just clear token on client
exports.adminLogout = (req, res) => {
  res.status(200).json({ message: "Admin logged out successfully" });
};

// Get profile information for the current admin
exports.getProfile = async (req, res) => {
  try {
    const adminId = req.admin.id;
    
    // Fetch admin data without password
    const [rows] = await db.promise().query(
      `SELECT id, username, email, created_at, last_login 
       FROM admins 
       WHERE id = ?`,
      [adminId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }
    
    res.status(200).json({ 
      admin: rows[0]
    });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Change admin password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin.id;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }
    
    // Get admin with password
    const [admins] = await db.promise().query(
      "SELECT * FROM admins WHERE id = ?",
      [adminId]
    );
    
    if (admins.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }
    
    // Verify current password
    const passwordValid = await bcrypt.compare(currentPassword, admins[0].password);
    
    if (!passwordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    
    // Update password
    const success = await AdminModel.changePassword(adminId, newPassword);
    
    if (success) {
      res.status(200).json({ message: "Password changed successfully" });
    } else {
      res.status(500).json({ message: "Failed to change password" });
    }
  } catch (error) {
    console.error("Error changing admin password:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};