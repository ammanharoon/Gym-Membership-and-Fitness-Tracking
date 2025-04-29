const db = require('../config/db');

class Workout {
  static findAllByUserId(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT w.*, t.name as trainer 
        FROM workouts w
        LEFT JOIN trainers t ON w.trainer_id = t.id
        WHERE w.user_id = ?
        ORDER BY w.date DESC
      `;
      
      db.query(query, [userId], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  static findById(id, userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT w.*, t.name as trainer 
        FROM workouts w
        LEFT JOIN trainers t ON w.trainer_id = t.id
        WHERE w.id = ? AND w.user_id = ?
      `;
      
      db.query(query, [id, userId], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results[0]);
      });
    });
  }

  static create(workoutData) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO workouts 
        (trainer_id, name, description, duration, date, category, equipment, location, user_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        workoutData.trainer_id,
        workoutData.name,
        workoutData.description,
        workoutData.duration,
        workoutData.date,
        workoutData.category,
        workoutData.equipment,
        workoutData.location,
        workoutData.user_id
      ];
      
      db.query(query, values, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve({ id: results.insertId, ...workoutData });
      });
    });
  }

  static update(id, userId, workoutData) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE workouts
        SET trainer_id = ?,
            name = ?,
            description = ?,
            duration = ?,
            date = ?,
            category = ?,
            equipment = ?,
            location = ?
        WHERE id = ? AND user_id = ?
      `;
      
      const values = [
        workoutData.trainer_id,
        workoutData.name,
        workoutData.description,
        workoutData.duration,
        workoutData.date,
        workoutData.category,
        workoutData.equipment,
        workoutData.location,
        id,
        userId
      ];
      
      db.query(query, values, (err, results) => {
        if (err) {
          return reject(err);
        }
        
        if (results.affectedRows === 0) {
          return resolve(null);
        }
        
        resolve({ id, ...workoutData });
      });
    });
  }

  static delete(id, userId) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM workouts WHERE id = ? AND user_id = ?';
      
      db.query(query, [id, userId], (err, results) => {
        if (err) {
          return reject(err);
        }
        
        if (results.affectedRows === 0) {
          return resolve(false);
        }
        
        resolve(true);
      });
    });
  }
}

module.exports = Workout;