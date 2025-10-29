import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../users.model.js';
import Role from '../../roles/roles.model.js';
import { connect } from '../../../../database/index.js';
import { USER_STATUS } from '../users.constants.js';

const USERS = [
  {
    firstName: 'John',
    lastName: 'User',
    phone: '+12345678901',
    email: 'user@example.com',
    password: 'password123',
    status: USER_STATUS.ACTIVE,
    isEmailVerified: true,
    isPhoneVerified: true,
    roleName: 'User',
  },
  {
    firstName: 'Alice',
    lastName: 'BusinessEmployee',
    phone: '+12345678902',
    email: 'businessemployee@example.com',
    password: 'password123',
    status: USER_STATUS.ACTIVE,
    isEmailVerified: true,
    isPhoneVerified: true,
    roleName: 'BusinessEmployee',
  },
  {
    firstName: 'Bob',
    lastName: 'BusinessManager',
    phone: '+12345678903',
    email: 'businessmanager@example.com',
    password: 'password123',
    status: USER_STATUS.ACTIVE,
    isEmailVerified: true,
    isPhoneVerified: true,
    roleName: 'BusinessManager',
  },
  {
    firstName: 'Charlie',
    lastName: 'BusinessAdmin',
    phone: '+12345678904',
    email: 'businessadmin@example.com',
    password: 'password123',
    status: USER_STATUS.ACTIVE,
    isEmailVerified: true,
    isPhoneVerified: true,
    roleName: 'BusinessAdmin',
  },
  {
    firstName: 'Diana',
    lastName: 'SuperEmployee',
    phone: '+12345678905',
    email: 'superemployee@example.com',
    password: 'password123',
    status: USER_STATUS.ACTIVE,
    isEmailVerified: true,
    isPhoneVerified: true,
    roleName: 'SuperEmployee',
  },
  {
    firstName: 'Edward',
    lastName: 'SuperManager',
    phone: '+12345678906',
    email: 'supermanager@example.com',
    password: 'password123',
    status: USER_STATUS.ACTIVE,
    isEmailVerified: true,
    isPhoneVerified: true,
    roleName: 'SuperManager',
  },
  {
    firstName: 'Fiona',
    lastName: 'SuperAdmin',
    phone: '+12345678907',
    email: 'superadmin@example.com',
    password: 'password123',
    status: USER_STATUS.ACTIVE,
    isEmailVerified: true,
    isPhoneVerified: true,
    roleName: 'SuperAdmin',
  },
];

async function runMigration() {
  try {
    console.log('Starting users migration...');

    // Connect to database
    await connect();
    console.log('Connected to database');

    // Drop old non-sparse geolocation index if it exists
    try {
      await User.collection.dropIndexes();
      console.log('Dropped old indexes');
    } catch (error) {
      if (error.code === 27) {
        console.log('Geolocation index does not exist, skipping drop');
      } else {
        throw error;
      }
    }

    // Get all roles
    const roles = await Role.find({});
    const roleMap = new Map(roles.map(role => [role.name, role._id]));

    console.log('Upserting users...');

    const bulkOps = [];

    for (const userData of USERS) {
      const { roleName, password, ...userFields } = userData;
      const roleId = roleMap.get(roleName);

      if (!roleId) {
        console.log(`  ⚠ Skipping user ${userData.firstName}: Role '${roleName}' not found`);
        continue;
      }

      // Hash password manually since bulkWrite bypasses pre-save hooks
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      bulkOps.push({
        updateOne: {
          filter: { email: userData.email },
          update: {
            $set: {
              ...userFields,
              password: hashedPassword,
              role: roleId,
            },
          },
          upsert: true,
        },
      });
    }

    const result = await User.bulkWrite(bulkOps);

    console.log(`\nBulk operation completed:`);
    console.log(`  - ${result.upsertedCount} users created`);
    console.log(`  - ${result.modifiedCount} users updated`);
    console.log(`  - ${result.matchedCount} users found`);

    // Fetch and display all users with role
    const allUsers = await User.find({}).populate('role', 'name').sort({ email: 1 });
    console.log(`\nAll users in database:`);
    allUsers.forEach(user => {
      console.log(
        `  - ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role?.name || 'N/A'}`
      );
    });

    console.log('\nMigration completed successfully!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export default runMigration;
