import oracledb from 'oracledb';

async function checkConnection() {
    let connection;
    try {
        console.log('Intentando conectar a Oracle...');
        console.log('Usuario: SYSTEM');
        console.log('String de conexión: localhost:1521/xe');

        connection = await oracledb.getConnection({
            user: 'SYSTEM',
            password: '1234',
            connectString: 'localhost:1521/xe',
        });

        console.log('¡Conexión exitosa!');

        const result = await connection.execute(
            `SELECT * FROM PRODUCTOS FETCH FIRST 1 ROWS ONLY`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        console.log('Columnas encontradas:', result.metaData);
        console.log('Fila de ejemplo:', result.rows[0]);

    } catch (err) {
        console.error('Error de conexión:', err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error cerrando conexión:', err);
            }
        }
    }
}

checkConnection();
