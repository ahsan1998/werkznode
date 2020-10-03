var express = require('express');
var router = express.Router();
var mysql = require('mysql');
const config = require('../config/database.js');

const connection = mysql.createConnection(config, { useNewUrlParser: true });

connection.connect((err) => {
	if (err) throw err;
	console.log('Database Connected!');
});
router.get('/', function (request, response) {
	response.send('Please enter Username and Password!');
});

router.post('/login', (req, res, next) => {
	var username = req.body.username;
	var password = req.body.password;
	var location = req.body.locaton;
	var role = req.body.role;
	connection.query('SELECT * FROM users WHERE username = ? ', [username]
		, (error, results, fields) => {
			console.log(results.length);
			if (results.length > 0) {
				decryptedString = results[0].password;
				if (password == decryptedString) {

					UserRole = results[0].role;
					if (role == UserRole) {
						res.json({
							status: true,
							message: 'Login Successful',
							userId: results[0].id,
							fullname: results[0].fullname,
						})
					} 
					else {
						res.json({
							status: false,
							message: "Invalid Role"
						});
					}
				} else {
					res.json({
						status: false,
						message: "Invalid Password"
					});
				}

			}
			else {
				res.json({
					status: false,
					message: error,
					message: "Invalid Username"
				});
			}
		}
	);
});

router.put('/addLocation', (req, res, next) => {
	var location = req.body.location
	var id = req.body.id;
	var lastLogin = req.body.lastLogin;
	
	console.log(lastLogin)
	connection.query('UPDATE users SET location = ?, lastLogin = ? WHERE id = ?', [location, lastLogin, id],
		(error, result, fields) => {
			console.log(error);
			if (error) {
				res.json({
					status: false,
					message: "Location Cannot be Updated",

				});
				
			}
			else {
				res.json({
					status: true,
					message: "Location Updated"
				});
			}
		});
});

router.post('/addUser', (req, res, next) => {

	
		var fullname = req.body.fullname;
		var username = req.body.username;
		var password = req.body.password;
		var role = req.body.role;
		var location = 'none';
		var createdOn = req.body.createdOn;
		var lastLogin = 'none'
		
	connection.query('INSERT INTO users (fullname,username,password,role,location,createdOn, lastLogin) VALUES(?,?,?,?,?,?,?)', 
	[fullname,username, password, role,location, createdOn, lastLogin],
		(error, results, fields) => {
			if (error) {
				console.log(error)
				res.json({
					status: false,
					message: "User Cannot be Inserted",

				});
			}
			else {
				res.json({
					status: true,
					message: "User Inserted"
				});
			}
		});
});

router.put('/changepassword', (req, res, next) => {
	var id = req.body.userId
	var password = req.body.password;
	
	
	connection.query('UPDATE users SET password = ? WHERE id = ?', [password, id],
		(error, result, fields) => {
			console.log(error);
			if (error) {
				res.json({
					status: false,
					message: "password Changed be Updated",

				});
				
			}
			else {
				res.json({
					status: true,
					message: "Password Updated"
				});
			}
		});
});
router.get('/getUsers', (req, res, next) => {
	connection.query("SELECT * FROM users", function (err, result, fields) {
		if(err){
            res.json(err);
        }
        else{
            res.json(result);
        }
	});

});
router.get('/getUsername', (req, res, next) => {
	connection.query("SELECT username FROM users", function (err, result, fields) {
		if(err){
            res.json(err);
        }
        else{
            res.json(result);
        }
	});

});

router.get('/getUserById/:id', (req, res, next) => {
	var id = req.params.id;
	connection.query("SELECT * FROM users WHERE id = ?", [id],
	(error, result, fields) => {
		if(error){
            res.json(error);
        }
        else{
            res.json(result[0]);
        }
	});
});
module.exports = router;