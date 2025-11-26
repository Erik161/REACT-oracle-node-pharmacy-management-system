import oracledb from 'oracledb';
import 'dotenv/config';

async function checkSchema() {
    let connection;

    try {
        connection = await oracledb.getConnection({
            user: process.env.ORACLE_USER || 'SYSTEM',
            password: process.env.ORACLE_PASSWORD || '1234',
            connectString: process.env.ORACLE_CONNECT_STRING || 'localhost:1521/xe',
        });

        console.log('Connected to Oracle DB');

        const tables = [
            'DEPARTAMENTO', 'MUNICIPIO', 'SUCURSAL', 'PUESTO', 'EMPLEADO',
            'PROVEEDOR', 'FABRICANTES', 'TIPO_PRODUCTO', 'PRODUCTO', 'INVENTARIO_SUCURSAL',
            'CLIENTE', 'TIPO_PEDIDO', 'PEDIDO', 'DETALLE_PEDIDO', 'ENTREGA',
            'FORMA_PAGO', 'VENTA', 'DETALLE_VENTA', 'TRASLADO', 'DETALLE_TRASLADO',
            'FLUJO_CAJA', 'TIPO_ACTIVO', 'ACTIVO_FIJO'
        ];

        for (const table of tables) {
            console.log(`\nChecking columns for ${table}...`);
            const result = await connection.execute(
                `SELECT column_name, data_type, data_default FROM user_tab_columns WHERE table_name = :t`,
                [table],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (result.rows.length === 0) {
                console.log(`Table ${table} not found (check case sensitivity or permissions)`);
            } else {
                result.rows.forEach(row => {
                    console.log(` - ${row.COLUMN_NAME} (${row.DATA_TYPE}) [Default: ${row.DATA_DEFAULT ? 'YES' : 'NO'}]`);
                });
            }
        }

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

checkSchema();
