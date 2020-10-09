var express = require('express');
var router = express.Router();
var mysql = require('mysql');
const config = require('../config/database.js');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const multer = require('multer');
const path = require('path');
const url = require('url');

const AWS = require('aws-sdk');
const ID = 'AKIA4SZD36L2BMSOA22L';
const SECRET = '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';
const fs = require('fs');
// The name of the bucket that you have created
const BUCKET_NAME = 'jobticket';
const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
});
const params = {
    Bucket: BUCKET_NAME,
};

const uploadFile = (fileName) => {

    // Setting up S3 upload parameters
    const params = {
        Bucket: BUCKET_NAME,
        Key: 'cat.jpg', // File name you want to save as in S3
        Body: fileName
    };

    // Uploading files to the bucket
    s3.upload(params, function(err, data) {
        if (err) {
            res.json({
                status: true,
                message: "Job Ticket Image Uploaded"
            });
            throw err;
        }
        else{
        res.json({
            status: false,
            message: "Job Ticket Image Upload Unsuccessful",

        });
    }
    });
};

router.post('/addjobTicketImage',(req, res) => {
    console.log(req.file);
   uploadFile(req.file)
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