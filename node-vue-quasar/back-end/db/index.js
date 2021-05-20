const mysql = require('mysql');

const pool = mysql.createPool({
	connectionLimit: 10,
	password: 'vince',
	user: 'root',
	database: 'product_db',
	host: 'localhost',
	port: '3306'
});

let productDb = {};

productDb.all = () => {
	return new Promise((resolve, reject) => {
		pool.query(`SELECT * FROM product`, (err, results) => {
			if(err) {
				return reject(err);
			}
			return resolve(results);
		});
	});
};

module.exports = productDb;
