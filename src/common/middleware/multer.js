import multer from "multer";
import fs from "node:fs";

export const multer_local = ({folder_path="general", file_type = []}) => {
  const full_path = `uploads/${folder_path}`;

  if(!fs.existsSync(full_path)){
      fs.mkdirSync(full_path,{recursive:true})
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      console.log(file);
      cb(null, full_path);
    },
    filename: function (req, file, cb) {
       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, uniqueSuffix+ '-' + file.originalname );
    },
  });

  function fileFilter (req, file, cb) {
    console.log(file);
    
    if(!file_type.includes(file.mimetype)){
      return cb(new Error("Invalid File Type"))
    }
    cb(null,true)
}

  const upload = multer({ storage , fileFilter});

  return upload;
};
