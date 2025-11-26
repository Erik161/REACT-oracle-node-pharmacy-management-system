import oracledb from 'oracledb'

async function checkColumns() {
    let connection
    try {
        connection = await oracledb.getConnection({
            user: 'SYSTEM',
            password: '1234',
            connectString: 'localhost:1521/xe',
        })

        const result = await connection.execute(
            `SELECT column_name, data_type FROM user_tab_columns WHERE table_name = 'DEPARTAMENTO'`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        )
        console.log('Columnas de DEPARTAMENTO:', result.rows)
    } catch (err) {
        console.error(err)
    } finally {
        if (connection) await connection.close()
    }
}

checkColumns()
