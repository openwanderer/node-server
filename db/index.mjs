import pg from 'pg';
const { Pool } = pg;

const pool = new pg.Pool({
	host:  process.env.DB_HOST,
	user:  process.env.DB_USER, 
	database: process.env.DB_DBASE
});

export default pool;
