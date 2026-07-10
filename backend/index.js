require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const connectDB = require('./db');

// Models
const User = require('./models/User');
const Gym = require('./models/Gym');
const Booking = require('./models/Booking');
const CheckIn = require('./models/CheckIn');
const Payment = require('./models/Payment');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/gyms', require('./routes/gyms'));
app.use('/api/checkin', require('./routes/checkin'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/memberships', require('./routes/memberships'));
app.use('/api/analytics', require('./routes/analytics'));

// Seed Function
const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding initial data...');

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('password123', salt);

      // Create Admin
      const admin = await User.create({
        name: 'Platform Admin',
        email: 'admin@fitagg.com.au',
        passwordHash,
        role: 'admin'
      });

      // Create Owners
      const owner1 = await User.create({
        name: 'Sarah GymOwner',
        email: 'owner1@fitagg.com.au',
        passwordHash,
        role: 'owner'
      });

      const owner2 = await User.create({
        name: 'John GymOwner',
        email: 'owner2@fitagg.com.au',
        passwordHash,
        role: 'owner'
      });

      // Create Members
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 30);

      const activeMember = await User.create({
        name: 'Alex Active',
        email: 'member@fitagg.com.au',
        passwordHash,
        role: 'member',
        membership: {
          plan: 'premium',
          status: 'active',
          startDate,
          endDate
        }
      });

      const newMember = await User.create({
        name: 'Chloe Casual',
        email: 'newmember@fitagg.com.au',
        passwordHash,
        role: 'member',
        membership: {
          plan: 'none',
          status: 'inactive'
        }
      });

      console.log('Seeded Users: admin@fitagg.com.au, owner1@fitagg.com.au, owner2@fitagg.com.au, member@fitagg.com.au, newmember@fitagg.com.au');

      // Create Gyms
      const gym1 = await Gym.create({
        name: 'Sydney Fitness Hub',
        description: 'A premium fitness hub located in the heart of Sydney. Features cutting-edge equipment, a steam room, and certified coaches.',
        address: '123 George St',
        city: 'Sydney',
        coordinates: { lat: -33.8688, lng: 151.2093 },
        rating: 4.8,
        capacity: 150,
        facilities: ['Cardio Area', 'Free Weights', 'Sauna', 'Yoga Studio'],
        images: [
          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
        ],
        owner: owner1._id,
        classes: [
          { name: 'Yoga Flow', instructor: 'Sophia Lin', time: '07:00 AM - 08:00 AM', capacity: 15 },
          { name: 'HIIT Blitz', instructor: 'Marcus Aurelius', time: '12:00 PM - 12:45 PM', capacity: 20 },
          { name: 'Strength Lab', instructor: 'Dan Peterson', time: '06:00 PM - 07:00 PM', capacity: 15 }
        ]
      });

      const gym2 = await Gym.create({
        name: 'Bondi Beach Gym',
        description: 'Outdoor-focused functional training zone right on Bondi Beach. Sweat with an ocean view!',
        address: '45 Campbell Parade',
        city: 'Sydney',
        coordinates: { lat: -33.8915, lng: 151.2767 },
        rating: 4.6,
        capacity: 80,
        facilities: ['Cardio Area', 'Free Weights', 'Pool', '24/7 Access'],
        images: [
          'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80'
        ],
        owner: owner1._id,
        classes: [
          { name: 'Beach Body Camp', instructor: 'Chris Hemsworth', time: '06:00 AM - 07:00 AM', capacity: 30 },
          { name: 'Aqua Aerobics', instructor: 'Jane Miller', time: '10:00 AM - 11:00 AM', capacity: 20 }
        ]
      });

      const gym3 = await Gym.create({
        name: 'Melbourne Athletic Club',
        description: "Melbourne's flagship premium gym featuring state-of-the-art weights, crossfit rig, and dynamic spin classes.",
        address: '56 Collins St',
        city: 'Melbourne',
        coordinates: { lat: -37.8136, lng: 144.9631 },
        rating: 4.9,
        capacity: 200,
        facilities: ['Cardio Area', 'Free Weights', 'Sauna', 'Steam Room', 'Spin Studio', '24/7 Access'],
        images: [
          'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80'
        ],
        owner: owner2._id,
        classes: [
          { name: 'Spin Revolution', instructor: 'Rachel Green', time: '06:30 AM - 07:15 AM', capacity: 25 },
          { name: 'Crossfit WOD', instructor: 'David Goggins', time: '05:30 PM - 06:30 PM', capacity: 15 }
        ]
      });

      console.log('Seeded Gyms: Sydney Fitness Hub, Bondi Beach Gym, Melbourne Athletic Club');

      // Seed dummy transaction for initial members
      await Payment.create({
        user: activeMember._id,
        amount: 79.99,
        planName: 'premium',
        status: 'success',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      });
    }
  } catch (err) {
    console.error('Error seeding database:', err.message);
  }
};

// Start Server
const PORT = process.env.PORT || 5000;
connectDB().then(async () => {
  await seedDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
