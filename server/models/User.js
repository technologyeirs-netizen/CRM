const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
