const Users = require('../models/userModels');
const AppError = require('../utils/AppError');
const multer = require('multer');
const sharp = require('sharp');
const {
  getAllRecords,
  getOneRecord,
  deleteAllRecords,
  deleteOneRecord,
  updateRecord,
  createDoc
} = require('../controllers/HandlerFactory');

// const storage1 = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const id = `user-photo-${Date.now()}`;
//     let mimetype = file.mimetype.split('/')[1];
//     if (mimetype === 'msword') mimetype = 'doc';
//     const filename = `${id}.${mimetype}`;
//     cb(null, filename);
//   }
// });
const storage = multer.memoryStorage();

const filterFiles = (req, file, cb) => {
  // The function should call `cb` with a boolean
  // to indicate if the file should be accepted

  // To reject this file pass `false`, like so:
  if (!file.mimetype.startsWith('image'))
    return cb(new AppError('file not accepted'));
  // To accept the file pass `true`, like so:
  else cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: filterFiles });

exports.processFiles = upload.single('photo');

exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .toFile(`public/img/users/${req.file.filename}`)
    .then(() => {
      next();
    })
    .catch(err => {
      return next(new AppError(err));
    });
};

const filterBody = (body, ...allowedFields) => {
  let newBody = {};
  for (key in body) {
    if (allowedFields.includes(key)) {
      newBody[key] = body[key];
    }
  }

  return newBody;
};

exports.filterBodyForUpdate = (req, res, next) => {
  const newBody = filterBody(req.body, 'name', 'email');
  req.body = newBody;
  if (req.file) req.body.photo = req.file.filename;
  req.params.id = req.user._id;
  next();
};
exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};
exports.getAllUsers = getAllRecords(Users);
exports.getUser = getOneRecord(Users);
exports.createUser = createDoc(Users);
exports.updateUser = updateRecord(Users);
exports.deleteUser = updateRecord(Users, { active: false });
