// multer is a middleware to handle file uploads
import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb( new Error("Solo se permiten archivos de imagen"), false);
    }
};

const upload = multer ({
    storage: storage,
    fileFilter: fileFilter,
    limits: {fileSize: 5 * 1024 * 1024}
})



export default upload;