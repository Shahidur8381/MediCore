const db = require('./config/db.js');
const bcrypt = require('bcryptjs');

async function run() {
  try {
    const initialized = await db.initialize();
    if (!initialized) { console.error('DB init failed'); process.exit(1); }

    // Add Queue_Number column
    try {
      await db.executeQuery('ALTER TABLE APPOINTMENT ADD Queue_Number NUMBER DEFAULT 0');
      console.log('Queue_Number column added');
    } catch (e) {
      if (e.message.includes('ORA-01430')) console.log('Queue_Number column already exists');
      else throw e;
    }

    // Create Lab user account
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('lab123', salt);

    try {
      await db.executeQuery(
        "INSERT INTO USER_ACCOUNT (Username, Password_Hash, Role) VALUES (:1, :2, :3)",
        ['lab', hash, 'Lab']
      );
      console.log('Lab user created: lab / lab123');
    } catch (e) {
      if (e.message.includes('ORA-00001')) console.log('Lab user already exists');
      else console.error('Lab user error:', e.message);
    }

    console.log('Migration done!');
  } catch (e) {
    console.error('Fatal:', e.message);
  }
  process.exit();
}
run();
