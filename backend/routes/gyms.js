const express = require('express');
const router = express.Router();
const Gym = require('../models/Gym');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/gyms
// @desc    Get all gyms with optional search filters
router.get('/', async (req, res) => {
  try {
    const { search, city, facility } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    if (facility) {
      query.facilities = facility; // match if contains facility
    }

    const gyms = await Gym.find(query).populate('owner', 'name email');
    res.json(gyms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/gyms/:id
// @desc    Get single gym by ID
router.get('/:id', async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id).populate('owner', 'name email');
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found.' });
    }
    res.json(gym);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/gyms
// @desc    Create a new gym (Owner or Admin only)
router.post('/', protect, authorize(['owner', 'admin']), async (req, res) => {
  const { name, description, address, city, lat, lng, capacity, facilities, images } = req.body;

  try {
    if (!name || !description || !address || !city || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: 'Missing required gym parameters.' });
    }

    const gym = await Gym.create({
      name,
      description,
      address,
      city,
      coordinates: { lat, lng },
      capacity: capacity || 100,
      facilities: facilities || [],
      images: images || [],
      owner: req.user.id,
      classes: []
    });

    res.status(201).json(gym);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/gyms/:id
// @desc    Update a gym (Owner or Admin only)
router.put('/:id', protect, authorize(['owner', 'admin']), async (req, res) => {
  try {
    let gym = await Gym.findById(req.params.id);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found.' });
    }

    // Check ownership
    if (gym.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You do not own this gym.' });
    }

    const { name, description, address, city, lat, lng, capacity, facilities, images } = req.body;
    gym.name = name || gym.name;
    gym.description = description || gym.description;
    gym.address = address || gym.address;
    gym.city = city || gym.city;
    if (lat !== undefined && lng !== undefined) {
      gym.coordinates = { lat, lng };
    }
    gym.capacity = capacity || gym.capacity;
    gym.facilities = facilities || gym.facilities;
    gym.images = images || gym.images;

    await gym.save();
    res.json(gym);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/gyms/:id
// @desc    Delete a gym (Owner or Admin only)
router.delete('/:id', protect, authorize(['owner', 'admin']), async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found.' });
    }

    // Check ownership
    if (gym.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You do not own this gym.' });
    }

    await Gym.findByIdAndDelete(req.params.id);
    res.json({ message: 'Gym deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/gyms/:id/favorite
// @desc    Toggle bookmark favorite gym (Members only)
router.post('/:id/favorite', protect, authorize(['member']), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const gym = await Gym.findById(req.params.id);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found.' });
    }

    const index = user.favoriteGyms.indexOf(gym._id);
    if (index > -1) {
      // Remove from favorite
      user.favoriteGyms.splice(index, 1);
      await user.save();
      res.json({ isFavorite: false, message: 'Removed from favorites' });
    } else {
      // Add to favorite
      user.favoriteGyms.push(gym._id);
      await user.save();
      res.json({ isFavorite: true, message: 'Added to favorites' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/gyms/:id/classes
// @desc    Add class to a gym (Owner or Admin only)
router.post('/:id/classes', protect, authorize(['owner', 'admin']), async (req, res) => {
  const { name, instructor, time, capacity } = req.body;
  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found.' });
    }

    if (gym.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You do not own this gym.' });
    }

    if (!name || !instructor || !time) {
      return res.status(400).json({ message: 'Class name, instructor, and time are required.' });
    }

    const newClass = {
      name,
      instructor,
      time,
      capacity: capacity || 20,
      bookedUsers: []
    };

    gym.classes.push(newClass);
    await gym.save();

    res.status(201).json(gym.classes[gym.classes.length - 1]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
