import oracledb from 'oracledb';
import 'dotenv/config';

async function checkNullability() {
    let connection;

    try {
        connection = await oracledb.getConnection({
            user: process.env.ORACLE_USER || 'SYSTEM',
            password: process.env.ORACLE_PASSWORD || '1234',
            connectString: process.env.ORACLE_CONNECT_STRING || 'localhost:1521/xe',
        });

        console.log('Connected to Oracle DB');

        const result = await connection.execute(
            `SELECT column_name, nullable FROM user_tab_columns WHERE table_name = 'VENTA' AND column_name = 'ID_CLIENTE'`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        console.log(result.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

checkNullability();
