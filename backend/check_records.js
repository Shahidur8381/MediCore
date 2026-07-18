const { initialize, executeQuery, getConnection } = require('./config/db');

async function checkRecords() {
    let connection;
    try {
        await initialize();
        connection = await getConnection();
        const result = await connection.execute("SELECT * FROM LAB_TEST_RECORD WHERE Status = 'Completed'");
        console.log(result.rows);
    } catch(e) {
        console.log(e);
    } finally {
        if(connection) await connection.close();
        process.exit(0);
    }
}
checkRecords();
