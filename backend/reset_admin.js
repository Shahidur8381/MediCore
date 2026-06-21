// Run this script to reset the admin password directly via Node.js
// Usage: node reset_admin.js

const bcrypt = require('bcryptjs');
const { initialize, executeQuery } = require('./config/db');

async function resetAdmin() {
  try {
    await initialize();
    
    // Generate a fresh hash
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    console.log('Generated hash:', hash);

    // Check if admin user exists
    const check = await executeQuery('SELECT User_ID, Password_Hash FROM USER_ACCOUNT WHERE Username = :u', ['admin']);
    
    if (check.rows.length === 0) {
      // Insert new admin
      await executeQuery(
        `INSERT INTO USER_ACCOUNT (Username, Password_Hash, Role, Status) VALUES (:u, :p, 'Admin', 'Active')`,
        { u: 'admin', p: hash }
      );
      console.log('Admin user CREATED successfully.');
    } else {
      // Update existing admin
      console.log('Current hash in DB:', check.rows[0].PASSWORD_HASH);
      await executeQuery(
        'UPDATE USER_ACCOUNT SET Password_Hash = :p WHERE Username = :u',
        { p: hash, u: 'admin' }
      );
      console.log('Admin password UPDATED successfully.');
    }

    // Verify it works
    const verify = await executeQuery('SELECT Password_Hash FROM USER_ACCOUNT WHERE Username = :u', ['admin']);
    const storedHash = verify.rows[0].PASSWORD_HASH;
    const matches = await bcrypt.compare(password, storedHash);
    console.log('Verification - password matches:', matches);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

resetAdmin();
