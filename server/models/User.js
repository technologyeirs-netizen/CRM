const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { encryptPassword } = require('../utils/passwordCrypto');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    // Reversible, encrypted copy of the password kept ONLY so it can be shown
    // back in the "Team Users" table (as requested). Login/auth always uses
    // the bcrypt hash stored above in `password`, never this field.
    passwordEncrypted: {
      type: String,
      required: false,
      select: false,
    },
    role: {
      type: String,
      enum: [
        'admin', // legacy alias, treated as superadmin
        'superadmin',
        'account',
        'sales',
        'service',
        'delivery',
        'hr',
        'b2c',
        'website',
        'agent', // legacy default, unused going forward
        'employee',
      ],
      default: 'employee',
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Approval workflow: a team lead (account/sales/service/delivery/hr/b2c/website)
    // can invite a colleague into their own team, but that account stays
    // "pending" until the Super Admin reviews and approves it.
    status: {
      type: String,
      enum: ['active', 'pending', 'rejected'],
      default: 'active',
    },
    // 'team'  -> created by the Super Admin / a team lead via "Add Team User"
    //            (or the system itself: bootstrap admin, employee-login sync).
    //            These are the only ones the "Team Users / Approval" screen
    //            should ever list.
    // 'self'  -> a public self-registration (POST /api/auth/register). This is
    //            used by outside logins (e.g. a client on the public website)
    //            and must NOT show up in the internal Team Users/Approval list.
    accountType: {
      type: String,
      enum: ['team', 'self'],
      default: 'team',
    },
    // Who created this login (null when created directly by Super Admin/bootstrap).
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Keep isAdmin in sync with role so older parts of the app that still check
// `isAdmin` keep working exactly like a Super Admin.
UserSchema.pre('save', function (next) {
  if (this.role === 'admin' || this.role === 'superadmin') {
    this.isAdmin = true;
  }
  next();
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  // Keep a reversible, encrypted copy BEFORE hashing, so the Team Users
  // table can show the real password (as requested).
  this.passwordEncrypted = encryptPassword(this.password);
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Sign JWT
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = mongoose.model('User', UserSchema);
