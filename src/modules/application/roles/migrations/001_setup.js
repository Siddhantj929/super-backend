import mongoose from 'mongoose';
import Role from '../roles.model.js';
import { connect } from '../../../../database/index.js';
import { ROLE_STATUS } from '../roles.constants.js';

const ROLES = [
  {
    name: 'Guest',
    status: ROLE_STATUS.ACTIVE,
    permissions: [
      // Auth - Login only
      'POST /auth/login/email-password',
      'GET /docs*',
    ],
  },
  {
    name: 'User',
    status: ROLE_STATUS.ACTIVE,
    permissions: [
      // Auth
      'POST /auth/refresh',
      'POST /auth/logout',
      // Basic user profile access
      'GET /users/me',
      'PATCH /users/me',
      'PATCH /users/me/disable',
    ],
  },
  {
    name: 'BusinessEmployee',
    status: ROLE_STATUS.ACTIVE,
    permissions: [
      // Auth
      'POST /auth/refresh',
      'POST /auth/logout',
      // Self management
      'GET /users/me',
      'PATCH /users/me',
      'PATCH /users/me/disable',
      // View other users
      'GET /users',
      'GET /users/:id',
      // View roles
      'GET /roles',
      'GET /roles/:id',
      'GET /roles/business/:businessId',
      'GET /roles/name/:name',
    ],
  },
  {
    name: 'BusinessManager',
    status: ROLE_STATUS.ACTIVE,
    permissions: [
      // Auth
      'POST /auth/refresh',
      'POST /auth/logout',
      // Everything BusinessEmployee has
      'GET /users/me',
      'PATCH /users/me',
      'PATCH /users/me/disable',
      'GET /users',
      'GET /users/:id',
      'GET /users/role/:roleId',
      'GET /users/status/:status',
      // User management within business
      'PATCH /users/:id',
      // Role viewing
      'GET /roles',
      'GET /roles/:id',
      'GET /roles/business/:businessId',
      'GET /roles/created-by/:userId',
      'GET /roles/name/:name',
      'GET /roles/permission/:permission',
    ],
  },
  {
    name: 'BusinessAdmin',
    status: ROLE_STATUS.ACTIVE,
    permissions: [
      // Auth
      'POST /auth/refresh',
      'POST /auth/logout',
      // Full business user management
      'GET /users/me',
      'PATCH /users/me',
      'PATCH /users/me/disable',
      'GET /users',
      'GET /users/:id',
      'GET /users/role/:roleId',
      'GET /users/status/:status',
      'GET /users/email/:email',
      'GET /users/phone/:phone',
      'PATCH /users/:id',
      'PATCH /users/:id/password',
      'PATCH /users/:id/disable',
      // Role management within business
      'GET /roles',
      'GET /roles/:id',
      'GET /roles/business/:businessId',
      'GET /roles/created-by/:userId',
      'GET /roles/name/:name',
      'GET /roles/permission/:permission',
      'POST /roles',
      'PATCH /roles/:id',
      'PATCH /roles/:id/permissions',
    ],
  },
  {
    name: 'SuperEmployee',
    status: ROLE_STATUS.ACTIVE,
    permissions: [
      // Auth
      'POST /auth/refresh',
      'POST /auth/logout',
      // View all users across all businesses
      'GET /users/me',
      'PATCH /users/me',
      'PATCH /users/me/disable',
      'GET /users',
      'GET /users/:id',
      'GET /users/role/:roleId',
      'GET /users/status/:status',
      'GET /users/email/:email',
      'GET /users/phone/:phone',
      // View all roles
      'GET /roles',
      'GET /roles/:id',
      'GET /roles/business/:businessId',
      'GET /roles/created-by/:userId',
      'GET /roles/name/:name',
      'GET /roles/permission/:permission',
      // Orders (view and manage, no delete)
      'GET /orders',
      'GET /orders/me',
      'PATCH /orders/me/:id',
      'PATCH /orders/me/:id/disable',
      'GET /orders/customer/:customerId',
      'GET /orders/status/:status',
      'GET /orders/:id',
      'POST /orders',
      'PATCH /orders/:id',
      'PATCH /orders/:id/disable',
      // Payments (view and manage, no delete)
      'GET /payments',
      'GET /payments/me',
      'PATCH /payments/me/:id',
      'GET /payments/order/:orderId',
      'GET /payments/type/:type',
      'GET /payments/:id',
      'POST /payments',
      'PATCH /payments/:id',
      // Products (view and manage, no delete)
      'GET /products',
      'GET /products/me',
      'PATCH /products/me/:id',
      'PATCH /products/me/:id/disable',
      'GET /products/category/:categoryName',
      'GET /products/created-by/:userId',
      'GET /products/status/:status',
      'GET /products/:id',
      'POST /products',
      'PATCH /products/:id',
      'PATCH /products/:id/disable',
    ],
  },
  {
    name: 'SuperManager',
    status: ROLE_STATUS.ACTIVE,
    permissions: [
      // Auth
      'POST /auth/refresh',
      'POST /auth/logout',
      // Read and update users across the system
      'GET /users/me',
      'PATCH /users/me',
      'PATCH /users/me/disable',
      'GET /users',
      'GET /users/:id',
      'GET /users/role/:roleId',
      'GET /users/status/:status',
      'GET /users/email/:email',
      'GET /users/phone/:phone',
      'PATCH /users/:id',
      'PATCH /users/:id/verify-email',
      'PATCH /users/:id/verify-phone',
      'PATCH /users/:id/disable',
      // Manage all roles
      'GET /roles',
      'GET /roles/:id',
      'GET /roles/business/:businessId',
      'GET /roles/created-by/:userId',
      'GET /roles/name/:name',
      'GET /roles/permission/:permission',
      'POST /roles',
      'PATCH /roles/:id',
      'PATCH /roles/:id/disable',
      'PATCH /roles/:id/permissions',
      // Orders (full access including delete)
      'GET /orders',
      'GET /orders/me',
      'PATCH /orders/me/:id',
      'PATCH /orders/me/:id/disable',
      'GET /orders/customer/:customerId',
      'GET /orders/status/:status',
      'GET /orders/:id',
      'POST /orders',
      'PATCH /orders/:id',
      'DELETE /orders/:id',
      'PATCH /orders/:id/disable',
      // Payments (full access)
      'GET /payments',
      'GET /payments/me',
      'PATCH /payments/me/:id',
      'GET /payments/order/:orderId',
      'GET /payments/type/:type',
      'GET /payments/:id',
      'POST /payments',
      'PATCH /payments/:id',
      // Products (full access including delete)
      'GET /products',
      'GET /products/me',
      'PATCH /products/me/:id',
      'PATCH /products/me/:id/disable',
      'GET /products/category/:categoryName',
      'GET /products/created-by/:userId',
      'GET /products/status/:status',
      'GET /products/:id',
      'POST /products',
      'PATCH /products/:id',
      'DELETE /products/:id',
      'PATCH /products/:id/disable',
    ],
  },
  {
    name: 'SuperAdmin',
    status: ROLE_STATUS.ACTIVE,
    permissions: [
      // Auth
      'POST /auth/refresh',
      'POST /auth/logout',
      // Full access to all users
      'GET /users/me',
      'PATCH /users/me',
      'PATCH /users/me/disable',
      'GET /users',
      'GET /users/:id',
      'GET /users/role/:roleId',
      'GET /users/status/:status',
      'GET /users/email/:email',
      'GET /users/phone/:phone',
      'POST /users',
      'PATCH /users/:id',
      'PATCH /users/:id/password',
      'PATCH /users/:id/verify-email',
      'PATCH /users/:id/verify-phone',
      'DELETE /users/:id',
      'PATCH /users/:id/disable',
      // Full access to all roles
      'GET /roles',
      'GET /roles/:id',
      'GET /roles/business/:businessId',
      'GET /roles/created-by/:userId',
      'GET /roles/name/:name',
      'GET /roles/permission/:permission',
      'POST /roles',
      'PATCH /roles/:id',
      'PATCH /roles/:id/disable',
      'PATCH /roles/:id/permissions',
      'DELETE /roles/:id',
      // Orders (full access including delete)
      'GET /orders',
      'GET /orders/me',
      'PATCH /orders/me/:id',
      'PATCH /orders/me/:id/disable',
      'GET /orders/customer/:customerId',
      'GET /orders/status/:status',
      'GET /orders/:id',
      'POST /orders',
      'PATCH /orders/:id',
      'DELETE /orders/:id',
      'PATCH /orders/:id/disable',
      // Payments (full access)
      'GET /payments',
      'GET /payments/me',
      'PATCH /payments/me/:id',
      'GET /payments/order/:orderId',
      'GET /payments/type/:type',
      'GET /payments/:id',
      'POST /payments',
      'PATCH /payments/:id',
      // Products (full access including delete)
      'GET /products',
      'GET /products/me',
      'PATCH /products/me/:id',
      'PATCH /products/me/:id/disable',
      'GET /products/category/:categoryName',
      'GET /products/created-by/:userId',
      'GET /products/status/:status',
      'GET /products/:id',
      'POST /products',
      'PATCH /products/:id',
      'DELETE /products/:id',
      'PATCH /products/:id/disable',
    ],
  },
];

async function runMigration() {
  try {
    console.log('Starting roles migration...');

    // Connect to database
    await connect();
    console.log('Connected to database');

    // Upsert roles using bulk operations
    console.log('Upserting roles...');

    const bulkOps = ROLES.map(roleData => ({
      updateOne: {
        filter: { name: roleData.name },
        update: {
          $set: {
            status: roleData.status,
            permissions: roleData.permissions,
          },
        },
        upsert: true,
      },
    }));

    const result = await Role.bulkWrite(bulkOps);

    console.log(`\nBulk operation completed:`);
    console.log(`  - ${result.upsertedCount} roles created`);
    console.log(`  - ${result.modifiedCount} roles updated`);
    console.log(`  - ${result.matchedCount} roles found`);

    // Fetch and display all roles
    const allRoles = await Role.find({}).sort({ name: 1 });
    console.log(`\nAll roles in database:`);
    allRoles.forEach(role => {
      console.log(`  - ${role.name} (${role.permissions.length} permissions)`);
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
