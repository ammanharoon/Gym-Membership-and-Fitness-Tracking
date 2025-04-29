const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Ensure your DB connection is set up
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/trainer-profile", async (req, res) => {
  try {
    const trainerId = parseInt(req.query.trainerId, 10);

    if (!trainerId) {
      return res.status(400).json({ message: "Trainer ID is required" });
    }

    const [rows] = await db.promise().query(
      `SELECT id, name, email, phone, expertise, availability
       FROM trainers
       WHERE id = ?`,
      [trainerId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Error fetching trainer profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/trainer-programs", async (req, res) => {
  try {
    const trainerId = parseInt(req.query.trainerId, 10);

    if (!trainerId) {
      return res.status(400).json({ message: "Trainer ID is required" });
    }

    const [programRows] = await db.promise().query(
      `SELECT id, name, description, duration
       FROM programs
       WHERE trainer_id = ?`,
      [trainerId]
    );

    let programIds = programRows.map(p => p.id);
    let exerciseRows = [];

    if (programIds.length > 0) {
      const [exercises] = await db.promise().query(
        `SELECT id, program_id, name, duration
         FROM exercises
         WHERE program_id IN (${programIds.map(() => '?').join(',')})`,
        programIds
      );
      exerciseRows = exercises;
    }

    const programsWithExercises = programRows.map(program => ({
      ...program,
      exercises: exerciseRows.filter(ex => ex.program_id === program.id)
    }));

    res.json(programsWithExercises);
  } catch (error) {
    console.error("❌ Error fetching programs:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/trainer-sessions", async (req, res) => {
  try {
    const trainerId = parseInt(req.query.trainerId, 10);

    if (!trainerId) {
      return res.status(400).json({ message: "Trainer ID is required" });
    }

    const [sessionRows] = await db.promise().query(
      `SELECT s.id, s.description
      FROM sessions s
      WHERE s.trainer_id = ?`,
      [trainerId]
    );

    res.json(sessionRows);
  } catch (error) {
    console.error("❌ Error fetching sessions:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/trainer-clients", async (req, res) => {
  try {
    const trainerId = parseInt(req.query.trainerId, 10);

    if (!trainerId) {
      return res.status(400).json({ message: "Trainer ID is required" });
    }

    const [clientRows] = await db.promise().query(
      `SELECT 
         u.id AS user_id,
         u.name AS user_name,
         u.email AS user_email,
         COUNT(p.id) AS program_count
       FROM programs p
       JOIN users u ON p.client_id = u.id
       WHERE p.trainer_id = ?
       GROUP BY u.id, u.name, u.email`,
      [trainerId]
    );

    res.json(clientRows);
  } catch (error) {
    console.error("❌ Error fetching booked clients:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/add-program", async (req, res) => {
  try {
    const { trainerId, programName, description, duration, sessions } = req.body;

    // Log the received data for debugging
    console.log("Received data:", { trainerId, programName, description, duration, sessions });

    // Validate required fields
    if (!trainerId || !programName || !description || !duration) {
      return res.status(400).json({ message: "Trainer ID, program name, description, and duration are required" });
    }

    // Validate that trainerId is a number
    if (isNaN(trainerId)) {
      return res.status(400).json({ message: "Trainer ID must be a valid number" });
    }

    // Validate sessions array
    if (!Array.isArray(sessions)) {
      return res.status(400).json({ message: "Sessions must be an array" });
    }

    // Check session descriptions for length (since sessions.description is VARCHAR(20))
    for (let i = 0; i < sessions.length; i++) {
      const sessionDescription = sessions[i];
      if (!sessionDescription) {
        return res.status(400).json({ message: `Session ${i + 1} description is required` });
      }
      if (sessionDescription.length > 20) {
        return res.status(400).json({
          message: `Session ${i + 1} description exceeds 20 characters (current length: ${sessionDescription.length})`,
        });
      }
    }

    // Insert the program
    const [programResult] = await db.promise().query(
      "INSERT INTO programs (trainer_id, name, description, duration) VALUES (?, ?, ?, ?)",
      [trainerId, programName, description, duration]
    );
    const programId = programResult.insertId;

    // Insert sessions if there are any
    // Note: sessionDescription is a comma-separated string (e.g., "abs,crunches")
    if (sessions.length > 0) {
      for (let i = 0; i < sessions.length; i++) {
        const sessionDescription = sessions[i];
        await db.promise().query(
          "INSERT INTO sessions (trainer_id, program_id, description) VALUES (?, ?, ?)",
          [trainerId, programId, sessionDescription]
        );
      }
    }

    // Fetch the newly created program to return in the response
    const [newProgram] = await db.promise().query(
      "SELECT * FROM programs WHERE id = ?",
      [programId]
    );

    console.log(`✅ Program '${programName}' added with ${sessions.length} sessions`);
    res.status(201).json({
      message: "Program and sessions added successfully",
      program: newProgram[0],
    });
  } catch (error) {
    console.error("❌ Error adding program:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "A program with this name may already exist for this trainer" });
    }
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ message: "Invalid trainer ID: Trainer does not exist" });
    }
    res.status(500).json({ message: "Server error: Failed to add program" });
  }
});
  

router.post("/add-exercise", async (req, res) => {
    try {
      const { programId, name, description, duration } = req.body;
  
      if (!programId || !name || !description || !duration) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      // Check if program exists
      const [programExists] = await db.promise().query("SELECT id FROM programs WHERE id = ?", [programId]);
  
      if (!programExists.length) {
        return res.status(404).json({ message: "Program not found" });
      }
  
      await db.promise().query(
        "INSERT INTO exercises (program_id, name, description, duration) VALUES (?, ?, ?, ?)",
        [programId, name, description, duration]
      );
  
      console.log(`✅ Exercise '${name}' added to Program ${programId}`);
      res.status(201).json({ message: "Exercise added successfully" });
  
    } catch (error) {
      console.error("❌ Error adding exercise:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  
  router.post("/add-session", async (req, res) => {
    try {
      const { trainerId, clientId, sessionDate } = req.body;
  
      if (!trainerId || !clientId || !sessionDate) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      // Ensure trainer and client exist
      const [trainerExists] = await db.promise().query("SELECT id FROM trainers WHERE id = ?", [trainerId]);
      const [clientExists] = await db.promise().query("SELECT id FROM clients WHERE id = ?", [clientId]);
  
      if (!trainerExists.length || !clientExists.length) {
        return res.status(404).json({ message: "Trainer or client not found" });
      }
  
      // Insert session
      await db.promise().query(
        "INSERT INTO sessions (trainer_id, client_id, session_date) VALUES (?, ?, ?)",
        [trainerId, clientId, sessionDate]
      );
  
      console.log(`✅ Session added for Trainer ${trainerId} and Client ${clientId}`);
      res.status(201).json({ message: "Session added successfully" });
  
    } catch (error) {
      console.error("❌ Error adding session:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // User Dashboard - Fetch programs assigned to a specific client (user)
router.get("/user-dashboard", async (req, res) => {
  try {
    const clientId = parseInt(req.query.clientId, 10);

    if (!clientId) {
      return res.status(400).json({ message: "Client ID is required" });
    }

    // Fetch programs for this client
    const [programs] = await db.promise().query(
      "SELECT * FROM programs WHERE client_id = ?",
      [clientId]
    );

    // Fetch exercises related to these programs
    const [exercises] = await db.promise().query(
      "SELECT * FROM exercises WHERE program_id IN (?)",
      [programs.map(p => p.id)]
    );

    // Nest exercises under their respective programs
    const programsWithExercises = programs.map(program => {
      return {
        ...program,
        exercises: exercises.filter(ex => ex.program_id === program.id)
      };
    });

    res.status(200).json({ programs: programsWithExercises });
  } catch (error) {
    console.error("❌ Error fetching user dashboard:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all programs (for user dashboard workout section)
router.get("/programs", async (req, res) => {
  try {
    const [programRows] = await db.promise().query(
      "SELECT * FROM programs"
    );

    res.status(200).json({ programs: programRows });
  } catch (error) {
    console.error("❌ Error fetching programs:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ /routes/program.js
router.post("/buy-program", verifyToken, async (req, res) => {
  try {
    let userId = req.user?.id;
    const { programId } = req.body;

    // If userId is still undefined, try to get it from the database using email
    let userIdToUse = userId;
    if (!userIdToUse && req.user?.email) {
      const [userResult] = await db.promise().query(
        "SELECT id FROM users WHERE email = ?",
        [req.user.email]
      );
      
      if (userResult.length > 0) {
        userIdToUse = userResult[0].id;
        console.log("✅ Retrieved user ID from email:", userIdToUse);
      }
    }

    if (!userIdToUse || !programId) {
      return res.status(400).json({ message: "Missing userId or programId" });
    }

    // Rest of your existing code
    const [programCheck] = await db.promise().query(
      "SELECT client_id FROM programs WHERE id = ?",
      [programId]
    );

    if (programCheck.length === 0) {
      return res.status(404).json({ message: "Program not found" });
    }

    if (programCheck[0].client_id !== null) {
      return res.status(409).json({ message: "Program already purchased" });
    }

    const [updateResult] = await db.promise().query(
      "UPDATE programs SET client_id = ? WHERE id = ?",
      [userIdToUse, programId]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(500).json({ message: "Failed to update program" });
    }

    console.log(`✅ Program ${programId} purchased by user ${userIdToUse}`);
    res.status(200).json({ 
      message: "Program purchased successfully",
      userId: userIdToUse  // Return userId for client-side storage if needed
    });

  } catch (error) {
    console.error("❌ Error purchasing program:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/user-programs/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.promise().query(
      `SELECT 
        p.id AS program_id,
        p.name AS program_name,
        p.description,
        p.duration,
        t.name AS trainer_name,
        t.expertise AS category
      FROM programs p
      LEFT JOIN trainers t ON p.trainer_id = t.id
      WHERE p.client_id = ?`,
      [userId]
    );

    res.status(200).json({ programs: rows });
  } catch (error) {
    console.error("❌ Error fetching user programs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get('/trainer-details', async (req, res) => {
  console.log("API called with query params:", req.query);
  const { trainerId } = req.query;
  console.log("Attempting to find trainer with ID:", trainerId);
  
  try {
    const [trainer] = await db.promise().query(`SELECT name, email FROM trainers WHERE id = ?`, [trainerId]);
    console.log("Database result:", trainer);
    
    if (trainer.length > 0) {
      console.log("Found trainer:", trainer[0]);
      res.json(trainer[0]);
    } else {
      console.log("No trainer found with ID:", trainerId);
      res.status(404).json({ message: "Trainer not found" });
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
});

module.exports = router;


module.exports = router;
