import mongoose from 'mongoose';
import { connect } from '../../../../database/index.js';

async function runMigration() {
  try {
    console.log('Starting migration to remove businessId and indexes from roles...');

    // Connect to database
    await connect();
    console.log('Connected to database');

    const db = mongoose.connection.db;
    const collection = db.collection('roles');

    // Step 1: Drop all existing indexes except _id
    console.log('Dropping all indexes except _id...');
    const indexes = await collection.indexes();
    console.log(`Found ${indexes.length} indexes`);

    for (const index of indexes) {
      // Skip the _id index as it cannot be dropped
      if (index.name !== '_id_') {
        console.log(`Dropping index: ${index.name}`);
        await collection.dropIndex(index.name);
      }
    }

    // Step 2: Remove businessId field from all documents
    console.log('Removing businessId field from all role documents...');
    const result = await collection.updateMany(
      {},
      {
        $unset: { businessId: '' },
      }
    );

    console.log(`\nMigration completed successfully!`);
    console.log(`  - Dropped ${indexes.length - 1} indexes`);
    console.log(`  - Updated ${result.modifiedCount} documents`);

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
