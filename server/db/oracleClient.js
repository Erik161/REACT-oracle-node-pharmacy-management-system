import oracledb from 'oracledb'

let pool

export const initPool = async () => {
  if (pool) return pool
  pool = await oracledb.createPool({
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectionString: process.env.ORACLE_CONNECTION_STRING,
  })
  return pool
}

export const getConnection = async () => {
  if (!pool) {
    await initPool()
  }
  return pool.getConnection()
}

export const closePool = async () => {
  if (pool) {
    await pool.close(10)
    pool = null
  }
}
