// src/controllers/fitnessTrackingController.js
const db = require('../config/db');

// Get all fitness metrics for a user
exports.getUserMetrics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get weight entries
    const [weightEntries] = await db.promise().query(
      "SELECT id, value, DATE_FORMAT(date, '%Y-%m-%d') as date FROM fitness_weight WHERE user_id = ? ORDER BY date",
      [userId]
    );
    
    // Get body fat entries
    const [bodyFatEntries] = await db.promise().query(
      "SELECT id, value, DATE_FORMAT(date, '%Y-%m-%d') as date FROM fitness_body_fat WHERE user_id = ? ORDER BY date",
      [userId]
    );
    
    // Get water intake entries
    const [waterIntakeEntries] = await db.promise().query(
      "SELECT id, value, DATE_FORMAT(date, '%Y-%m-%d') as date FROM fitness_water_intake WHERE user_id = ? ORDER BY date",
      [userId]
    );
    
    // Get workout logs
    const [workoutLogs] = await db.promise().query(
      `SELECT 
        wl.id, 
        DATE_FORMAT(wl.date, '%Y-%m-%d') as date, 
        wl.duration, 
        wl.notes 
      FROM fitness_workout_logs wl 
      WHERE wl.user_id = ? 
      ORDER BY wl.date DESC`,
      [userId]
    );
    
    // Get exercises for each workout log
    for (const log of workoutLogs) {
      const [exercises] = await db.promise().query(
        `SELECT 
          id, 
          name, 
          sets, 
          reps, 
          weight 
        FROM fitness_exercises 
        WHERE workout_log_id = ?`,
        [log.id]
      );
      
      log.exercises = exercises;
    }
    
    // Get fitness goals
    const [goals] = await db.promise().query(
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
    
    // Return all fitness data
    res.status(200).json({
      weight: weightEntries,
      bodyFat: bodyFatEntries,
      workoutLogs: workoutLogs,
      goals: goals,
      waterIntake: waterIntakeEntries
    });
    
  } catch (error) {
    console.error('Error getting fitness metrics:', error);
    res.status(500).json({ message: 'Failed to get fitness metrics' });
  }
};

// Add a weight entry
exports.addWeightEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const { value, date } = req.body;
    
    if (!value) {
      return res.status(400).json({ message: 'Weight value is required' });
    }
    
    // Use current date if not specified
    const entryDate = date || new Date().toISOString().split('T')[0];
    
    // Insert weight entry
    const [result] = await db.promise().query(
      "INSERT INTO fitness_weight (user_id, value, date) VALUES (?, ?, ?)",
      [userId, value, entryDate]
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      value, 
      date: entryDate 
    });
    
  } catch (error) {
    console.error('Error adding weight entry:', error);
    res.status(500).json({ message: 'Failed to add weight entry' });
  }
};

// Add a body fat entry
exports.addBodyFatEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const { value, date } = req.body;
    
    if (!value) {
      return res.status(400).json({ message: 'Body fat value is required' });
    }
    
    // Use current date if not specified
    const entryDate = date || new Date().toISOString().split('T')[0];
    
    // Insert body fat entry
    const [result] = await db.promise().query(
      "INSERT INTO fitness_body_fat (user_id, value, date) VALUES (?, ?, ?)",
      [userId, value, entryDate]
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      value, 
      date: entryDate 
    });
    
  } catch (error) {
    console.error('Error adding body fat entry:', error);
    res.status(500).json({ message: 'Failed to add body fat entry' });
  }
};

// Add a water intake entry
exports.addWaterIntake = async (req, res) => {
  try {
    const userId = req.user.id;
    const { value, date } = req.body;
    
    if (!value) {
      return res.status(400).json({ message: 'Water intake value is required' });
    }
    
    // Use current date if not specified
    const entryDate = date || new Date().toISOString().split('T')[0];
    
    // Check if entry for today already exists
    const [existingEntries] = await db.promise().query(
      "SELECT id, value FROM fitness_water_intake WHERE user_id = ? AND date = ?",
      [userId, entryDate]
    );
    
    if (existingEntries.length > 0) {
      // Update the existing entry by adding the new value
      const newValue = parseInt(existingEntries[0].value) + parseInt(value);
      
      await db.promise().query(
        "UPDATE fitness_water_intake SET value = ? WHERE id = ?",
        [newValue, existingEntries[0].id]
      );
      
      return res.status(200).json({ 
        id: existingEntries[0].id, 
        value: newValue, 
        date: entryDate 
      });
    }
    
    // Insert new water intake entry
    const [result] = await db.promise().query(
      "INSERT INTO fitness_water_intake (user_id, value, date) VALUES (?, ?, ?)",
      [userId, value, entryDate]
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      value, 
      date: entryDate 
    });
    
  } catch (error) {
    console.error('Error adding water intake:', error);
    res.status(500).json({ message: 'Failed to add water intake' });
  }
};

// Add a workout log with exercises
exports.addWorkoutLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, duration, notes, exercises } = req.body;
    
    if (!duration || !exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({ message: 'Duration and exercises are required' });
    }
    
    // Use current date if not specified
    const logDate = date || new Date().toISOString().split('T')[0];
    
    // Start transaction
    await db.promise().query('START TRANSACTION');
    
    // Insert workout log
    const [logResult] = await db.promise().query(
      "INSERT INTO fitness_workout_logs (user_id, date, duration, notes) VALUES (?, ?, ?, ?)",
      [userId, logDate, duration, notes || null]
    );
    
    const workoutLogId = logResult.insertId;
    
    // Insert exercises
    for (const exercise of exercises) {
      await db.promise().query(
        "INSERT INTO fitness_exercises (workout_log_id, name, sets, reps, weight) VALUES (?, ?, ?, ?, ?)",
        [workoutLogId, exercise.name, exercise.sets, exercise.reps, exercise.weight]
      );
    }
    
    // Commit transaction
    await db.promise().query('COMMIT');
    
    // Get the complete workout log with exercises
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
    
    res.status(201).json(workoutLog[0]);
    
  } catch (error) {
    // Rollback transaction on error
    await db.promise().query('ROLLBACK');
    console.error('Error adding workout log:', error);
    res.status(500).json({ message: 'Failed to add workout log' });
  }
};

// Add a fitness goal
exports.addGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, target, deadline, notes } = req.body;
    
    if (!type || !target) {
      return res.status(400).json({ message: 'Goal type and target are required' });
    }
    
    // Insert goal with initial progress of 0
    const [result] = await db.promise().query(
      "INSERT INTO fitness_goals (user_id, type, target, deadline, progress, notes) VALUES (?, ?, ?, ?, 0, ?)",
      [userId, type, target, deadline || null, notes || null]
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      type, 
      target, 
      deadline, 
      progress: 0, 
      notes 
    });
    
  } catch (error) {
    console.error('Error adding fitness goal:', error);
    res.status(500).json({ message: 'Failed to add fitness goal' });
  }
};

// Delete a workout log
exports.deleteWorkoutLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const logId = req.params.id;
    
    // Start transaction
    await db.promise().query('START TRANSACTION');
    
    // Verify the workout log belongs to the user
    const [logs] = await db.promise().query(
      "SELECT id FROM fitness_workout_logs WHERE id = ? AND user_id = ?",
      [logId, userId]
    );
    
    if (logs.length === 0) {
      await db.promise().query('ROLLBACK');
      return res.status(404).json({ message: 'Workout log not found or unauthorized' });
    }
    
    // Delete all exercises for this workout log
    await db.promise().query(
      "DELETE FROM fitness_exercises WHERE workout_log_id = ?",
      [logId]
    );
    
    // Delete the workout log
    await db.promise().query(
      "DELETE FROM fitness_workout_logs WHERE id = ?",
      [logId]
    );
    
    // Commit transaction
    await db.promise().query('COMMIT');
    
    res.status(200).json({ message: 'Workout log deleted successfully' });
    
  } catch (error) {
    // Rollback transaction on error
    await db.promise().query('ROLLBACK');
    console.error('Error deleting workout log:', error);
    res.status(500).json({ message: 'Failed to delete workout log' });
  }
};

// Delete a goal
exports.deleteGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;
    
    // Verify the goal belongs to the user
    const [goals] = await db.promise().query(
      "SELECT id FROM fitness_goals WHERE id = ? AND user_id = ?",
      [goalId, userId]
    );
    
    if (goals.length === 0) {
      return res.status(404).json({ message: 'Goal not found or unauthorized' });
    }
    
    // Delete the goal
    await db.promise().query(
      "DELETE FROM fitness_goals WHERE id = ?",
      [goalId]
    );
    
    res.status(200).json({ message: 'Goal deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ message: 'Failed to delete goal' });
  }
};

// Update goal progress
exports.updateGoalProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;
    const { progress } = req.body;
    
    if (progress === undefined) {
      return res.status(400).json({ message: 'Progress value is required' });
    }
    
    // Verify the goal belongs to the user
    const [goals] = await db.promise().query(
      "SELECT id FROM fitness_goals WHERE id = ? AND user_id = ?",
      [goalId, userId]
    );
    
    if (goals.length === 0) {
      return res.status(404).json({ message: 'Goal not found or unauthorized' });
    }
    
    // Update the goal progress
    await db.promise().query(
      "UPDATE fitness_goals SET progress = ? WHERE id = ?",
      [progress, goalId]
    );
    
    res.status(200).json({ message: 'Goal progress updated successfully' });
    
  } catch (error) {
    console.error('Error updating goal progress:', error);
    res.status(500).json({ message: 'Failed to update goal progress' });
  }
};

// Calculate stats for user dashboard
exports.getFitnessStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
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
    
    // Return stats
    res.status(200).json({
      totalWorkouts: workoutStats[0].totalWorkouts || 0,
      totalDuration: workoutStats[0].totalDuration || 0,
      avgDuration: workoutStats[0].totalWorkouts ? 
        Math.round(workoutStats[0].totalDuration / workoutStats[0].totalWorkouts) : 0,
      currentWeight: latestWeight.length > 0 ? latestWeight[0].value : null,
      currentBodyFat: latestBodyFat.length > 0 ? latestBodyFat[0].value : null,
      avgWaterIntake: waterStats[0].avgWaterIntake ? 
        Math.round(waterStats[0].avgWaterIntake) : 0
    });
    
  } catch (error) {
    console.error('Error calculating fitness stats:', error);
    res.status(500).json({ message: 'Failed to calculate fitness stats' });
  }
};