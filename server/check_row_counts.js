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
    console.log('Loading .env from:', envPath);
    dotenv.config({ path: envPath });
} else {
    console.log('.env not found at:', envPath);
    // Try parent directory
    const parentEnvPath = join(__dirname, '..', '.env');
    if (fs.existsSync(parentEnvPath)) {
        console.log('Loading .env from:', parentEnvPath);
        dotenv.config({ path: parentEnvPath });
    } else {
        console.log('.env not found at:', parentEnvPath);
    }
}

const oracleKeys = Object.keys(process.env).filter(k => k.startsWith('ORACLE_'));
console.log('Available ORACLE_ keys:', oracleKeys);
oracleKeys.forEach(k => console.log(`${k}: ${process.env[k] ? 'Set' : 'Empty'}`));

const dbConfig = {
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECTION_STRING,
};

const TABLE_CONFIG = {
    Departamento: { table: 'DEPARTAMENTO' },
    Municipio: { table: 'MUNICIPIO' },
    Sucursal: { table: 'SUCURSAL' },
    Puesto: { table: 'PUESTO' },
    Empleado: { table: 'EMPLEADO' },
    Proveedor: { table: 'PROVEEDOR' },
    Tipo_Producto: { table: 'TIPO_PRODUCTO' },
    Producto: { table: 'PRODUCTO' },
    Inventario_Sucursal: { table: 'INVENTARIO_SUCURSAL' },
    Cliente: { table: 'CLIENTE' },
    Tipo_Pedido: { table: 'TIPO_PEDIDO' },
    Pedido: { table: 'PEDIDO' },
    Detalle_Pedido: { table: 'DETALLE_PEDIDO' },
    Forma_Pago: { table: 'FORMA_PAGO' },
    Venta: { table: 'VENTA' },
    Detalle_Venta: { table: 'DETALLE_VENTA' },
    Compra: { table: 'COMPRA' },
    Detalle_Compra: { table: 'DETALLE_COMPRA' },
    Tipo_Activo: { table: 'TIPO_ACTIVO' },
    Activo_Fijo: { table: 'ACTIVO_FIJO' },
    Depreciacion: { table: 'DEPRECIACION' },
    Amortizacion: { table: 'AMORTIZACION' },
    Flujo_Caja: { table: 'FLUJO_CAJA' },
    Traslado: { table: 'TRASLADO' },
    Detalle_Traslado: { table: 'DETALLE_TRASLADO' }
};

async function checkRowCounts() {
    let connection;
    try {
        if (!dbConfig.user || !dbConfig.connectString) {
            throw new Error('Missing DB configuration. Check .env file.');
        }

        connection = await oracledb.getConnection(dbConfig);
        console.log('Connected to Oracle DB');

        for (const [key, config] of Object.entries(TABLE_CONFIG)) {
            try {
                const result = await connection.execute(
                    `SELECT COUNT(*) AS COUNT FROM ${config.table}`
                );
                console.log(`${key} (${config.table}): ${result.rows[0][0]} rows`);
            } catch (err) {
                console.error(`Error counting ${key} (${config.table}):`, err.message);
            }
        }

    } catch (err) {
        console.error('Database connection error:', err);
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

checkRowCounts();
