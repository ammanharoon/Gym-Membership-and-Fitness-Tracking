// src/config/initDb.js
const db = require('./db');

/**
 * Initialize all fitness tracking tables for the database
 * @returns {Promise<boolean>} Success or failure
 */
const initializeFitnessTables = async () => {
  try {
    console.log('Initializing fitness tracking tables...');
    
    // All tables should already exist in your MySQL database from your SQL script
    // Let's verify they exist
    
    const tables = [
      'fitness_weight',
      'fitness_body_fat',
      'fitness_water_intake',
      'fitness_workout_logs',
      'fitness_exercises',
      'fitness_goals'
    ];
    
    for (const table of tables) {
      try {
        // Try to query the table to see if it exists
        await db.promise().query(`SELECT 1 FROM ${table} LIMIT 1`);
        console.log(`✅ Table ${table} exists and is accessible`);
      } catch (error) {
        console.error(`❌ Table ${table} error:`, error.message);
        // If table doesn't exist, we won't create it here since you already have
        // the SQL script that creates these tables
      }
    }
    
    console.log('Fitness tracking tables initialization check completed');
    return true;
  } catch (error) {
    console.error('Error initializing fitness tracking tables:', error);
    return false;
  }
};

module.exports = { initializeFitnessTables };