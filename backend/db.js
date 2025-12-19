const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'SevaDwaar',
  password: 'root',
  port: 5432,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error acquiring client', err.stack);
  } else {
    console.log('✅ Database connected successfully!');
    // you can run a test query
    client.query('SELECT NOW()', (err, result) => {
      release(); // release back to pool
      if (err) {
        console.error('❌ Error running query', err.stack);
      } else {
        console.log('📅 Current time from DB:', result.rows[0]);
      }
    });
  }
});

module.exports = pool;
