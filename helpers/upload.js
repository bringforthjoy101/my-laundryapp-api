const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const config = require('../config/config');

aws.config.update({
    secretAccessKey: config.SECRETKEY,
    accessKeyId: config.ACCESSKEY,
    region: config.REGION
});
const s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.includes("csv") || file.mimetype.includes("excel") ||
    file.mimetype.includes("spreadsheetml") || file.mimetype.includes("image/jpeg") || file.mimetype.includes("image/png")) {
    cb(null, true);
  } else {
    cb("Invalid file uploaded.", false);
  }
};

const upload = multer({
    fileFilter,
    storage: multerS3({
      s3: s3,
      bucket: config.BUCKETNAME,
      metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname});
      },
      key: function (req, file, cb) {
        cb(null, Date.now().toString()+'_'+file.originalname)
      }
    })
  });

module.exports = { upload }