const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

// Helper function to get user ID from token
const getUserIdFromToken = (req, callback) => {
  let userId = req.user.id;
  
  if (!userId && req.user.email) {
    db.query(
      "SELECT id FROM users WHERE email = ?",
      [req.user.email],
      (err, users) => {
        if (err) {
          return callback({ status: 500, message: "Database error" });
        }
        
        if (users.length === 0) {
          return callback({ status: 404, message: "User not found" });
        }
        
        callback(null, users[0].id);
      }
    );
  } else {
    callback(null, userId);
  }
};

// Route to select a membership tier
router.post('/select', verifyToken, (req, res) => {
  const { membershipTier } = req.body;
  
  if (!membershipTier) {
    return res.status(400).json({ message: "Membership tier is required" });
  }
  
  getUserIdFromToken(req, (error, userId) => {
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }
    
    console.log("Processing membership selection:", membershipTier, "for user:", userId);
    
    // Get the membership ID
    db.query(
      "SELECT id FROM memberships WHERE LOWER(name) = LOWER(?)",
      [membershipTier],
      (err, memberships) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Server error" });
        }
        
        let membershipId;
        
        if (memberships.length === 0) {
          // Insert new membership tier
          const price = 
            membershipTier === 'basic' ? 10.00 : 
            membershipTier === 'standard' ? 25.00 : 50.00;
          
          db.query(
            "INSERT INTO memberships (name, price, duration) VALUES (?, ?, ?)",
            [
              membershipTier.charAt(0).toUpperCase() + membershipTier.slice(1),
              price,
              30
            ],
            (err, result) => {
              if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Server error" });
              }
              
              membershipId = result.insertId;
              updateUserMembership(userId, membershipId);
            }
          );
        } else {
          membershipId = memberships[0].id;
          updateUserMembership(userId, membershipId);
        }
      }
    );
    
    function updateUserMembership(userId, membershipId) {
      console.log("Updating user membership:", userId, "to membership ID:", membershipId, "with tier:", membershipTier);
      
      db.query(
        "UPDATE users SET membershipId = ?, membership_tier = ? WHERE id = ?",
        [membershipId, membershipTier, userId],
        (err, result) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Server error" });
          }
          
          if (result.affectedRows === 0) {
            console.error("No rows updated. User ID may be invalid:", userId);
            return res.status(404).json({ message: "User not found or update failed" });
          }
          
          console.log("Membership update successful. Affected rows:", result.affectedRows);
          
          res.status(200).json({
            message: "Membership successfully selected",
            userId: userId,
            membershipTier: membershipTier
          });
        }
      );
    }
  });
});

// Route to check membership status
router.get('/status', verifyToken, (req, res) => {
  getUserIdFromToken(req, (error, userId) => {
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }
    
    console.log("Checking membership status for user ID:", userId);
    
    db.query(
      "SELECT membership_tier, membershipId FROM users WHERE id = ?",
      [userId],
      (err, users) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Server error" });
        }
        
        if (users.length === 0) {
          return res.status(404).json({ message: "User not found" });
        }
        
        console.log("Membership status for user:", userId, "Data:", users[0]);
        
        // Send back the membership data, make sure we're sending something even if null
        res.status(200).json({
          membershipTier: users[0].membership_tier || null,
          membershipId: users[0].membershipId || null
        });
      }
    );
  });
});

// Route to confirm payment for membership
router.post('/confirm-payment', verifyToken, (req, res) => {
  const { membershipTier, paymentMethod, lastFourDigits } = req.body;
  
  if (!membershipTier) {
    return res.status(400).json({ message: "Membership tier is required" });
  }
  
  getUserIdFromToken(req, (error, userId) => {
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }
    
    console.log("Processing payment for user:", userId, "membership:", membershipTier);
    
    // Create a payments table if it doesn't exist
    db.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        card_last_four VARCHAR(4),
        status VARCHAR(20) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `, (err) => {
      if (err) {
        console.error("Error creating payments table:", err);
        return res.status(500).json({ message: "Payment system error" });
      }
      
      // Calculate amount based on membership tier
      const amount = 
        membershipTier === 'basic' ? 10.00 : 
        membershipTier === 'standard' ? 25.00 : 50.00;
      
      // Record the payment
      db.query(
        "INSERT INTO payments (user_id, amount, payment_method, card_last_four) VALUES (?, ?, ?, ?)",
        [userId, amount, paymentMethod || 'credit_card', lastFourDigits || '0000'],
        (err, result) => {
          if (err) {
            console.error("Payment recording error:", err);
            return res.status(500).json({ message: "Failed to process payment" });
          }
          
          console.log("Payment recorded successfully. Payment ID:", result.insertId);
          
          // Return success response
          res.status(200).json({
            message: "Payment processed successfully",
            paymentId: result.insertId,
            amount: amount
          });
        }
      );
    });
  });
});

// Route to get payment history for a user
router.get('/payment-history', verifyToken, (req, res) => {
  getUserIdFromToken(req, (error, userId) => {
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }
    
    // Check if payments table exists
    db.query(
      "SHOW TABLES LIKE 'payments'",
      (err, tables) => {
        if (err) {
          return res.status(500).json({ message: "Database error" });
        }
        
        if (tables.length === 0) {
          // No payments table exists yet
          return res.status(200).json({ payments: [] });
        }
        
        // Get user's payment history
        db.query(
          `SELECT id, amount, payment_method, card_last_four, status, created_at 
           FROM payments 
           WHERE user_id = ? 
           ORDER BY created_at DESC`,
          [userId],
          (err, payments) => {
            if (err) {
              return res.status(500).json({ message: "Database error" });
            }
            
            res.status(200).json({ payments });
          }
        );
      }
    );
  });
});

// Route to cancel membership
router.post('/cancel', verifyToken, (req, res) => {
  getUserIdFromToken(req, (error, userId) => {
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }
    
    db.query(
      "UPDATE users SET membershipId = NULL, membership_tier = NULL WHERE id = ?",
      [userId],
      (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Server error" });
        }
        
        if (result.affectedRows === 0) {
          console.error("No rows updated. User ID may be invalid:", userId);
          return res.status(404).json({ message: "User not found or update failed" });
        }
        
        res.status(200).json({
          message: "Membership successfully cancelled",
          userId: userId
        });
      }
    );
  });
});

// Route to change membership plan
router.post('/change-plan', verifyToken, (req, res) => {
  const { membershipTier } = req.body;
  
  if (!membershipTier) {
    return res.status(400).json({ message: "Membership tier is required" });
  }
  
  getUserIdFromToken(req, (error, userId) => {
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }
    
    console.log("Processing membership change:", membershipTier, "for user:", userId);
    
    // Get the membership ID
    db.query(
      "SELECT id FROM memberships WHERE LOWER(name) = LOWER(?)",
      [membershipTier],
      (err, memberships) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Server error" });
        }
        
        let membershipId;
        
        if (memberships.length === 0) {
          // Insert new membership tier if it doesn't exist
          const price = 
            membershipTier === 'basic' ? 10.00 : 
            membershipTier === 'standard' ? 25.00 : 50.00;
          
          db.query(
            "INSERT INTO memberships (name, price, duration) VALUES (?, ?, ?)",
            [
              membershipTier.charAt(0).toUpperCase() + membershipTier.slice(1),
              price,
              30
            ],
            (err, result) => {
              if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Server error" });
              }
              
              membershipId = result.insertId;
              updateUserMembership(userId, membershipId);
            }
          );
        } else {
          membershipId = memberships[0].id;
          updateUserMembership(userId, membershipId);
        }
      }
    );
    
    function updateUserMembership(userId, membershipId) {
      console.log("Updating user membership:", userId, "to membership ID:", membershipId, "with tier:", membershipTier);
      
      db.query(
        "UPDATE users SET membershipId = ?, membership_tier = ? WHERE id = ?",
        [membershipId, membershipTier, userId],
        (err, result) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Server error" });
          }
          
          if (result.affectedRows === 0) {
            console.error("No rows updated. User ID may be invalid:", userId);
            return res.status(404).json({ message: "User not found or update failed" });
          }
          
          console.log("Membership update successful. Affected rows:", result.affectedRows);
          
          // Create a payment record for the plan change
          const price = membershipTier === 'basic' ? 10.00 : 
                        membershipTier === 'standard' ? 25.00 : 50.00;
          
          // Check if payments table exists
          db.query("SHOW TABLES LIKE 'payments'", (err, tables) => {
            if (err) {
              console.error("Error checking payments table:", err);
              // Continue with response even if payment logging fails
              return completeResponse();
            }
            
            if (tables.length === 0) {
              // Create payments table if it doesn't exist
              db.query(`
                CREATE TABLE IF NOT EXISTS payments (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  user_id INT NOT NULL,
                  amount DECIMAL(10,2) NOT NULL,
                  payment_method VARCHAR(50) NOT NULL,
                  card_last_four VARCHAR(4),
                  status VARCHAR(20) DEFAULT 'completed',
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (user_id) REFERENCES users(id)
                )
              `, (err) => {
                if (err) {
                  console.error("Error creating payments table:", err);
                  return completeResponse();
                }
                
                recordPayment();
              });
            } else {
              recordPayment();
            }
          });
          
          function recordPayment() {
            db.query(
              "INSERT INTO payments (user_id, amount, payment_method, card_last_four) VALUES (?, ?, ?, ?)",
              [userId, price, 'credit_card', '0000'],
              (err) => {
                if (err) {
                  console.error("Error recording payment:", err);
                }
                
                completeResponse();
              }
            );
          }
          
          function completeResponse() {
            res.status(200).json({
              message: "Membership successfully changed",
              userId: userId,
              membershipTier: membershipTier
            });
          }
        }
      );
    }
  });
});

module.exports = router;