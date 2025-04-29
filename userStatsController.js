// backend/src/controllers/userStatsController.js
const db = require('../config/db');

exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // SQL to get user workout stats
    const query = `
      SELECT 
        COUNT(*) as completedWorkouts,
        COALESCE(SUM(duration), 0) as totalDuration,
        COALESCE(COUNT(DISTINCT DATE_FORMAT(date, '%Y-%m-%d')), 0) as uniqueDays
      FROM workouts
      WHERE user_id = ? 
        AND date <= CURDATE()
    `;
    
    // Execute the query
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Error fetching user stats:', err);
        return res.status(500).json({ message: 'Failed to get user stats' });
      }
      
      const stats = results[0];
      
      // Calculate estimated calories (just a simple estimate)
      const caloriesBurned = Math.round(stats.totalDuration * 8); // Rough estimate
      
      // Count monthly visits (workouts in the last 30 days)
      const monthlyQuery = `
        SELECT COUNT(*) as monthlyVisits
        FROM workouts
        WHERE user_id = ? 
          AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
          AND date <= CURDATE()
      `;
      
      db.query(monthlyQuery, [userId], (err, monthlyResults) => {
        if (err) {
          console.error('Error fetching monthly stats:', err);
          return res.status(500).json({ message: 'Failed to get monthly stats' });
        }
        
        // Calculate current streak (consecutive days with workouts)
        const streakQuery = `
          WITH DateSequence AS (
            SELECT date
            FROM workouts
            WHERE user_id = ?
              AND date <= CURDATE()
            GROUP BY date
            ORDER BY date DESC
          ),
          StreakDates AS (
            SELECT 
              date,
              @rank := @rank + 1 as rank,
              DATE_SUB(date, INTERVAL @rank DAY) as group_date
            FROM DateSequence, (SELECT @rank := 0) r
          ),
          Streaks AS (
            SELECT 
              COUNT(*) as streak_length,
              MIN(date) as streak_start,
              MAX(date) as streak_end
            FROM StreakDates
            GROUP BY group_date
            ORDER BY streak_end DESC
          )
          SELECT streak_length
          FROM Streaks
          LIMIT 1
        `;
        
        db.query(streakQuery, [userId], (err, streakResults) => {
          if (err) {
            console.error('Error calculating streak:', err);
            
            // Continue with other stats even if streak calculation fails
            return res.status(200).json({
              completedWorkouts: stats.completedWorkouts,
              monthlyVisits: monthlyResults[0].monthlyVisits,
              avgDuration: Math.round(stats.totalDuration / (stats.completedWorkouts || 1)),
              streak: 0, // Default if calculation fails
              caloriesBurned
            });
          }
          
          const streak = streakResults.length > 0 ? streakResults[0].streak_length : 0;
          
          // Return all stats
          res.status(200).json({
            completedWorkouts: stats.completedWorkouts,
            monthlyVisits: monthlyResults[0].monthlyVisits,
            avgDuration: Math.round(stats.totalDuration / (stats.completedWorkouts || 1)),
            streak,
            caloriesBurned
          });
        });
      });
    });
  } catch (error) {
    console.error('Error in getUserStats:', error);
    res.status(500).json({ message: 'Failed to get user stats' });
  }
};