var express = require('express');
var router = express.Router();
var mysql = require('mysql');
const config = require('../config/database.js');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const multer = require('multer');
const path = require('path');
const url = require('url');

const s3 = new aws.S3({
    accessKeyId: 'AKIA4SZD36L2PPMNO4OJ',
    secretAccessKey: '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',
    Bucket: 'werkzbucket'
});


const profileImgUpload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'werkzbucket',
        acl: 'public-read',
        key: function (req, file, cb) {
            cb(null, '');
        },
    }),
    limits: { fileSize: 2000000 }, // In bytes: 2000000 bytes = 2 MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('file');

function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}
router.post('/addjobTicketImage', (req, res) => {
    console.log(req.image);
    console.log(req.file);
    profileImgUpload(req, res, (error) => {
        // console.log( 'requestOkokok', req.file );
        // console.log( 'error', error );
        if (error) {
            console.log('errors', error);
            res.json({ error: error });
        } else {
            // If File not found
            if (req.image === undefined) {
                console.log('Error: No File Selected!');
                res.json('Error: No File Selected');
            } else {
                // If Success
                const imageName = req.image;
                // Save the file name into database into profile model
                res.json({
                    image: imageName
                });
            }
        }
    });
});

const connection = mysql.createConnection(config, { useNewUrlParser: true });

connection.connect((err) => {
    if (err) throw err;
    console.log('Database Connected!');
});
router.get('/', function (request, response) {
    response.send('Job Tickets');
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