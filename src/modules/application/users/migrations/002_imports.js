import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import fs from 'fs';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { faker } from '@faker-js/faker';
import User from '../users.model.js';
import Role from '../../roles/roles.model.js';
import { connect } from '../../../../database/index.js';
import { USER_STATUS } from '../users.constants.js';

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

// Map customers CSV data
function mapCustomerData(headers, values) {
  const customer = {};

  headers.forEach((header, index) => {
    const value = values[index];
    switch (header) {
      case 'customer_id':
        customer._id = value || null;
        break;
      case 'customer_zip_code_prefix':
        customer.zipCodePrefix = value || null;
        break;
      case 'customer_city':
        customer.city = value || null;
        break;
      case 'customer_state':
        customer.state = value || null;
        break;
      // Ignore customer_unique_id
    }
  });

  return customer._id ? customer : null;
}

// Map geolocation CSV data
function mapGeolocationData(headers, values) {
  const geo = {};

  headers.forEach((header, index) => {
    const value = values[index];
    switch (header) {
      case 'geolocation_zip_code_prefix':
        geo.zipCodePrefix = value || null;
        break;
      case 'geolocation_lat':
        geo.lat = value ? parseFloat(value) : null;
        break;
      case 'geolocation_lng':
        geo.lng = value ? parseFloat(value) : null;
        break;
      case 'geolocation_city':
        geo.city = value || null;
        break;
      case 'geolocation_state':
        geo.state = value || null;
        break;
    }
  });

  return geo.zipCodePrefix ? geo : null;
}

// Generate phone number with Brazil country code
function generateBrazilianPhone(customerId) {
  // Use customerId to create a unique but consistent phone number
  // Convert parts of customer_id to numbers for phone generation
  const part1 = (parseInt(customerId.substring(0, 2), 16) % 89) + 11; // Area code 11-99
  const part2 = parseInt(customerId.substring(2, 12), 16) % 100000; // 0-99999
  const part3 = parseInt(customerId.substring(12, 22), 16) % 10000; // 0-9999

  // Brazilian phone format: +55 (DDD) XXXXX-XXXX
  const areaCode = part1.toString().padStart(2, '0');
  const firstPart = part2.toString().padStart(5, '0');
  const secondPart = part3.toString().padStart(4, '0');

  return `+55${areaCode}${firstPart}${secondPart}`;
}

// Generate email from customer ID
function generateEmail(customerId) {
  // Use full customer_id to ensure unique email
  return `customer_${customerId}@olist.com`;
}

// Generate consistent user data based on customer ID
function generateUserData(customerId) {
  // Use customerId as seed for consistent faker data
  faker.seed(parseInt(customerId.substring(0, 8), 16));

  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: generateEmail(customerId),
    phone: generateBrazilianPhone(customerId),
    dateOfBirth: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }),
  };
}

async function runMigration() {
  try {
    console.log('Starting users import migration...');

    // Connect to database
    await connect();
    console.log('Connected to database');

    // Get User role
    console.log('\nFetching User role...');
    const userRole = await Role.findOne({ name: 'User' });

    if (!userRole) {
      throw new Error('User role not found. Please run roles migration first.');
    }
    console.log(`Found User role with ID: ${userRole._id}`);

    // Paths to CSV files
    const customersCSVPath = join(__dirname, '../files/olist_customers_dataset.csv');
    const geolocationCSVPath = join(__dirname, '../files/olist_geolocation_dataset.csv');

    console.log(`\nReading customers CSV from: ${customersCSVPath}`);
    console.log(`Reading geolocation CSV from: ${geolocationCSVPath}`);

    // Check if files exist
    if (!fs.existsSync(customersCSVPath)) {
      throw new Error(`Customers CSV file not found at ${customersCSVPath}`);
    }
    if (!fs.existsSync(geolocationCSVPath)) {
      throw new Error(`Geolocation CSV file not found at ${geolocationCSVPath}`);
    }

    // Read and parse customers CSV
    console.log('\nReading customers CSV...');
    const customers = await readCSVFile(customersCSVPath, mapCustomerData);
    console.log(`Parsed ${customers.length} customers from CSV`);

    if (customers.length === 0) {
      console.log('No customers to import');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Read and parse geolocation CSV
    console.log('\nReading geolocation CSV...');
    const geolocations = await readCSVFile(geolocationCSVPath, mapGeolocationData);
    console.log(`Parsed ${geolocations.length} geolocation records from CSV`);

    // Group geolocation data by zip code prefix (use first occurrence for each zip)
    console.log('\nGrouping geolocation data by zip code...');
    const geoByZip = new Map();

    geolocations.forEach(geo => {
      if (!geoByZip.has(geo.zipCodePrefix)) {
        geoByZip.set(geo.zipCodePrefix, geo);
      }
    });

    console.log(`Grouped ${geoByZip.size} unique zip codes`);

    // Create complete user objects
    console.log('\nGenerating user data with Faker...');
    const users = [];
    const defaultPassword = 'password123'; // Default password for all imported users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    let usersWithLocation = 0;
    let usersWithoutLocation = 0;

    for (const customer of customers) {
      // Generate fake user data
      const userData = generateUserData(customer._id);

      // Get geolocation data if available
      const geo = geoByZip.get(customer.zipCodePrefix);

      // Build user object
      const user = {
        _id: customer._id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        password: hashedPassword,
        dateOfBirth: userData.dateOfBirth,
        address: {
          city: customer.city || geo?.city || null,
          state: customer.state || geo?.state || null,
          country: 'Brazil',
          postalCode: customer.zipCodePrefix,
        },
        status: USER_STATUS.ACTIVE,
        isEmailVerified: true,
        isPhoneVerified: true,
        role: userRole._id,
      };

      // Add location coordinates if geolocation data is available
      if (geo && geo.lat && geo.lng) {
        user.address.location = {
          type: 'Point',
          coordinates: [geo.lng, geo.lat], // MongoDB expects [longitude, latitude]
        };
        usersWithLocation++;
      } else {
        usersWithoutLocation++;
      }

      users.push(user);
    }

    console.log(`Generated ${users.length} complete user objects`);
    console.log(`  - Users with location: ${usersWithLocation}`);
    console.log(`  - Users without location: ${usersWithoutLocation}`);

    // Prepare bulk operations
    console.log('\nPreparing bulk operations...');
    const bulkOps = users.map(user => ({
      updateOne: {
        filter: { _id: user._id },
        update: { $set: user },
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

      try {
        const result = await User.bulkWrite(batch, { ordered: false });

        totalInserted += result.upsertedCount || 0;
        totalUpdated += result.modifiedCount || 0;
        totalMatched += result.matchedCount || 0;

        console.log(
          `  Batch ${Math.floor(i / BATCH_SIZE) + 1}: Processed ${Math.min(i + BATCH_SIZE, bulkOps.length)}/${bulkOps.length} users`
        );
      } catch (error) {
        // Handle bulk write errors (e.g., duplicate keys)
        if (error.code === 11000 && error.result) {
          // Even with errors, some operations may have succeeded
          totalInserted += error.result.upsertedCount || 0;
          totalUpdated += error.result.modifiedCount || 0;
          totalMatched += error.result.matchedCount || 0;

          console.log(
            `  Batch ${Math.floor(i / BATCH_SIZE) + 1}: Processed ${Math.min(i + BATCH_SIZE, bulkOps.length)}/${bulkOps.length} users (with ${error.writeErrors?.length || 0} duplicates skipped)`
          );
        } else {
          throw error;
        }
      }
    }

    console.log(`\nBulk operation completed:`);
    console.log(`  - ${totalInserted} users created`);
    console.log(`  - ${totalUpdated} users updated`);
    console.log(`  - ${totalMatched} users matched`);

    // Display summary statistics
    const totalCount = await User.countDocuments();
    const statusCounts = await User.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const stateCounts = await User.aggregate([
      { $group: { _id: '$address.state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    console.log(`\nDatabase summary:`);
    console.log(`  - Total users: ${totalCount}`);
    console.log(`  - Users by status:`);
    statusCounts.forEach(({ _id, count }) => {
      console.log(`    • ${_id}: ${count}`);
    });

    console.log(`  - Top 10 states by user count:`);
    stateCounts.forEach(({ _id, count }) => {
      console.log(`    • ${_id || 'N/A'}: ${count}`);
    });

    console.log(`\n📝 Note: All imported users have the password: "${defaultPassword}"`);
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
