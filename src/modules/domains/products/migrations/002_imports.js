import mongoose from 'mongoose';
import fs from 'fs';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Product from '../products.model.js';
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

async function readCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    const products = [];
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let headers = [];
    let isFirstLine = true;

    rl.on('line', line => {
      if (isFirstLine) {
        // Parse headers
        headers = parseCSVLine(line);
        isFirstLine = false;
      } else if (line.trim()) {
        // Parse data rows
        const values = parseCSVLine(line);
        const product = {};

        headers.forEach((header, index) => {
          const value = values[index];
          // Map CSV headers to model fields
          switch (header) {
            case 'product_id':
              product._id = value || null;
              break;
            case 'product_category_name':
              product.categoryName = value || null;
              break;
            case 'product_name_lenght':
              product.nameLength = value ? parseInt(value) : null;
              break;
            case 'product_description_lenght':
              product.descriptionLength = value ? parseInt(value) : null;
              break;
            case 'product_photos_qty':
              product.photosQty = value ? parseInt(value) : 0;
              break;
            case 'product_weight_g':
              product.weightG = value ? parseInt(value) : null;
              break;
            case 'product_length_cm':
              product.lengthCm = value ? parseInt(value) : null;
              break;
            case 'product_height_cm':
              product.heightCm = value ? parseInt(value) : null;
              break;
            case 'product_width_cm':
              product.widthCm = value ? parseInt(value) : null;
              break;
          }
        });

        // Only add if we have a valid _id
        if (product._id) {
          products.push(product);
        }
      }
    });

    rl.on('close', () => {
      resolve(products);
    });

    rl.on('error', error => {
      reject(error);
    });
  });
}

async function runMigration() {
  try {
    console.log('Starting products import migration...');

    // Connect to database
    await connect();
    console.log('Connected to database');

    // Path to CSV file
    const csvPath = join(__dirname, '../files/olist_products_dataset.csv');
    console.log(`Reading CSV from: ${csvPath}`);

    // Check if file exists
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at ${csvPath}`);
    }

    // Read and parse CSV
    const products = await readCSVFile(csvPath);
    console.log(`Parsed ${products.length} products from CSV`);

    if (products.length === 0) {
      console.log('No products to import');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Prepare bulk operations
    console.log('Preparing bulk operations...');
    const bulkOps = products.map(product => ({
      updateOne: {
        filter: { _id: product._id },
        update: { $set: product },
        upsert: true,
      },
    }));

    // Execute bulk write in batches to avoid memory issues
    const BATCH_SIZE = 1000;
    let totalInserted = 0;
    let totalUpdated = 0;
    let totalMatched = 0;

    console.log(`Executing bulk operations in batches of ${BATCH_SIZE}...`);

    for (let i = 0; i < bulkOps.length; i += BATCH_SIZE) {
      const batch = bulkOps.slice(i, i + BATCH_SIZE);
      const result = await Product.bulkWrite(batch, { ordered: false });

      totalInserted += result.upsertedCount || 0;
      totalUpdated += result.modifiedCount || 0;
      totalMatched += result.matchedCount || 0;

      console.log(
        `  Batch ${Math.floor(i / BATCH_SIZE) + 1}: Processed ${Math.min(i + BATCH_SIZE, bulkOps.length)}/${bulkOps.length} products`
      );
    }

    console.log(`\nBulk operation completed:`);
    console.log(`  - ${totalInserted} products created`);
    console.log(`  - ${totalUpdated} products updated`);
    console.log(`  - ${totalMatched} products matched`);

    // Display summary statistics
    const totalCount = await Product.countDocuments();
    const categories = await Product.distinct('categoryName');

    console.log(`\nDatabase summary:`);
    console.log(`  - Total products: ${totalCount}`);
    console.log(`  - Total categories: ${categories.length}`);

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
