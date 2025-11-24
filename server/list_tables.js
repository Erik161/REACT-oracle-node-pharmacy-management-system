import oracledb from 'oracledb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try loading .env from server directory
const envPath = join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    const parentEnvPath = join(__dirname, '..', '.env');
    if (fs.existsSync(parentEnvPath)) {
        dotenv.config({ path: parentEnvPath });
    }
}

const dbConfig = {
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECTION_STRING,
};

async function listTables() {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        console.log('Connected to Oracle DB');

        const result = await connection.execute(
            `SELECT table_name FROM user_tables ORDER BY table_name`
        );

        console.log('Tables in Schema:');
        result.rows.forEach(row => console.log(row[0]));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
}

listTables();
