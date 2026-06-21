const oracledb = require('oracledb');
require('dotenv').config();

// Oracle 11g requires Thick mode (Thin mode only supports 12.1+)
try {
  oracledb.initOracleClient();
  console.log('Oracle Thick mode initialized.');
} catch (err) {
  console.warn('Thick mode unavailable, using Thin mode:', err.message);
}

// Ensure oracledb returns rows as objects instead of arrays
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

async function initialize() {
  try {
    await oracledb.createPool({
      user: process.env.DB_USER || 'MediCore',
      password: process.env.DB_PASSWORD || 'MediCore',
      connectString: process.env.DB_CONNECTION_STRING || 'localhost:1521/XE',
      poolMin: 1,
      poolMax: 4,
      poolIncrement: 1
    });
    console.log('Oracle Database Connection Pool initialized.');
    return true;
  } catch (err) {
    console.error('FATAL: Could not initialize Oracle pool:', err.message);
    return false;
  }
}

// Execute a single query (auto-manages connection lifecycle)
async function executeQuery(sql, binds = [], options = {}) {
  let connection;
  try {
    connection = await oracledb.getConnection();
    
    const execOptions = {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: options.autoCommit !== undefined ? options.autoCommit : true,
      ...options
    };

    const result = await connection.execute(sql, binds, execOptions);
    return result;
  } catch (err) {
    console.error('Error executing query: ', err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection: ', err);
      }
    }
  }
}

// Get a raw connection for multi-statement transactions
async function getConnection() {
  return await oracledb.getConnection();
}

module.exports = {
  initialize,
  executeQuery,
  getConnection,
};
