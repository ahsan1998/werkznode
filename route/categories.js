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
    response.send('Category');
});



router.post('/addCategory', (req, res, next) => {


    var title = req.body.title;
    var createdOn = req.body.createdOn;
    
    connection.query('INSERT INTO category (title,createdOn) VALUES(?,?)',
        [title, createdOn],
        (error, results, fields) => {
            if (error) {
                console.log(error)
                res.json({
                    status: false,
                    message: "Category Cannot be Inserted",

                });
            }
            else {
                res.json({
                    status: true,
                    message: "Cateogory Inserted"
                });
            }
        });
});

router.get('/getAllCategory', (req, res, next) => {
	connection.query("SELECT * FROM category", function (err, result, fields) {
		if(err){
            res.json(err);
        }
        else{
            res.json(result);
        }
	});

});
router.delete('/removeCategory/:id', (req, res, next) => {
	var id = req.params.id;
    connection.query("DELETE FROM category WHERE id = ?", [id],
    (error, result, fields) =>{
		if (error) {
            console.log(error)
            res.json({
                status: false,
                message: "Category Cannot be Removed",

            });
        }
        else {
            res.json({
                status: true,
                message: "Category Removed Successfully"
            });
        }
	});

});
router.get('/getCategoryById/:id', (req, res, next) => {
	var id = req.params.id;
	connection.query("SELECT * FROM category WHERE id = ?", [id],
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