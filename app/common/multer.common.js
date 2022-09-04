const multer = require("multer");

// Get the file name and extension with multer
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    const fileExt = file.originalname.split(".").pop();
    const filename = `${new Date().getTime()}.${fileExt}`;
    cb(null, filename);
  },
});

// Set the storage, file filter and file size with multer
const upload = multer({
  storage,
//   limits: {
//     fieldNameSize: 200,
//     fileSize: 5 * 1024 * 1024,
//   },
}).single("file");

module.exports = upload;
