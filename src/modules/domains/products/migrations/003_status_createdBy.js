import mongoose from 'mongoose';
import Product from '../products.model.js';
import { connect } from '../../../../database/index.js';
import { PRODUCT_STATUS } from '../products.constants.js';

async function runMigration() {
  try {
    console.log('Starting products status update migration...');

    // Connect to database
    await connect();
    console.log('Connected to database');

    // Get count before update
    const totalProductsBefore = await Product.countDocuments();
    console.log(`Total products in database: ${totalProductsBefore}`);

    if (totalProductsBefore === 0) {
      console.log('No products to update');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Update all products to set status to active
    console.log('Updating all products with active status...');
    const result = await Product.updateMany(
      {}, // No filter - update all products
      {
        $set: {
          status: PRODUCT_STATUS.ACTIVE,
        },
      }
    );

    console.log(`\nUpdate operation completed:`);
    console.log(`  - ${result.matchedCount} products matched`);
    console.log(`  - ${result.modifiedCount} products modified`);
    console.log(
      `  - ${result.acknowledged ? 'Operation acknowledged' : 'Operation not acknowledged'}`
    );

    // Display summary statistics by status
    const statusCounts = await Product.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    console.log(`\nDatabase summary by status:`);
    statusCounts.forEach(item => {
      console.log(`  - ${item._id || 'null'}: ${item.count} products`);
    });

    const totalProductsAfter = await Product.countDocuments();
    console.log(`\nTotal products in database: ${totalProductsAfter}`);

    console.log('\nMigration completed successfully!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export default runMigration;
