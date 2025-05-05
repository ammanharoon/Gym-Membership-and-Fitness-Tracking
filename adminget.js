const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const { verifyAdmin } = require("../middleware/adminMiddleware");

// Initialize admin table
async function initAdminTable() {
  try {
    console.log('Checking if admin table exists...');
    
    try {
      // Try to query the table to see if it exists
      await db.promise().query('SELECT 1 FROM admins LIMIT 1');
      console.log('✅ Admin table already exists');
    } catch (error) {
      // Table doesn't exist, create it
      console.log('🔧 Creating admin table...');
      await db.promise().query(`
        CREATE TABLE IF NOT EXISTS admins (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          email VARCHAR(100) UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP NULL
        )
      `);
      console.log('✅ Admin table created successfully');
      
      // Create default admin if no admins exist
      await createDefaultAdmin();
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error initializing admin table:', error);
    return false;
  }
}

// Create default admin user if no admins exist
async function createDefaultAdmin() {
  try {
    // Check if any admin exists
    const [admins] = await db.promise().query('SELECT COUNT(*) as count FROM admins');
    
    if (admins[0].count === 0) {
      console.log('🔧 Creating default admin user...');
      
      // Hash the default password
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      // Insert default admin
      await db.promise().query(`
        INSERT INTO admins (username, password, email) 
        VALUES (?, ?, ?)
      `, ['admin', hashedPassword, 'admin@example.com']);
      
      console.log('✅ Default admin created with username: admin, password: admin123');
    } else {
      console.log('ℹ️ Admin users already exist in the database');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
    return false;
  }
}

// Initialize admin table on server start
initAdminTable().then(() => {
  console.log('✅ Admin system initialized');
}).catch(err => {
  console.error('❌ Failed to initialize admin system:', err);
});

// Admin Login route (no middleware needed - public route)
router.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    // Find admin by username
    const [admins] = await db.promise().query(
      "SELECT * FROM admins WHERE username = ?",
      [username]
    );
    
    if (admins.length === 0) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, admins[0].password);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }
    
    // Update last login time
    await db.promise().query(
      "UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
      [admins[0].id]
    );
    
    // Return success response with admin ID
    res.status(200).json({
      message: "Admin login successful",
      adminId: admins[0].id,
      username: admins[0].username
    });
    
  } catch (error) {
    console.error("❌ Error during admin login:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Admin signup route (no middleware needed - public route)
router.post("/admin/signup", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    // Check if username already exists
    const [existingUsers] = await db.promise().query(
      "SELECT * FROM admins WHERE username = ?",
      [username]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new admin
    const [result] = await db.promise().query(
      "INSERT INTO admins (username, password, email) VALUES (?, ?, ?)",
      [username, hashedPassword, email || null]
    );
    
    res.status(201).json({
      message: "Admin account created successfully",
      adminId: result.insertId,
      username
    });
    
  } catch (error) {
    console.error("❌ Error during admin signup:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get admin profile (no middleware - adminId is in query params)
router.get("/admin/profile", async (req, res) => {
  try {
    const adminId = req.query.adminId;
    
    if (!adminId) {
      return res.status(400).json({ message: "Admin ID is required" });
    }
    
    // Get admin details without password
    const [admins] = await db.promise().query(
      `SELECT id, username, email, created_at, last_login 
       FROM admins 
       WHERE id = ?`,
      [adminId]
    );
    
    if (admins.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }
    
    res.status(200).json({
      admin: admins[0]
    });
    
  } catch (error) {
    console.error("❌ Error getting admin profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Change admin password (no middleware - adminId is in request body)
router.post("/admin/change-password", async (req, res) => {
  try {
    const { adminId, currentPassword, newPassword } = req.body;
    
    if (!adminId || !currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: "Admin ID, current password, and new password are required" 
      });
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
    const passwordMatch = await bcrypt.compare(currentPassword, admins[0].password);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await db.promise().query(
      "UPDATE admins SET password = ? WHERE id = ?",
      [hashedPassword, adminId]
    );
    
    res.status(200).json({ message: "Password changed successfully" });
    
  } catch (error) {
    console.error("❌ Error changing admin password:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get dashboard statistics (no middleware - public stats)
router.get("/admin/stats", async (req, res) => {
  try {
    // Get users count
    const [userCountResult] = await db.promise().query(
      "SELECT COUNT(*) as count FROM users"
    );
    const userCount = userCountResult[0]?.count || 0;
    
    // Get trainers count
    const [trainerCountResult] = await db.promise().query(
      "SELECT COUNT(*) as count FROM trainers"
    );
    const trainerCount = trainerCountResult[0]?.count || 0;
    
    // Get programs count
    const [programCountResult] = await db.promise().query(
      "SELECT COUNT(*) as count FROM programs"
    );
    const programCount = programCountResult[0]?.count || 0;
    
    // Get membership distribution
    let membershipDistribution = [];
    try {
      [membershipDistribution] = await db.promise().query(`
        SELECT 
          IFNULL(m.name, 'No Membership') as tier, 
          COUNT(u.id) as count 
        FROM users u
        LEFT JOIN memberships m ON u.membershipId = m.id
        GROUP BY m.name
        ORDER BY count DESC
      `);
    } catch (err) {
      console.error("Error getting membership distribution:", err);
      membershipDistribution = [];
    }
    
    // Get recent users
    let recentUsers = [];
    try {
      [recentUsers] = await db.promise().query(`
        SELECT id, name, email, created_at 
        FROM users 
        ORDER BY created_at DESC 
        LIMIT 5
      `);
    } catch (err) {
      console.error("Error getting recent users:", err);
      recentUsers = [];
    }
    
    // Get recent trainers
    let recentTrainers = [];
    try {
      [recentTrainers] = await db.promise().query(`
        SELECT id, name, email
        FROM trainers 
       
      `);
    } catch (err) {
      console.error("Error getting recent trainers:", err);
      recentTrainers = [];
    }
    
    // Calculate revenue (optional, can be mocked for now)
    const totalRevenue = calculateMockRevenue(userCount);
    
    res.status(200).json({
      userCount,
      trainerCount,
      programCount,
      revenue: totalRevenue,
      membershipDistribution,
      recentUsers,
      recentTrainers
    });
    
  } catch (error) {
    console.error("❌ Error getting admin stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


router.get("/admin/users", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const searchTerm = req.query.search || '';

    // Get total count for pagination
    const [countResult] = await db.promise().query(
      `SELECT COUNT(*) as total 
       FROM users 
       WHERE name LIKE ? OR email LIKE ?`,
      [`%${searchTerm}%`, `%${searchTerm}%`]
    );

    const totalUsers = countResult[0].total;
    const totalPages = Math.ceil(totalUsers / limit);

    // Get users with membership info
    const [users] = await db.promise().query(
      `SELECT 
         u.id, u.name, u.email, u.membershipId, 
         m.name as membershipTier,
         DATE_FORMAT(u.created_at, '%Y-%m-%d') as joinDate,
         IFNULL(
           (SELECT COUNT(*) FROM fitness_workout_logs WHERE user_id = u.id), 
           0
         ) as workoutsCompleted,
         (SELECT MAX(date) FROM fitness_workout_logs WHERE user_id = u.id) as lastActive
       FROM users u
       LEFT JOIN memberships m ON u.membershipId = m.id
       WHERE u.name LIKE ? OR u.email LIKE ?
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [`%${searchTerm}%`, `%${searchTerm}%`, limit, offset]
    );

    res.status(200).json({
      users,
      pagination: {
        total: totalUsers,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("❌ Error getting users:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete a user (no middleware for now - adminId would be in request body)
router.delete("/admin/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user exists
    const [users] = await db.promise().query(
      "SELECT id FROM users WHERE id = ?",
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Delete user's workouts first (foreign key constraint)
    await db.promise().query(
      "DELETE FROM workouts WHERE user_id = ?",
      [userId]
    );
    
    // Delete user
    await db.promise().query(
      "DELETE FROM users WHERE id = ?",
      [userId]
    );
    
    res.status(200).json({ message: "User deleted successfully" });
    
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/admin/trainers", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const searchTerm = req.query.search || '';
    
    // Get total count for pagination
    const [countResult] = await db.promise().query(
      `SELECT COUNT(*) as total 
       FROM trainers 
       WHERE name LIKE ? OR email LIKE ? OR expertise LIKE ?`,
      [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
    );
    
    const totalTrainers = countResult[0].total;
    const totalPages = Math.ceil(totalTrainers / limit);
    
    // Get trainers with additional info
    const [trainers] = await db.promise().query(
      `SELECT 
         t.id, t.name, t.email, t.phone, t.expertise, 
         DATE_FORMAT(t.created_at, '%Y-%m-%d') as joinDate,
         t.availability,
         (SELECT COUNT(*) FROM programs WHERE trainer_id = t.id) as programCount,
         (SELECT COUNT(DISTINCT client_id) FROM programs WHERE trainer_id = t.id AND client_id IS NOT NULL) as clientCount
       FROM trainers t
       WHERE t.name LIKE ? OR t.email LIKE ? OR t.expertise LIKE ?
       ORDER BY t.created_at DESC
       LIMIT ? OFFSET ?`,
      [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, limit, offset]
    );
    
    res.status(200).json({
      trainers,
      pagination: {
        total: totalTrainers,
        page,
        limit,
        totalPages
      }
    });
    
  } catch (error) {
    console.error("❌ Error getting trainers:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete a trainer (no middleware for now)
router.delete("/admin/trainers/:id", async (req, res) => {
  try {
    const trainerId = req.params.id;
    
    // Check if trainer exists
    const [trainers] = await db.promise().query(
      "SELECT id FROM trainers WHERE id = ?",
      [trainerId]
    );
    
    if (trainers.length === 0) {
      return res.status(404).json({ message: "Trainer not found" });
    }
    
    // Start transaction
    await db.promise().query("START TRANSACTION");
    
    try {
      // Delete trainer's programs
      await db.promise().query(
        "DELETE FROM programs WHERE trainer_id = ?",
        [trainerId]
      );
      
      // Update clients to remove trainer reference
      await db.promise().query(
        "UPDATE clients SET trainer_id = NULL WHERE trainer_id = ?",
        [trainerId]
      );
      
      // Delete trainer's ratings
      await db.promise().query(
        "DELETE FROM trainer_ratings WHERE trainer_id = ?",
        [trainerId]
      );
      
      // Delete trainer
      await db.promise().query(
        "DELETE FROM trainers WHERE id = ?",
        [trainerId]
      );
      
      // Commit transaction
      await db.promise().query("COMMIT");
      
      res.status(200).json({ message: "Trainer deleted successfully" });
    } catch (error) {
      // Rollback transaction on error
      await db.promise().query("ROLLBACK");
      throw error;
    }
    
  } catch (error) {
    console.error("❌ Error deleting trainer:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all memberships (no middleware - public data)
router.get("/admin/memberships", async (req, res) => {
  try {
    // Create memberships table if it doesn't exist
    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS memberships (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        duration INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create membership_features table if it doesn't exist
    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS membership_features (
        id INT AUTO_INCREMENT PRIMARY KEY,
        membership_id INT NOT NULL,
        feature VARCHAR(200) NOT NULL,
        FOREIGN KEY (membership_id) REFERENCES memberships(id) ON DELETE CASCADE
      )
    `);
    
    // Insert default memberships if none exist
    const [membershipsCount] = await db.promise().query(
      "SELECT COUNT(*) as count FROM memberships"
    );
    
    if (membershipsCount[0].count === 0) {
      // Insert basic membership
      const [basicResult] = await db.promise().query(
        "INSERT INTO memberships (name, price, duration) VALUES (?, ?, ?)",
        ["Basic", 10.00, 30]
      );
      
      await db.promise().query(
        "INSERT INTO membership_features (membership_id, feature) VALUES (?, ?), (?, ?)",
        [basicResult.insertId, "Gym Access", basicResult.insertId, "Locker"]
      );
      
      // Insert standard membership
      const [standardResult] = await db.promise().query(
        "INSERT INTO memberships (name, price, duration) VALUES (?, ?, ?)",
        ["Standard", 25.00, 30]
      );
      
      await db.promise().query(
        "INSERT INTO membership_features (membership_id, feature) VALUES (?, ?), (?, ?), (?, ?)",
        [standardResult.insertId, "Gym Access", standardResult.insertId, "Locker", standardResult.insertId, "Group Classes"]
      );
      
      // Insert premium membership
      const [premiumResult] = await db.promise().query(
        "INSERT INTO memberships (name, price, duration) VALUES (?, ?, ?)",
        ["Premium", 50.00, 30]
      );
      
      await db.promise().query(
        "INSERT INTO membership_features (membership_id, feature) VALUES (?, ?), (?, ?), (?, ?), (?, ?), (?, ?)",
        [
          premiumResult.insertId, "Gym Access", 
          premiumResult.insertId, "Locker", 
          premiumResult.insertId, "Group Classes", 
          premiumResult.insertId, "Personal Trainer", 
          premiumResult.insertId, "Sauna Access"
        ]
      );
    }
    
    // Get all memberships with features and user count
    const [memberships] = await db.promise().query(`
      SELECT 
        m.id, m.name, m.price, m.duration,
        (SELECT COUNT(*) FROM users WHERE membershipId = m.id) as userCount
      FROM memberships m
      ORDER BY m.price ASC
    `);
    
    // Get features for each membership
    for (const membership of memberships) {
      const [features] = await db.promise().query(
        "SELECT feature FROM membership_features WHERE membership_id = ?",
        [membership.id]
      );
      
      membership.features = features.map(f => f.feature);
    }
    
    res.status(200).json({ memberships });
    
  } catch (error) {
    console.error("❌ Error getting memberships:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update a membership (no middleware for now)
router.put("/admin/memberships/:id", async (req, res) => {
  try {
    const membershipId = req.params.id;
    const { name, price, duration, features } = req.body;
    
    if (!name || !price || !duration) {
      return res.status(400).json({ message: "Name, price, and duration are required" });
    }
    
    // Check if membership exists
    const [memberships] = await db.promise().query(
      "SELECT id FROM memberships WHERE id = ?",
      [membershipId]
    );
    
    if (memberships.length === 0) {
      return res.status(404).json({ message: "Membership not found" });
    }
    
    // Start transaction
    await db.promise().query("START TRANSACTION");
    
    try {
      // Update membership
      await db.promise().query(
        "UPDATE memberships SET name = ?, price = ?, duration = ? WHERE id = ?",
        [name, price, duration, membershipId]
      );
      
      // Delete old features
      await db.promise().query(
        "DELETE FROM membership_features WHERE membership_id = ?",
        [membershipId]
      );
      
      // Insert new features
      if (features && features.length > 0) {
        const featureValues = features.map(feature => [membershipId, feature]);
        await db.promise().query(
          "INSERT INTO membership_features (membership_id, feature) VALUES ?",
          [featureValues]
        );
      }
      
      // Commit transaction
      await db.promise().query("COMMIT");
      
      // Get updated membership with features
      const [updatedMembership] = await db.promise().query(
        `SELECT 
          m.id, m.name, m.price, m.duration,
          (SELECT COUNT(*) FROM users WHERE membershipId = m.id) as userCount
        FROM memberships m
        WHERE m.id = ?`,
        [membershipId]
      );
      
      const [updatedFeatures] = await db.promise().query(
        "SELECT feature FROM membership_features WHERE membership_id = ?",
        [membershipId]
      );
      
      updatedMembership[0].features = updatedFeatures.map(f => f.feature);
      
      res.status(200).json({
        message: "Membership updated successfully",
        membership: updatedMembership[0]
      });
    } catch (error) {
      // Rollback transaction on error
      await db.promise().query("ROLLBACK");
      throw error;
    }
    
  } catch (error) {
    console.error("❌ Error updating membership:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create trainer ratings table helper function
async function initTrainerRatingsTable() {
  try {
    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS trainer_ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        trainer_id INT NOT NULL,
        user_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_rating (trainer_id, user_id)
      )
    `);
    console.log('✅ Trainer ratings table initialized');
    return true;
  } catch (error) {
    console.error('❌ Error initializing trainer ratings table:', error);
    return false;
  }
}

// Initialize trainer ratings table
initTrainerRatingsTable();

// Calculate mock revenue (can be replaced with actual calculation)
function calculateMockRevenue(userCount) {
  // Simple calculation based on user count
  const averageUserRevenue = 25; // assumed average membership price
  return (userCount * averageUserRevenue).toFixed(2);
}

module.exports = router;