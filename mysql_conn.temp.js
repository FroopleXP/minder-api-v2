// Requiring the MySQL dependency
var mysql = require('mysql');

// Connection to MySQL
var conn = mysql.createConnection({
	host: 'HOST',
	user: 'USER',
	password: 'PASSWORD',
	database: 'DATABASE',
	port: 3306
});

// Testing the connection
conn.connect(function(err) {
	if (!err) {
		// There's no error!
		console.log("Connected to database.");
	} else {
		console.log("Something bad happened! Failed to connect.");
		console.log(err);
	}
});

// Exporting the connection
module.exports = conn;