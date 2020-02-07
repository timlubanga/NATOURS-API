const moongose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
userSchema = moongose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    validate: [validator.isAlpha, 'A name cannot have a number']
  },
  email: {
    type: String,
    required: [true, 'please provide your email'],
    lowercase: true,
    unique: true,
    validate: [validator.isEmail, 'please provide a valid email address']
  },
  photo: {
    type: String
  },
  role: {
    type: String,
    enum: ['admin', 'lead-guide', 'user'],
    default: 'user'
  },
  active: {
    type: Boolean,
    default: true
  },
  passwordResetToken: String,
  passwordTokenExpiresAt: Date,
  password: {
    type: String,

    minLength: 8,
    required: [true, 'please provide a password'],
    select: false
  },
  passwordChangeAt: {
    type: Date,
    default: undefined
  },
  confirmPassword: {
    type: String,
    required: [true, 'please confirm your password'],
    validate: {
      //runs on create and save
      validator: function(el) {
        return el === this.password;
      },
      message: 'The passwords are not the same'
    }
  }
});

userSchema.pre('save', async function(next) {
  //check whether the password has been changed
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);

  //prevent pass frompersisting into the database
  this.confirmPassword = undefined;
});

//instance method available on all userSchema docs
//this note available as pass is deselected
userSchema.methods.comparePasswords = async function(
  candidatePassword,
  userpassword
) {
  return await bcrypt.compare(candidatePassword, userpassword);
};

userSchema.methods.passChangeAfterTokenIssued = function(jwtIAT) {
  // console.log(this.passwordChangeAt.getTime() / 1000 > jwtIAT);
  // console.log(this.passwordChangeAt.getTime() / 1000, jwtIA
  if (this.passwordChangeAt) {
    return this.passwordChangeAt.getTime() / 1000 > jwtIAT;
  }

  return false;
};

userSchema.methods.generateResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordTokenExpiresAt = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = moongose.model('User', userSchema);

module.exports = User;
