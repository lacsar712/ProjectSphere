/**
 * Seed demo accounts for local / Docker one-click startup.
 * Safe to re-run: skips existing emails.
 */
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { connectDB } from './config/db.js';
import { Admin } from './models/Admin.model.js';
import { Hod } from './models/Hod.model.js';
import { Faculty } from './models/Faculty.model.js';
import { Student } from './models/Student.model.js';

dotenv.config();

const DEFAULT_PASSWORD = process.env.SEED_PASSWORD || 'Admin@1234';

const accounts = [
  {
    Model: Admin,
    data: {
      name: 'System Admin',
      email: process.env.ADMIN_EMAIL || 'admin@projectsphere.com',
      mobileNumber: '9000000001',
      role: 'admin',
      isEmailVerified: true,
      isApproved: true,
    },
  },
  {
    Model: Hod,
    data: {
      name: 'Demo HOD',
      email: 'hod@projectsphere.com',
      mobileNumber: '9000000002',
      role: 'hod',
      department: 'Computer Science',
      isEmailVerified: true,
      isApproved: true,
    },
  },
  {
    Model: Faculty,
    data: {
      name: 'Demo Faculty',
      email: 'faculty@projectsphere.com',
      mobileNumber: '9000000003',
      role: 'faculty',
      department: 'Computer Science',
      designation: 'Assistant Professor',
      employeeId: 'FAC-001',
      isEmailVerified: true,
      isApproved: true,
    },
  },
  {
    Model: Student,
    data: {
      name: 'Demo Student',
      email: 'student@projectsphere.com',
      mobileNumber: '9000000004',
      role: 'student',
      course: 'B.Tech',
      branch: 'Computer Science',
      year: '4',
      section: 'A',
      enrollmentNumber: 'CS-2022-001',
      isEmailVerified: true,
      isApproved: true,
    },
  },
];

async function seed() {
  try {
    await connectDB();
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);

    for (const { Model, data } of accounts) {
      const exists = await Model.findOne({ email: data.email });
      if (exists) {
        console.log(`[SEED] Skip existing: ${data.email} (${data.role})`);
        continue;
      }
      await Model.create({ ...data, password: hashedPassword });
      console.log(`[SEED] Created: ${data.email} (${data.role})`);
    }

    console.log(`[SEED] Done. Default password for seeded accounts: ${DEFAULT_PASSWORD}`);
    process.exit(0);
  } catch (err) {
    console.error('[SEED] Failed:', err.message);
    process.exit(1);
  }
}

seed();
