const express = require('express');
const multer = require('multer');
const path = require('path');

const { isSignedIn } = require('../middleware');

const Case = require('../models/Case');

const storage = multer.diskStorage({
    destination:'./public/uploads',
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + req.user._id + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage:storage,
    limits:{fieldSize:10000000}
}).single('attachement');

const router = express.Router();

router.use(upload);

router.get('/new', (req,res) => {
    res.render('cases/new');
});

router.post("/", isSignedIn, async (req, res) => {


    let subject = req.body.subject;
    let details = req.body.details;
    let contactEmail= req.body.contactEmail;
    if(contactEmail === ""){
        contactEmail=req.user.email;
    }
    let mobileNo = req.body.mobileNo;
    let user = {
        id: req.user._id,
        name: req.user.firstName + " " + req.user.lastName,
    }
    var attachement;
    await upload(req, res, (err) => {
        if(err){
            req.flash('error_msg', "File Upload Error");
            res.redirect('/cases/new');
            console.log(err);
        }
        else{
            console.log(req.file);
            attachement = "uploads/" + req.file.filename;
            const newCase = {subject,details,contactEmail,mobileNo,user,attachement}
            Case.create(newCase, (err, newCase)  => {
                if(err){
                    console.log(err);
                } else {
                    console.log(newCase);
                    req.flash('success_msg', "Your case is Registered");
                    res.redirect('/cases/new');
                }
            });
        }
    });
});

router.get('/', isSignedIn, (req, res) => {

    Case.find({"user.id":req.user.id}, (err, allCases) => {
        if(err){
            console.log(err);
        } else {
           res.render("cases/index",{allCases});
        }
     });
});

router.get("/:id", function(req, res){

   Case.findById(req.params.id, (err, foundCase) => {
        if(err){
            console.log(err);
        } else {
            console.log(foundCase)
            res.render("cases/show", {acase: foundCase});
        }
    });
});



module.exports = router;