const { initialize, executeQuery, getConnection } = require('./config/db');

async function checkColumns() {
    let connection;
    try {
        await initialize();
        connection = await getConnection();
        const result = await connection.execute("SELECT column_name FROM user_tab_columns WHERE table_name = 'LAB_TEST_RECORD'");
        console.log(result.rows);
    } catch(e) {
        console.log(e);
    } finally {
        if(connection) await connection.close();
        process.exit(0);
    }
}
checkColumns();
