import multer from "multer";
import path from "path";

/*-------------------Image Upload vai Multer---------------------------*/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //   console.log(req.file)
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const imgExtansionFilter = (req, file, cb) => {
  // console.log(file.mimetype)
  if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    return cb(new Error("Only .png, .jpeg format allowed!"));
  }
};

const imgUpload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, //5Mb
  },
  fileFilter: imgExtansionFilter,
});

export default { imgUpload };

// const upload = multer({
//   storage: multer.diskStorage({
//     destination: "./uploads",
//     filename: async (req, file, cb) => {
//       const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//       cb(null,file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
//       );
//     },
//   }),
// });

// const imgExtansionFilter = (req, file, cb) => {
//     if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
//         cb(null, true)
//     }
//     else {
//         return cb(new Error('Only two formate .png, .jpeg allowed'));
//     }
// }

// const imgUpload = multer({
//     upload: upload,
//     limits: {
//         fileSize: 1024 * 1024 * 5 //5Mb
//     },
//     fileFilter: imgExtansionFilter
// });

// export default { imgUpload};
