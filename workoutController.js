const Workout = require('../models/workoutModel');

// Get all workouts for the logged-in user
exports.getUserWorkouts = async (req, res) => {
  try {
    const userId = req.user.id;
    const workouts = await Workout.findAllByUserId(userId);
    
    // Format data to match frontend expectations
    const formattedWorkouts = workouts.map(workout => ({
      id: workout.id,
      trainerId: workout.trainer_id,
      name: workout.name,
      description: workout.description,
      duration: workout.duration,
      date: workout.date.toISOString().split('T')[0],
      category: workout.category,
      trainer: workout.trainer,
      equipment: workout.equipment,
      location: workout.location
    }));
    
    res.status(200).json({ workouts: formattedWorkouts });
  } catch (error) {
    console.error('Error getting workouts:', error);
    res.status(500).json({ message: 'Failed to get workouts' });
  }
};

// Get a single workout by ID
exports.getWorkoutById = async (req, res) => {
  try {
    const userId = req.user.id;
    const workoutId = req.params.id;
    
    const workout = await Workout.findById(workoutId, userId);
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    // Format data to match frontend expectations
    const formattedWorkout = {
      id: workout.id,
      trainerId: workout.trainer_id,
      name: workout.name,
      description: workout.description,
      duration: workout.duration,
      date: workout.date.toISOString().split('T')[0],
      category: workout.category,
      trainer: workout.trainer,
      equipment: workout.equipment,
      location: workout.location
    };
    
    res.status(200).json({ workout: formattedWorkout });
  } catch (error) {
    console.error('Error getting workout:', error);
    res.status(500).json({ message: 'Failed to get workout' });
  }
};

// Create a new workout
exports.createWorkout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      trainerId, 
      name, 
      description, 
      duration, 
      date, 
      category, 
      equipment, 
      location 
    } = req.body;
    
    // Create workout object
    const workoutData = {
      trainer_id: trainerId,
      name,
      description,
      duration,
      date,
      category,
      equipment,
      location,
      user_id: userId
    };
    
    const newWorkout = await Workout.create(workoutData);
    
    // Get trainer name for the response
    const workouts = await Workout.findById(newWorkout.id, userId);
    
    // Format response
    const formattedWorkout = {
      id: workouts.id,
      trainerId: workouts.trainer_id,
      name: workouts.name,
      description: workouts.description,
      duration: workouts.duration,
      date: workouts.date.toISOString().split('T')[0],
      category: workouts.category,
      trainer: workouts.trainer,
      equipment: workouts.equipment,
      location: workouts.location
    };
    
    res.status(201).json({ workout: formattedWorkout });
  } catch (error) {
    console.error('Error creating workout:', error);
    res.status(500).json({ message: 'Failed to create workout' });
  }
};

// Update a workout
exports.updateWorkout = async (req, res) => {
  try {
    const userId = req.user.id;
    const workoutId = req.params.id;
    const { 
      trainerId, 
      name, 
      description, 
      duration, 
      date, 
      category, 
      equipment, 
      location 
    } = req.body;
    
    // Update workout object
    const workoutData = {
      trainer_id: trainerId,
      name,
      description,
      duration,
      date,
      category,
      equipment,
      location
    };
    
    const updatedWorkout = await Workout.update(workoutId, userId, workoutData);
    
    if (!updatedWorkout) {
      return res.status(404).json({ message: 'Workout not found or unauthorized' });
    }
    
    // Get updated workout with trainer name
    const workout = await Workout.findById(workoutId, userId);
    
    // Format response
    const formattedWorkout = {
      id: workout.id,
      trainerId: workout.trainer_id,
      name: workout.name,
      description: workout.description,
      duration: workout.duration,
      date: workout.date.toISOString().split('T')[0],
      category: workout.category,
      trainer: workout.trainer,
      equipment: workout.equipment,
      location: workout.location
    };
    
    res.status(200).json({ workout: formattedWorkout });
  } catch (error) {
    console.error('Error updating workout:', error);
    res.status(500).json({ message: 'Failed to update workout' });
  }
};

// Delete a workout
exports.deleteWorkout = async (req, res) => {
  try {
    const userId = req.user.id;
    const workoutId = req.params.id;
    
    const result = await Workout.delete(workoutId, userId);
    
    if (!result) {
      return res.status(404).json({ message: 'Workout not found or unauthorized' });
    }
    
    res.status(200).json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Error deleting workout:', error);
    res.status(500).json({ message: 'Failed to delete workout' });
  }
};