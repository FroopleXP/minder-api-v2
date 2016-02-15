/////////////////////////////////////////////
// REQUIRING DEPENDENCIES
/////////////////////////////////////////////
// Express
var express = require('express'),
	app = express();

// Body Parser
var bodyParser = require('body-parser');

// Cleansing tools
var xssFilters = require('xss-filters'),
	validator = require('validator');

// MySQL
try {
	var db = require('./mysql_conn.js');
} catch (err) {
	console.log("Couldn't find the MySQL config file.");
}

/////////////////////////////////////////////
// SETTING UP THE APPLICATION (MIDDLEWARE)
/////////////////////////////////////////////
// Setting up Express
app.set('view engine', 'jade');
app.use("/views", express.static(__dirname + '/views'));
app.use(bodyParser.urlencoded({ extended: true }));

// Setting validation parameters for 'validator'
var vali_str_opt = {
	min: 5,
	max: 100
}

/////////////////////////////////////////////
// Page Routes
/////////////////////////////////////////////
// Home Page
app.get('/', function(req, res) {
	res.render('index.jade', {title: "Home"});
});

// Register Page
app.get('/register', function(req, res) {
	res.render('register.jade', {title: "Register"});
});

app.post('/register', function(req, res) {

	// Getting the form data and cleaning it of XSS scripts
	var org_name = xssFilters.inHTMLData(req.body.form_data.org_name),
		firstname = xssFilters.inHTMLData(req.body.form_data.fname),
		lastname = xssFilters.inHTMLData(req.body.form_data.lname),
		email = xssFilters.inHTMLData(req.body.form_data.email),
		password = xssFilters.inHTMLData(req.body.form_data.password),
		password_conf = xssFilters.inHTMLData(req.body.form_data.password_conf);

	// Validating the data (Length)
	if (validator.isNull(org_name) || validator.isNull(firstname) || validator.isNull(lastname) || validator.isNull(email) || validator.isNull(password) || validator.isNull(password_conf)) {
		res.json({
			stat: 0,
			message: "You must fill out all fields!"
		});
	} else if (!validator.isLength(org_name, vali_str_opt)) {
		res.json({
			stat: 0,
			message: "Your organisation name must be longer than " + vali_str_opt.min + " characters"
		});			
	} else if (!validator.isEmail(email)) {
		res.json({
			stat: 0,
			message: "Please enter a valid Email"
		});	
	} else if (!validator.isLength(password, vali_str_opt)) {
		res.json({
			stat: 0,
			message: "Password must be longer than " + vali_str_opt.min + " characters"
		});	
	} else if (password != password_conf) {
		res.json({
			stat: 0,
			message: "Passwords do not match"
		});			
	} else {
		res.json({
			stat: 1,
			message: "Valid!"
		});			
	}

	// Checking the database if the User exists

});

// Setting the port for the application to run on
app.listen(3000);