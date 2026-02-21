const mongoose = require('mongoose');
require('dotenv').config();
const Expert = require('../models/Expert');

function generateWeekSlots() {
  const slots = [];
  const timeSlots = [
    { startTime: '09:00', endTime: '10:00' },
    { startTime: '10:00', endTime: '11:00' },
    { startTime: '11:00', endTime: '12:00' },
    { startTime: '13:00', endTime: '14:00' },
    { startTime: '14:00', endTime: '15:00' },
    { startTime: '15:00', endTime: '16:00' },
    { startTime: '16:00', endTime: '17:00' }
  ];

  for (let i = 1; i <= 7; i++) {
    const date = new Date(Date.now() + i * 86400000);
    const dateString = date.toISOString().split('T')[0];
    const numSlots = Math.floor(Math.random() * 3) + 3; 
    const selectedSlots = [];
    const usedIndices = new Set();
    
    while (selectedSlots.length < numSlots) {
      const randomIndex = Math.floor(Math.random() * timeSlots.length);
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex);
        const rand = Math.random();
        let status = 'Available';
        let isAvailable = true;
        
        if (rand < 0.1) { status = 'Pending'; isAvailable = false; }
        else if (rand < 0.2) { status = 'Confirmed'; isAvailable = false; }
        
        selectedSlots.push({
          ...timeSlots[randomIndex],
          isAvailable,
          status
        });
      }
    }
    slots.push({
      date: dateString,
      timeSlots: selectedSlots.sort((a, b) => a.startTime.localeCompare(b.startTime))
    });
  }
  return slots;
}

const expertsData = [
  // MEDICAL
  { name: 'Dr. Sarah Johnson', category: 'Medical', experience: 10, rating: 4.8, bio: 'Specializing in general practice and preventive care.', consultationFee: 150, availableSlots: generateWeekSlots() },
  { name: 'Dr. Lisa Anderson', category: 'Medical', experience: 7, rating: 4.5, bio: 'Dermatologist with expertise in skin care.', consultationFee: 180, availableSlots: generateWeekSlots() },
  { name: 'Dr. James Wilson', category: 'Medical', experience: 12, rating: 4.9, bio: 'Pediatric specialist with 12 years of experience.', consultationFee: 160, availableSlots: generateWeekSlots() },
  
  // LEGAL
  { name: 'John Smith', category: 'Legal', experience: 15, rating: 4.9, bio: 'Senior legal advisor in corporate law.', consultationFee: 300, availableSlots: generateWeekSlots() },
  { name: 'Elena Rodriguez', category: 'Legal', experience: 9, rating: 4.7, bio: 'Expert in immigration and family law.', consultationFee: 220, availableSlots: generateWeekSlots() },
  { name: 'Robert Taylor', category: 'Legal', experience: 20, rating: 5.0, bio: 'Criminal defense attorney with a high success rate.', consultationFee: 350, availableSlots: generateWeekSlots() },

  // TECHNOLOGY
  { name: 'Emily Davis', category: 'Technology', experience: 8, rating: 4.7, bio: 'Cloud infrastructure and DevOps consultant.', consultationFee: 200, availableSlots: generateWeekSlots() },
  { name: 'Marcus Chen', category: 'Technology', experience: 5, rating: 4.6, bio: 'Full-stack developer and AI architecture specialist.', consultationFee: 150, availableSlots: generateWeekSlots() },
  { name: 'Sophia White', category: 'Technology', experience: 11, rating: 4.8, bio: 'Cybersecurity expert and ethical hacker.', consultationFee: 275, availableSlots: generateWeekSlots() },

  // FINANCE
  { name: 'Michael Brown', category: 'Finance', experience: 12, rating: 4.6, bio: 'Investment and retirement planning advisor.', consultationFee: 250, availableSlots: generateWeekSlots() },
  { name: 'David Miller', category: 'Finance', experience: 14, rating: 4.4, bio: 'Tax consultant and forensic accountant.', consultationFee: 190, availableSlots: generateWeekSlots() },
  { name: 'Amanda Lee', category: 'Finance', experience: 6, rating: 4.7, bio: 'Personal finance coach and wealth manager.', consultationFee: 120, availableSlots: generateWeekSlots() },

  // MARKETING / BUSINESS
  { name: 'Karen Gils', category: 'Marketing', experience: 8, rating: 4.3, bio: 'SEO and Digital Marketing strategist.', consultationFee: 130, availableSlots: generateWeekSlots() },
  { name: 'Tom Harris', category: 'Business', experience: 18, rating: 4.9, bio: 'Executive coach for startup founders.', consultationFee: 400, availableSlots: generateWeekSlots() },
  { name: 'Nina Patel', category: 'Marketing', experience: 4, rating: 4.5, bio: 'Social media branding expert.', consultationFee: 100, availableSlots: generateWeekSlots() }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    await Expert.deleteMany({});
    console.log('🗑️  Cleared existing experts');
    const experts = await Expert.insertMany(expertsData);
    console.log(`✅ Seeded ${experts.length} experts! You should now see 3 pages on your frontend.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding:', error);
    process.exit(1);
  }
}

seed();