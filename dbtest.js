const { Client } = require('pg');
const config = require('./config.json');

async function go(){
	const client = new Client({
	  user: config.db.user,
	  host: config.db.host,
	  database: config.db.name,
	  password: config.db.password,
	  port: config.db.port,
	})
	await client.connect();
	const res = await client.query('SELECT $1::text as message', ['Hello world!']);
	console.log(res.rows[0].message); // Hello world!
	await client.end();
}

go();