import { User, UserRole } from '../models/user.model';
import { sequelize } from '../models';
import dotenv from 'dotenv';
import path from 'path';
import readline from 'readline';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function createAdmin() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    // Get admin details from user input
    console.log('📝 Enter admin user details:');
    console.log('----------------------------------------');
    
    const email = await question('Email (default: admin@example.com): ');
    const adminEmail = email || 'admin@example.com';
    
    const password = await question('Password (default: Admin123!@#): ');
    const adminPassword = password || 'Admin123!@#';
    
    const confirmPassword = await question('Confirm password: ');
    
    // Validate password
    if (confirmPassword && adminPassword !== confirmPassword) {
      console.log('❌ Passwords do not match!');
      rl.close();
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: adminEmail },
    });

    if (existingUser) {
      if (existingUser.role === UserRole.ADMIN) {
        console.log(`\n⚠️ Admin user already exists: ${adminEmail}`);
        console.log(`👤 Role: ${existingUser.role}`);
        console.log(`📧 Email: ${existingUser.email}`);
        console.log(`✅ Status: ${existingUser.is_active ? 'Active' : 'Inactive'}`);
        rl.close();
        process.exit(0);
      } else {
        // Update user to admin role
        existingUser.role = UserRole.ADMIN;
        await existingUser.save();
        console.log(`\n✅ Updated user to admin role: ${adminEmail}`);
        rl.close();
        process.exit(0);
      }
    }

    // Create admin user
    const admin = await User.create({
      email: adminEmail,
      password: adminPassword,
      role: UserRole.ADMIN,
      is_active: true,
      email_verified_at: new Date(), // Auto-verified
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('----------------------------------------');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log(`👤 Role: ${admin.role}`);
    console.log(`✅ Email Verified: ${admin.email_verified_at ? 'Yes' : 'No'}`);
    console.log(`🟢 Status: ${admin.is_active ? 'Active' : 'Inactive'}`);
    console.log('----------------------------------------');
    console.log('⚠️ Please save these credentials securely!');

    rl.close();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error creating admin:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Run the script
createAdmin();
