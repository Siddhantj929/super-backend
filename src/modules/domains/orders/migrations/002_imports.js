import mongoose from 'mongoose';
import fs from 'fs';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Order from '../orders.model.js';
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
        // Parse headers
        headers = parseCSVLine(line);
        isFirstLine = false;
      } else if (line.trim()) {
        // Parse data rows
        const values = parseCSVLine(line);
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

// Map orders CSV data to order object
function mapOrderData(headers, values) {
  const order = {};

  headers.forEach((header, index) => {
    const value = values[index];
    // Map CSV headers to model fields
    switch (header) {
      case 'order_id':
        order._id = value || null;
        break;
      case 'customer_id':
        order.customerId = value || null;
        break;
      case 'order_status':
        order.status = value || null;
        break;
      case 'order_purchase_timestamp':
        order.purchaseTimestamp = value ? new Date(value) : null;
        break;
      case 'order_approved_at':
        order.approvedAt = value ? new Date(value) : null;
        break;
      case 'order_delivered_carrier_date':
        order.deliveredCarrierDate = value ? new Date(value) : null;
        break;
      case 'order_delivered_customer_date':
        order.deliveredCustomerDate = value ? new Date(value) : null;
        break;
      case 'order_estimated_delivery_date':
        order.estimatedDeliveryDate = value ? new Date(value) : null;
        break;
    }
  });

  // Only return if we have a valid _id
  return order._id ? order : null;
}

// Map order items CSV data to item object
function mapOrderItemData(headers, values) {
  const item = {};

  headers.forEach((header, index) => {
    const value = values[index];
    // Map CSV headers to model fields
    switch (header) {
      case 'order_id':
        item.orderId = value || null;
        break;
      case 'product_id':
        item.productId = value || null;
        break;
      case 'shipping_limit_date':
        item.shippingLimitDate = value ? new Date(value) : null;
        break;
      case 'price':
        item.price = value ? parseFloat(value) : null;
        break;
      case 'freight_value':
        item.freightValue = value ? parseFloat(value) : null;
        break;
    }
  });

  // Only return if we have valid required fields
  return item.orderId && item.productId ? item : null;
}

async function runMigration() {
  try {
    console.log('Starting orders import migration...');

    // Connect to database
    await connect();
    console.log('Connected to database');

    // Paths to CSV files
    const ordersCSVPath = join(__dirname, '../files/olist_orders_dataset.csv');
    const itemsCSVPath = join(__dirname, '../files/olist_order_items_dataset.csv');

    console.log(`Reading orders CSV from: ${ordersCSVPath}`);
    console.log(`Reading order items CSV from: ${itemsCSVPath}`);

    // Check if files exist
    if (!fs.existsSync(ordersCSVPath)) {
      throw new Error(`Orders CSV file not found at ${ordersCSVPath}`);
    }
    if (!fs.existsSync(itemsCSVPath)) {
      throw new Error(`Order items CSV file not found at ${itemsCSVPath}`);
    }

    // Read and parse both CSV files
    console.log('\nReading orders CSV...');
    const orders = await readCSVFile(ordersCSVPath, mapOrderData);
    console.log(`Parsed ${orders.length} orders from CSV`);

    console.log('\nReading order items CSV...');
    const orderItems = await readCSVFile(itemsCSVPath, mapOrderItemData);
    console.log(`Parsed ${orderItems.length} order items from CSV`);

    if (orders.length === 0) {
      console.log('No orders to import');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Group items by order_id
    console.log('\nGrouping items by order_id...');
    const itemsByOrderId = new Map();

    orderItems.forEach(item => {
      const orderId = item.orderId;
      if (!itemsByOrderId.has(orderId)) {
        itemsByOrderId.set(orderId, []);
      }
      // Add item without the orderId field (it's not part of the item schema)
      itemsByOrderId.get(orderId).push({
        productId: item.productId,
        shippingLimitDate: item.shippingLimitDate,
        price: item.price,
        freightValue: item.freightValue,
      });
    });

    console.log(`Grouped items into ${itemsByOrderId.size} unique orders`);

    // Combine orders with their items
    console.log('\nCombining orders with items...');
    const completeOrders = [];
    let ordersWithoutItems = 0;
    let ordersWithItems = 0;

    orders.forEach(order => {
      const items = itemsByOrderId.get(order._id) || [];

      if (items.length > 0) {
        order.items = items;
        completeOrders.push(order);
        ordersWithItems++;
      } else {
        // Skip orders without items as per model validation
        ordersWithoutItems++;
      }
    });

    console.log(`  - Orders with items: ${ordersWithItems}`);
    console.log(`  - Orders without items (skipped): ${ordersWithoutItems}`);
    console.log(`  - Total orders to import: ${completeOrders.length}`);

    if (completeOrders.length === 0) {
      console.log('No complete orders to import');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Prepare bulk operations
    console.log('\nPreparing bulk operations...');
    const bulkOps = completeOrders.map(order => ({
      updateOne: {
        filter: { _id: order._id },
        update: { $set: order },
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
      const result = await Order.bulkWrite(batch, { ordered: false });

      totalInserted += result.upsertedCount || 0;
      totalUpdated += result.modifiedCount || 0;
      totalMatched += result.matchedCount || 0;

      console.log(
        `  Batch ${Math.floor(i / BATCH_SIZE) + 1}: Processed ${Math.min(i + BATCH_SIZE, bulkOps.length)}/${bulkOps.length} orders`
      );
    }

    console.log(`\nBulk operation completed:`);
    console.log(`  - ${totalInserted} orders created`);
    console.log(`  - ${totalUpdated} orders updated`);
    console.log(`  - ${totalMatched} orders matched`);

    // Display summary statistics
    const totalCount = await Order.countDocuments();
    const statusCounts = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    console.log(`\nDatabase summary:`);
    console.log(`  - Total orders: ${totalCount}`);
    console.log(`  - Orders by status:`);
    statusCounts.forEach(({ _id, count }) => {
      console.log(`    • ${_id}: ${count}`);
    });

    // Calculate total items
    const totalItemsResult = await Order.aggregate([{ $unwind: '$items' }, { $count: 'total' }]);
    const totalItems = totalItemsResult[0]?.total || 0;
    console.log(`  - Total order items: ${totalItems}`);

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
