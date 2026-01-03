require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Donation = require('./models/Donation');

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});
    // await Donation.deleteMany({});
    // console.log('🗑️  Cleared existing data');

    // Create/update test users (ensures the password is valid for bcrypt compare)
    const plainPassword = 'test123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    const seedUsers = [
      {
        name: 'Test User',
        email: 'user@test.com',
        password: hashedPassword,
        role: 'USER',
        phone: '1234567890',
        isVerified: true,
        impactScore: 100,
      },
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'ADMIN',
        phone: '9876543210',
        isVerified: true,
        impactScore: 500,
      },
      {
        name: 'NGO Partner',
        email: 'ngo@test.com',
        password: hashedPassword,
        role: 'NGO',
        phone: '5555555555',
        isVerified: true,
        impactScore: 1000,
      },
    ];

    const users = [];
    for (const seedUser of seedUsers) {
      const updated = await User.findOneAndUpdate(
        { email: seedUser.email.toLowerCase().trim() },
        { $set: seedUser },
        { new: true, upsert: true, runValidators: true }
      );
      users.push(updated);
    }

    console.log('✅ Seed users ready (created/updated):');
    users.forEach((user) => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    // Create sample donations
    const donations = await Donation.create([
      {
        itemType: 'DONATE_FOOD',
        description: 'Fresh vegetables and canned goods available for pickup',
        quantity: '10 kg',
        contactPhone: '1234567890',
        postedBy: users[0].email,
        location: {
          type: 'Point',
          coordinates: [77.5946, 12.9716], // Bangalore coordinates [longitude, latitude]
        },
      },
      {
        itemType: 'DONATE_CLOTHES',
        description: 'Winter jackets and warm clothes in good condition',
        quantity: '5 items',
        contactPhone: '1234567890',
        postedBy: users[0].email,
        location: {
          type: 'Point',
          coordinates: [77.6033, 12.9698],
        },
      },
      {
        itemType: 'REQUEST_BLOOD',
        description: 'Urgently need O+ blood for surgery',
        quantity: '2 units',
        contactPhone: '9876543210',
        postedBy: users[1].email,
        location: {
          type: 'Point',
          coordinates: [77.6095, 12.9345],
        },
      },
    ]);

    console.log(`✅ Created ${donations.length} sample donations`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Test credentials:');
    console.log('   User: user@test.com / test123');
    console.log('   Admin: admin@test.com / test123');
    console.log('   NGO: ngo@test.com / test123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

seedDatabase();
