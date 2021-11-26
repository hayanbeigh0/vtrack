const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
   firstName: {
      type: String,
      required: [true, 'Please tell us your name.'],
      trim: true,
   },
   lastName: {
      type: String,
      trim: true,
   },
   photo: {
      type: String,
   },
   email: {
      type: String,
      required: [true, 'Please tell us your email'],
      validate: {
         validator: validator.isEmail,
         message: 'Please enter a valid email address',
      },
      unique: true,
      lowercase: true,
   },
   phoneNumber: {
      type: Number,
      required: [true, 'Please provide us your phone number.'],
   },
   regNumber: {
      type: String,
      required: [true, 'Please enter your university registration number!'],
   },
   role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
   },
   password: {
      type: String,
      required: [true, 'Please enter a password'],
      minlength: [8, 'Password should be atleast 8 characters long'],
      select: false,
   },
   passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      minlength: [8, 'Password should be atleast 8 characters long'],
      validate: {
         validator: function (val) {
            return val === this.password;
         },
         message: 'Passwords do not match',
      },
   },
   passwordResetToken: {
      type: String,
   },
   passwordResetExpires: {
      type: Date,
   },
   passwordChangedAt: {
      type: Date,
   },
   active: {
      type: Boolean,
      default: true,
      select: false,
   },
});

userSchema.pre('save', async function (next) {
   // Run this function only if the password was changed
   if (!this.isModified('password')) return next();

   // Create hash of the password
   this.password = await bcrypt.hash(this.password, 12);

   // Remove the passwrodConfirm field
   this.passwordConfirm = undefined;

   next();
});

userSchema.pre('save', function (next) {
   if (!this.isModified('password') || this.isNew) return next();

   this.passwordChangedAt = Date.now() - 1500;
   next();
});

userSchema.pre(/^find/, function (next) {
   // this points to the current query:
   this.select('+active').find({ active: true });
   next();
});

userSchema.methods.correctPassword = async function (
   candidatePassword,
   userPassword
) {
   return bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
   if (!this.passwordChangedAt) return false;

   const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000);
   return changedTimeStamp > JWTTimeStamp;
};

userSchema.methods.createPasswordResetToken = function () {
   const resetToken = crypto.randomBytes(32).toString('hex');

   this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

   this.passwordResetExpires = Date.now() + 600000;

   return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
