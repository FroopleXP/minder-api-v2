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

// MySQL Config file
try {
	var db = require('./mysql_conn.js');
} catch (err) {
	console.log("Couldn't find the MySQL config file.");
}

// bCrypt
var bcrypt = require('bcryptjs');

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

// Login Page
app.get('/login', function(req, res) {
	res.render('login.jade', {title: "Login"});
});

app.post('/login', function(req, res) {

	// Getting the data from the form
	var email = xssFilters.inHTMLData(req.body.form_data.email),
		password = xssFilters.inHTMLData(req.body.form_data.password);

	// Validating the data
	if (!validator.isEmail(email)) {
		res.json({
			stat: 0,
			message: "Invalid Email"
		});
	} else if (!validator.isLength(password, vali_str_opt)) {
		res.json({
			stat: 0,
			message: "Invalid Password"
		});			
	} else {

		// Checking if the User exists in the database
		db.query('SELECT * FROM admin_users WHERE admin_users.email = ?', email, function(err, rows, fields) {
			if (err) throw err;
			// Checking if that email exists
			if (rows.length < 1) {
				// Doesn't exist
				res.json({
					stat: 0,
					message: "That Email has not been registered."
				});	
			} else if (rows.length > 0) {
				// Does exist, check the password
				var password_db = rows[0]['password'];
				// Checking the password
				if (bcrypt.compareSync(password, password_db)) {
					// Password is correct
					console.log("Correct");
				} else {
					// Password is incorrect
					res.json({
						stat: 0,
						message: "Your password is incorrect"
					});	
				}
			}
		});

	}

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

		// Checking the database if the User exists
		db.query('SELECT admin_users.id FROM admin_users WHERE admin_users.email = ?', email, function(err, rows, fields) {
			if (err) throw err; // Throwing the error to the Console
			// Checking if user exists
			if (rows.length < 1) {
				
				// Checking if that establishment exists
				db.query('SELECT establishments.estab_id FROM establishments WHERE estab_name = ?', org_name, function(err, rows, fields) {
					// Check if any data was returned
					if (err) throw err; // Throwing MySQL error
					if (rows.length < 1) {

						// Encrypting password
						var password_hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
							name_com = firstname + " " + lastname;

						// Preparing the object to insert
						var user_model = {
							id: null,
							fname: firstname,
							lname: lastname,
							full_name: name_com,
							email: email,
							password: password_hash,
							estab_belongs_to: null
						}

						// Inserting the user
						var user_ins = db.query('INSERT INTO admin_users SET ?', user_model, function(err, result) {
							if (err) throw err; // Throwing error, if there is one
							// Generating a password for the establishment
							var user_id = result.insertId,
								org_pass = gen_code(user_id);

							// Inserting the new establishment into the Database
							// Preparing the estab model
							var estab_model = {
								estab_id: null,
								estab_pass: org_pass,
								estab_name: org_name
							}

							// Inserting into database
							var estab_ins = db.query('INSERT INTO establishments SET ?', estab_model, function(err, result) {
								if (err) throw err; // Throwing error, if there is one
								// Success! The establishment has been inserted, now we add the user to it
								var estab_id = result.insertId;
								var add_user = db.query('UPDATE admin_users SET admin_users.estab_belongs_to = ? WHERE admin_users.id = ?', [estab_id, user_id], function(err, result) {
									if (err) throw err; // Throwing error, if there is one
									// We've successfully added the User to the establishment

									// Redirecting them to the reg success poage
									res.json({
										stat: 1,
										message: "You've successfully registered! <a href='/login'>Login</a>"
									});	

								});
		
							});

						});

					} else if (rows.length > 0) {

						// Establishment exists
						res.json({
							stat: 0,
							message: "An establishment with that name exists, try another."
						});		

					}
				});				

			} else if (rows.length > 0) {
				// User already registered
				res.json({
					stat: 0,
					message: "Sorry, that email has already been registered."
				});	
			}
		});
	}
	
});

// Function for generating the code
function gen_code(user_id) {
	// Generating code
	var new_id = user_id * 1000000,
		code = new_id.toString(36),
		code_sub = code.substring(0, 5);
	// Returning new Code
	return code_sub;
}

// Setting the port for the application to run on
app.listen(3000);