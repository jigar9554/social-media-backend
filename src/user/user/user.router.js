const { validationResult } = require('express-validator')
const multer = require('multer')

const helpers = require('../../helpers/index')
const users = require('./user.controller')
const userRules = require('./user.rules')

const userController = new users()

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function(req, file, cb) {
    cb(null, `image-${Date.now()}-` + file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true)
  } else {
    return cb(new Error('Please upload a Image'))
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
})

module.exports = function (app) {
  app.prefix('/user', function (app) {
    app.post('/register', userRules.validate('createUser'), function (req, res, next) {
      const errors = validationResult(req)
      
      if (!errors.isEmpty()) {
        const error = errors.array()[0]
        return res.status(422).json(
          helpers.response.error({ msg: error.msg, field: error.param })
        )
      }
      
      userController.register(req, res, next)
    })
    
    app.post('/login', userRules.validate('loginUser'), function (req, res, next) {
      const errors = validationResult(req)
      
      if (!errors.isEmpty()) {
        const error = errors.array()[0]
        return res.status(422).json(
          helpers.response.error({ msg: error.msg, field: error.param })
        )
      }
      
      userController.login(req, res, next)
    })

    app.post('/logout', helpers.Authorize.checkUserAuth, function (req, res, next) {
      userController.logOut(req, res, next)
    })

    app.get('/get-users-list', helpers.Authorize.checkUserAuth, function (req, res, next) {
      userController.getUserList(req, res, next)
    })

    app.post('/update-profile/:id', helpers.Authorize.checkUserAuth, userRules.validate('updateProfile'), function (req, res, next) {
      const errors = validationResult(req)
      
      if (!errors.isEmpty()) {
        const error = errors.array()[0]
        return res.status(422).json(
          helpers.response.error({ msg: error.msg, field: error.param })
        )
      }
      userController.updateProfileDetail(req, res, next);
    })

    app.post('/update-profile-pic/:id', helpers.Authorize.checkUserAuth, upload.single('profilePic'), function (req, res, next) {
      userController.updateProfileImage(req, res, next)
    })

  })
}