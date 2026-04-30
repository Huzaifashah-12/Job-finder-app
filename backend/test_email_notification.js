import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from './models/Job.js';
import Company from './models/Company.js';
import Profile from './models/profile.js';
import User from './models/User.js';
import { createJob } from './controllers/jobController.js';

dotenv.config();

async function testNotification() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected.");

    // 1. Create/Find a test user & profile
    const testEmail = process.env.EMAIL_USER; // Send to themselves for testing
    console.log(`Setting up test profile for ${testEmail}...`);
    
    let user = await User.findOne({ email: testEmail });
    if (!user) {
      user = await User.create({
        fullName: "Test User",
        email: testEmail,
        password: "password123",
        role: "seeker"
      });
    }

    await Profile.findOneAndUpdate(
      { userId: user._id },
      { 
        category: "Frontend", 
        email: testEmail,
        fullName: "Test User"
      },
      { upsert: true, new: true }
    );

    // 2. Create/Find a test company
    console.log("Setting up test company...");
    let recruiter = await User.findOne({ email: "recruiter@test.com" });
    if (!recruiter) {
      recruiter = await User.create({
        fullName: "Test Recruiter",
        email: "recruiter@test.com",
        password: "password123",
        role: "recruiter"
      });
    }

    let company = await Company.findOne({ userId: recruiter._id });
    if (!company) {
      company = await Company.create({
        userId: recruiter._id,
        name: "Test Corp",
        location: "Remote"
      });
    }

    // 3. Trigger Job Creation (which should send email)
    console.log("Creating a new Frontend job to trigger notification...");
    
    // Mock req and res for the controller
    const req = {
      user: recruiter,
      body: {
        title: "Senior Frontend Developer",
        type: "Full Time",
        description: "We are looking for a React expert to join our team.",
        location: "Remote"
      }
    };

    const res = {
      status: (code) => ({
        json: (data) => console.log(`Response Code: ${code}, Data:`, data)
      }),
      json: (data) => console.log("Response Data:", data)
    };

    await createJob(req, res);

    console.log("\n--- TEST COMPLETE ---");
    console.log("Check your server console for 'Email sent' or 'Email notification (simulation)' messages.");
    console.log("If you used a real Gmail App Password, check your inbox at:", testEmail);

    await mongoose.disconnect();
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}

testNotification();
