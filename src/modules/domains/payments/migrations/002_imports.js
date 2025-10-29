import mongoose from 'mongoose';
import fs from 'fs';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Payment from '../payments.model.js';
import { connect } from '../../../../database/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse CSV line handling quoted values
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Read CSV file and return parsed data
async function readCSVFile(filePath, dataMapper) {
  return new Promise((resolve, reject) => {
    const data = [];
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let headers = [];
    let isFirstLine = true;

    rl.on('line', line => {
      if (isFirstLine) {
        // Parse headers (remove quotes)
        headers = parseCSVLine(line).map(h => h.replace(/^"|"$/g, ''));
        isFirstLine = false;
      } else if (line.trim()) {
        // Parse data rows
        const values = parseCSVLine(line).map(v => v.replace(/^"|"$/g, ''));
        const record = dataMapper(headers, values);

        // Only add if record is valid
        if (record) {
          data.push(record);
        }
      }
    });

    rl.on('close', () => {
      resolve(data);
    });

    rl.on('error', error => {
      reject(error);
    });
  });
}

// Map payment CSV data to payment object
function mapPaymentData(headers, values) {
  const payment = {};

  headers.forEach((header, index) => {
    const value = values[index];
    // Map CSV headers to model fields
    switch (header) {
      case 'order_id':
        payment.orderId = value || null;
        break;
      case 'payment_type':
        payment.type = value || null;
        break;
      case 'payment_installments':
        payment.installments = value ? parseInt(value) : 1;
        break;
      case 'payment_value':
        payment.value = value ? parseFloat(value) : null;
        break;
      // Skip payment_sequential
    }
  });

  // Only return if we have valid required fields
  return payment.orderId && payment.type && payment.value !== null ? payment : null;
}

async function runMigration() {
  try {
    console.log('Starting payments import migration...');

    // Connect to database
    await connect();
    console.log('Connected to database');

    // Path to CSV file
    const paymentsCSVPath = join(__dirname, '../files/olist_order_payments_dataset.csv');

    console.log(`Reading payments CSV from: ${paymentsCSVPath}`);

    // Check if file exists
    if (!fs.existsSync(paymentsCSVPath)) {
      throw new Error(`Payments CSV file not found at ${paymentsCSVPath}`);
    }

    // Read and parse CSV
    console.log('\nReading payments CSV...');
    const payments = await readCSVFile(paymentsCSVPath, mapPaymentData);
    console.log(`Parsed ${payments.length} payments from CSV`);

    if (payments.length === 0) {
      console.log('No payments to import');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Display payment type distribution
    const typeCount = payments.reduce((acc, payment) => {
      acc[payment.type] = (acc[payment.type] || 0) + 1;
      return acc;
    }, {});

    console.log('\nPayment types distribution:');
    Object.entries(typeCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`  - ${type}: ${count}`);
      });

    // Prepare bulk operations
    console.log('\nPreparing bulk operations...');
    const bulkOps = payments.map(payment => ({
      insertOne: {
        document: payment,
      },
    }));

    // Execute bulk write in batches to avoid memory issues
    const BATCH_SIZE = 1000;
    let totalInserted = 0;

    console.log(`Executing bulk operations in batches of ${BATCH_SIZE}...`);

    for (let i = 0; i < bulkOps.length; i += BATCH_SIZE) {
      const batch = bulkOps.slice(i, i + BATCH_SIZE);

      try {
        const result = await Payment.bulkWrite(batch, { ordered: false });

        totalInserted += result.insertedCount || 0;

        console.log(
          `  Batch ${Math.floor(i / BATCH_SIZE) + 1}: Processed ${Math.min(i + BATCH_SIZE, bulkOps.length)}/${bulkOps.length} payments`
        );
      } catch (error) {
        // Handle bulk write errors (e.g., duplicates or validation errors)
        if (error.result) {
          totalInserted += error.result.insertedCount || 0;

          console.log(
            `  Batch ${Math.floor(i / BATCH_SIZE) + 1}: Processed ${Math.min(i + BATCH_SIZE, bulkOps.length)}/${bulkOps.length} payments (with ${error.writeErrors?.length || 0} errors skipped)`
          );
        } else {
          throw error;
        }
      }
    }

    console.log(`\nBulk operation completed:`);
    console.log(`  - ${totalInserted} payments inserted`);

    // Display summary statistics
    const totalCount = await Payment.countDocuments();

    const typeCounts = await Payment.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const installmentStats = await Payment.aggregate([
      {
        $group: {
          _id: null,
          avgInstallments: { $avg: '$installments' },
          maxInstallments: { $max: '$installments' },
          minInstallments: { $min: '$installments' },
        },
      },
    ]);

    const valueStats = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$value' },
          avgValue: { $avg: '$value' },
          maxValue: { $max: '$value' },
          minValue: { $min: '$value' },
        },
      },
    ]);

    console.log(`\nDatabase summary:`);
    console.log(`  - Total payments: ${totalCount}`);
    console.log(`  - Payments by type:`);
    typeCounts.forEach(({ _id, count }) => {
      console.log(`    • ${_id}: ${count}`);
    });

    if (installmentStats.length > 0) {
      const stats = installmentStats[0];
      console.log(`  - Installments statistics:`);
      console.log(`    • Average: ${stats.avgInstallments.toFixed(2)}`);
      console.log(`    • Min: ${stats.minInstallments}`);
      console.log(`    • Max: ${stats.maxInstallments}`);
    }

    if (valueStats.length > 0) {
      const stats = valueStats[0];
      console.log(`  - Payment value statistics:`);
      console.log(`    • Total: R$ ${stats.totalValue.toFixed(2)}`);
      console.log(`    • Average: R$ ${stats.avgValue.toFixed(2)}`);
      console.log(`    • Min: R$ ${stats.minValue.toFixed(2)}`);
      console.log(`    • Max: R$ ${stats.maxValue.toFixed(2)}`);
    }

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
