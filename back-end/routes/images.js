const express  = require( 'express');
const multer = require("multer")
const { uploadImageView }  = require( '../controllers/uploadImageView.js');


const router = express.Router();

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
 });
var upload = multer({ storage: storage });


router.post('/', upload.single('image'),uploadImageView);
router.use('/', express.static('uploads'))
module.exports = router;