var express = require('express');
var router = express.Router();
var mysql = require('mysql');
const config = require('../config/database.js');
const multer = require('multer');

const s3 = require('../config/s3.config.js');
var storage = multer.memoryStorage({
    destination: function (req, file, cb) {
        cb(null, 'jobticket');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})
var upload = multer({ storage: storage });

var closestorage = multer.memoryStorage({
    destination: function (req, file, cb) {
        cb(null, 'closejobticket');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})
var closeupload = multer({ storage: closestorage });


const connection = mysql.createConnection(config, { useNewUrlParser: true });

connection.connect((err) => {
    if (err) throw err;
    console.log('Database Connected!');
});
router.get('/', function (request, response) {
    response.send('Job Tickets');
});

router.post('/addjobTicketImage', upload.single("file"), (req, res) => {
    const s3Client = s3.s3Client;
    const params = s3.uploadParams;

    params.Body = req.file;

    s3Client.upload(params, (err, data) => {
        if (err) {
            res.json({
                status: false,
                message: "Job Ticket Image Upload Unsuccessful",

            });
        }
        res.json({
            status: true,
            message: "Job Ticket Image Uploaded"
        });

    });
});
router.post('/addjobTicketImage', upload.single('image'), (req, res) => {
    if (!req.file) {
        res.json({
            status: false,
            message: "Job Ticket Image Upload Unsuccessful",

        });

    }
    else {
        res.json({
            status: true,
            message: "Job Ticket Image Uploaded"
        });
    }
});
router.post('/closejobTicketImage', closeupload.single('image'), (req, res) => {
    const s3Client = s3.s3Client;
    const params = s3.uploadParams;

    params.Body = req.file;

    s3Client.upload(params, (err, data) => {
        if (err) {
            res.json({
                status: false,
                message: "Job Ticket Closing Image Upload Unsuccessful",

            });
        }
        res.json({
            status: true,
            message: "Job Ticket Closing Image Uploaded"
        });

    });

});

router.post('/addJobticket', (req, res, next) => {


    var categoryId = req.body.categoryId;
    var userId = req.body.userId;
    var status = req.body.status;
    var createdOn = req.body.createdOn;
    var closedOn = 'none';
    var imageName = req.body.imageName;
    var location = req.body.location;
    var locationClose = 'none'
    connection.query('INSERT INTO jobticket (categoryId,userId,status,createdOn,closedOn,imageName, location, locationClose) VALUES(?,?,?,?,?,?,?,?)',
        [categoryId, userId, status, createdOn, closedOn, imageName, location, locationClose],
        (error, results, fields) => {
            if (error) {
                console.log(error)
                res.json({
                    status: false,
                    message: "Job Ticket Cannot be Inserted",

                });
            }
            else {
                res.json({
                    status: true,
                    message: "Job Ticket Inserted",
                    id: results.insertId
                });
            }
        });
});

router.get('/getAllJobticket', (req, res, next) => {
    connection.query("SELECT * FROM jobticket", function (err, result, fields) {
        if (err) {
            res.json(err);
        }
        else {
            res.json(result);
        }
    });

});

router.get('/getJobticketById/:id', (req, res, next) => {
    var id = req.params.id;
    connection.query("SELECT * FROM jobticket WHERE id = ?", [id], (err, result, fields) => {
        if (err) {
            res.json(err);
        }
        else {
            res.json(result[0]);
        }
    });

});
router.put('/closeJobTicket', (req, res, next) => {
    var status = 'complete'
    var closedOn = req.body.closedOn;
    var id = req.body.id;
    var locationClose = req.body.locationClose

    connection.query('UPDATE jobticket SET status = ?, closedOn = ?, locationClose = ? WHERE id = ?', [status, closedOn, locationClose, id],
        (error, result, fields) => {
            console.log(error);
            if (error) {
                res.json({
                    status: false,
                    message: "Job Ticket Cannot be Updated",

                });

            }
            else {
                res.json({
                    status: true,
                    message: "Job Ticket Status Updated"
                });
            }
        });
});

router.get('/getJobByUserId/:id', (req, res, next) => {
    var id = req.params.id;
    connection.query("SELECT * FROM jobticket WHERE userId = ?", [id],
        (error, result, fields) => {
            if (error) {
                res.json(error);
            }
            else {
                res.json(result);
            }
        });
});
module.exports = router;