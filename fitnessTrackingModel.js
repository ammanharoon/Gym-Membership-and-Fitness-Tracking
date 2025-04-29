// src/models/fitnessTrackingModel.js
const db = require('../config/db');

// Model for fitness tracking data
class FitnessTracking {
  // Initialize database tables if they don't exist
  static async initializeTables() {
    try {
      console.log('Initializing fitness tracking tables...');
      
      // Create fitness_weight table
      await db.promise().query(`
        CREATE TABLE IF NOT EXISTS fitness_weight (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          value DECIMAL(5,2) NOT NULL,
          date DATE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      
      // Create fitness_body_fat table
      await db.promise().query(`
        CREATE TABLE IF NOT EXISTS fitness_body_fat (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          value DECIMAL(5,2) NOT NULL,
          date DATE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      
      // Create fitness_water_intake table
      await db.promise().query(`
        CREATE TABLE IF NOT EXISTS fitness_water_intake (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          value INT NOT NULL,
          date DATE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      
      // Create fitness_workout_logs table
      await db.promise().query(`
        CREATE TABLE IF NOT EXISTS fitness_workout_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          date DATE NOT NULL,
          duration INT NOT NULL,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      
      // Create fitness_exercises table
      await db.promise().query(`
        CREATE TABLE IF NOT EXISTS fitness_exercises (
          id INT AUTO_INCREMENT PRIMARY KEY,
          workout_log_id INT NOT NULL,
          name VARCHAR(255) NOT NULL,
          sets INT NOT NULL,
          reps INT NOT NULL,
          weight DECIMAL(6,2),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (workout_log_id) REFERENCES fitness_workout_logs(id) ON DELETE CASCADE
        )
      `);
      
      // Create fitness_goals table
      await db.promise().query(`
        CREATE TABLE IF NOT EXISTS fitness_goals (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          type VARCHAR(50) NOT NULL,
          target VARCHAR(50) NOT NULL,
          deadline DATE,
          progress INT NOT NULL DEFAULT 0,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      
      console.log('Fitness tracking tables initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing fitness tracking tables:', error);
      return false;
    }
  }

  // Find all weight entries for a user
  static async findWeightEntriesByUserId(userId) {
    try {
      const [rows] = await db.promise().query(
        `SELECT id, value, DATE_FORMAT(date, '%Y-%m-%d') as date 
         FROM fitness_weight 
         WHERE user_id = ? 
         ORDER BY date`,
        [userId]
      );
      return rows;
    } catch (error) {
      console.error('Error finding weight entries:', error);
      throw error;
    }
  }

  // Find all body fat entries for a user
  static async findBodyFatEntriesByUserId(userId) {
    try {
      const [rows] = await db.promise().query(
        `SELECT id, value, DATE_FORMAT(date, '%Y-%m-%d') as date 
         FROM fitness_body_fat 
         WHERE user_id = ? 
         ORDER BY date`,
        [userId]
      );
      return rows;
    } catch (error) {
      console.error('Error finding body fat entries:', error);
      throw error;
    }
  }

  // Find all water intake entries for a user
  static async findWaterIntakeEntriesByUserId(userId) {
    try {
      const [rows] = await db.promise().query(
        `SELECT id, value, DATE_FORMAT(date, '%Y-%m-%d') as date 
         FROM fitness_water_intake 
         WHERE user_id = ? 
         ORDER BY date`,
        [userId]
      );
      return rows;
    } catch (error) {
      console.error('Error finding water intake entries:', error);
      throw error;
    }
  }

  // Find all workout logs for a user
  static async findWorkoutLogsByUserId(userId) {
    try {
      const [logs] = await db.promise().query(
        `SELECT 
          id, 
          DATE_FORMAT(date, '%Y-%m-%d') as date, 
          duration, 
          notes 
         FROM fitness_workout_logs 
         WHERE user_id = ? 
         ORDER BY date DESC`,
        [userId]
      );
      
      // Get exercises for each workout log
      for (const log of logs) {
        const [exercises] = await db.promise().query(
          `SELECT id, name, sets, reps, weight 
           FROM fitness_exercises 
           WHERE workout_log_id = ?`,
          [log.id]
        );
        
        log.exercises = exercises;
      }
      
      return logs;
    } catch (error) {
      console.error('Error finding workout logs:', error);
      throw error;
    }
  }

  // Find all fitness goals for a user
  static async findGoalsByUserId(userId) {
    try {
      const [rows] = await db.promise().query(
        `SELECT 
          id, 
          type, 
          target, 
          DATE_FORMAT(deadline, '%Y-%m-%d') as deadline, 
          progress, 
          notes 
         FROM fitness_goals 
         WHERE user_id = ? 
         ORDER BY deadline ASC`,
        [userId]
      );
      return rows;
    } catch (error) {
      console.error('Error finding fitness goals:', error);
      throw error;
    }
  }

  // Create a new weight entry
  static async createWeightEntry(userId, value, date) {
    try {
      const [result] = await db.promise().query(
        "INSERT INTO fitness_weight (user_id, value, date) VALUES (?, ?, ?)",
        [userId, value, date]
      );
      
      return {
        id: result.insertId,
        value,
        date
      };
    } catch (error) {
      console.error('Error creating weight entry:', error);
      throw error;
    }
  }

  // Create a new body fat entry
  static async createBodyFatEntry(userId, value, date) {
    try {
      const [result] = await db.promise().query(
        "INSERT INTO fitness_body_fat (user_id, value, date) VALUES (?, ?, ?)",
        [userId, value, date]
      );
      
      return {
        id: result.insertId,
        value,
        date
      };
    } catch (error) {
      console.error('Error creating body fat entry:', error);
      throw error;
    }
  }

  // Create or update water intake entry
  static async createOrUpdateWaterIntake(userId, value, date) {
    try {
      // Check if entry for the date already exists
      const [existing] = await db.promise().query(
        "SELECT id, value FROM fitness_water_intake WHERE user_id = ? AND date = ?",
        [userId, date]
      );
      
      if (existing.length > 0) {
        // Update existing entry
        const newValue = parseInt(existing[0].value) + parseInt(value);
        
        await db.promise().query(
          "UPDATE fitness_water_intake SET value = ? WHERE id = ?",
          [newValue, existing[0].id]
        );
        
        return {
          id: existing[0].id,
          value: newValue,
          date
        };
      } else {
        // Create new entry
        const [result] = await db.promise().query(
          "INSERT INTO fitness_water_intake (user_id, value, date) VALUES (?, ?, ?)",
          [userId, value, date]
        );
        
        return {
          id: result.insertId,
          value,
          date
        };
      }
    } catch (error) {
      console.error('Error creating/updating water intake:', error);
      throw error;
    }
  }

  // Create a new workout log with exercises
  static async createWorkoutLog(userId, workoutData) {
    try {
      const { date, duration, notes, exercises } = workoutData;
      
      // Start transaction
      await db.promise().query('START TRANSACTION');
      
      // Insert workout log
      const [logResult] = await db.promise().query(
        "INSERT INTO fitness_workout_logs (user_id, date, duration, notes) VALUES (?, ?, ?, ?)",
        [userId, date, duration, notes || null]
      );
      
      const workoutLogId = logResult.insertId;
      
      // Insert exercises
      for (const exercise of exercises) {
        await db.promise().query(
          "INSERT INTO fitness_exercises (workout_log_id, name, sets, reps, weight) VALUES (?, ?, ?, ?, ?)",
          [workoutLogId, exercise.name, exercise.sets, exercise.reps, exercise.weight || null]
        );
      }
      
      // Commit transaction
      await db.promise().query('COMMIT');
      
      // Return the created workout log with exercises
      const [workoutLog] = await db.promise().query(
        `SELECT 
          id, 
          DATE_FORMAT(date, '%Y-%m-%d') as date, 
          duration, 
          notes 
         FROM fitness_workout_logs 
         WHERE id = ?`,
        [workoutLogId]
      );
      
      const [exercisesList] = await db.promise().query(
        "SELECT id, name, sets, reps, weight FROM fitness_exercises WHERE workout_log_id = ?",
        [workoutLogId]
      );
      
      workoutLog[0].exercises = exercisesList;
      
      return workoutLog[0];
    } catch (error) {
      // Rollback transaction on error
      await db.promise().query('ROLLBACK');
      console.error('Error creating workout log:', error);
      throw error;
    }
  }

  // Create a new fitness goal
  static async createGoal(userId, goalData) {
    try {
      const { type, target, deadline, notes } = goalData;
      
      const [result] = await db.promise().query(
        "INSERT INTO fitness_goals (user_id, type, target, deadline, progress, notes) VALUES (?, ?, ?, ?, 0, ?)",
        [userId, type, target, deadline || null, notes || null]
      );
      
      return {
        id: result.insertId,
        type,
        target,
        deadline,
        progress: 0,
        notes
      };
    } catch (error) {
      console.error('Error creating fitness goal:', error);
      throw error;
    }
  }

  // Delete a workout log and associated exercises
  static async deleteWorkoutLog(id, userId) {
    try {
      // Start transaction
      await db.promise().query('START TRANSACTION');
      
      // Verify the workout log belongs to the user
      const [logs] = await db.promise().query(
        "SELECT id FROM fitness_workout_logs WHERE id = ? AND user_id = ?",
        [id, userId]
      );
      
      if (logs.length === 0) {
        await db.promise().query('ROLLBACK');
        return false;
      }
      
      // Delete all exercises for this workout log
      await db.promise().query(
        "DELETE FROM fitness_exercises WHERE workout_log_id = ?",
        [id]
      );
      
      // Delete the workout log
      await db.promise().query(
        "DELETE FROM fitness_workout_logs WHERE id = ?",
        [id]
      );
      
      // Commit transaction
      await db.promise().query('COMMIT');
      return true;
    } catch (error) {
      // Rollback transaction on error
      await db.promise().query('ROLLBACK');
      console.error('Error deleting workout log:', error);
      throw error;
    }
  }

  // Delete a fitness goal
  static async deleteGoal(id, userId) {
    try {
      // Verify the goal belongs to the user
      const [goals] = await db.promise().query(
        "SELECT id FROM fitness_goals WHERE id = ? AND user_id = ?",
        [id, userId]
      );
      
      if (goals.length === 0) {
        return false;
      }
      
      // Delete the goal
      await db.promise().query(
        "DELETE FROM fitness_goals WHERE id = ?",
        [id]
      );
      
      return true;
    } catch (error) {
      console.error('Error deleting fitness goal:', error);
      throw error;
    }
  }

  // Update goal progress
  static async updateGoalProgress(id, userId, progress) {
    try {
      // Verify the goal belongs to the user
      const [goals] = await db.promise().query(
        "SELECT id FROM fitness_goals WHERE id = ? AND user_id = ?",
        [id, userId]
      );
      
      if (goals.length === 0) {
        return false;
      }
      
      // Update the goal progress
      await db.promise().query(
        "UPDATE fitness_goals SET progress = ? WHERE id = ?",
        [progress, id]
      );
      
      return true;
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  }

  // Get fitness statistics for a user
  static async getStatsByUserId(userId) {
    try {
      // Get total workouts and duration
      const [workoutStats] = await db.promise().query(
        `SELECT 
          COUNT(*) as totalWorkouts,
          SUM(duration) as totalDuration
        FROM fitness_workout_logs
        WHERE user_id = ?`,
        [userId]
      );
      
      // Get latest weight and body fat
      const [latestWeight] = await db.promise().query(
        `SELECT value
         FROM fitness_weight
         WHERE user_id = ?
         ORDER BY date DESC
         LIMIT 1`,
        [userId]
      );
      
      const [latestBodyFat] = await db.promise().query(
        `SELECT value
         FROM fitness_body_fat
         WHERE user_id = ?
         ORDER BY date DESC
         LIMIT 1`,
        [userId]
      );
      
      // Get average water intake for the last 7 days
      const [waterStats] = await db.promise().query(
        `SELECT AVG(value) as avgWaterIntake
         FROM fitness_water_intake
         WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
        [userId]
      );
      
      return {
        totalWorkouts: workoutStats[0].totalWorkouts || 0,
        totalDuration: workoutStats[0].totalDuration || 0,
        avgDuration: workoutStats[0].totalWorkouts ? 
          Math.round(workoutStats[0].totalDuration / workoutStats[0].totalWorkouts) : 0,
        currentWeight: latestWeight.length > 0 ? latestWeight[0].value : null,
        currentBodyFat: latestBodyFat.length > 0 ? latestBodyFat[0].value : null,
        avgWaterIntake: waterStats[0].avgWaterIntake ? 
          Math.round(waterStats[0].avgWaterIntake) : 0
      };
    } catch (error) {
      console.error('Error getting fitness stats:', error);
      throw error;
    }
  }
}