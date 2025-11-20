import dotenv from 'dotenv';
import oracledb from 'oracledb';

dotenv.config();

async function checkMissingTables() {
    let connection;

    try {
        connection = await oracledb.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONNECT_STRING
        });

        const tables = [
            'TIPO_PRODUCTO',
            'FORMA_PAGO',
            'TIPO_PEDIDO',
            'PUESTO',
            'DEPARTAMENTO',
            'MUNICIPIO',
            'TIPO_ACTIVO',
            'ACTIVO_FIJO',
            'DETALLE_TRASLADO'
        ];

        for (const tableName of tables) {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`Table: ${tableName}`);
            console.log('='.repeat(60));

            const result = await connection.execute(
                `SELECT COLUMN_NAME, DATA_TYPE, NULLABLE, DATA_DEFAULT
         FROM USER_TAB_COLUMNS
         WHERE TABLE_NAME = :tableName
         ORDER BY COLUMN_ID`,
                [tableName]
            );

            if (result.rows.length === 0) {
                console.log(`❌ Table ${tableName} does not exist or has no columns`);
            } else {
                console.log('\nColumns:');
                result.rows.forEach(row => {
                    console.log(`  - ${row[0]} (${row[1]}) ${row[2] === 'N' ? 'NOT NULL' : 'NULLABLE'}${row[3] ? ` DEFAULT: ${row[3]}` : ''}`);
                });
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

checkMissingTables();
