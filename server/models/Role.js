const mongoose = require('mongoose');
const { TEAM_ROLES } = require('../config/roles');

// ============================================
// ROLE (custom role inside a team)
// ------------------------------------------------
// Example: within the "sales" team the Super Admin can create
// "Sales Manager", "Sales Executive", "Telecaller" — each with its own
// tab-by-tab permission matrix (view/create/edit/delete/assign).
//
// IMPORTANT (by design, per product requirement):
//   - Only the Super Admin can create/edit/delete Roles and decide their
//     permissions ("us bande ko itne tab ki permission hum admin khud
//     dega"). Team leads can only PICK an existing role (from their own
//     team) when they hire someone into their downline — they can never
//     grant more access than the role itself carries.
// ============================================

const permissionSchema = new mongoose.Schema(
  {
    view: { type: Boolean, default: false },
    create: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
    assign: { type: Boolean, default: false },
  },
  { _id: false }
);

const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
    },
    // Which department this role belongs to (sales / account / service / ...).
    // A role is always scoped to exactly one team.
    team: {
      type: String,
      required: true,
      enum: TEAM_ROLES,
    },
    // module key (see config/modules.js) -> { view, create, edit, delete, assign }
    permissions: {
      type: Map,
      of: permissionSchema,
      default: {},
    },
    // Manager-level roles (e.g. "Sales Manager", "Account Manager") should
    // set this true. Employee-level roles (e.g. "Sales Executive",
    // "Telecaller") should leave it false.
    //
    //   canViewFullRevenue: true  -> sees the whole team's revenue/numbers.
    //   canViewFullRevenue: false -> only ever sees revenue/records tied to
    //                                themselves (their own leads/invoices).
    canViewFullRevenue: { type: Boolean, default: false },
    // 'team'  -> can see every record belonging to their own downline
    //            (typically the manager role for that team).
    // 'own'   -> can only see records assigned to / created by themselves.
    dataScope: {
      type: String,
      enum: ['own', 'team'],
      default: 'own',
    },
    // Can this role hire/manage further sub-users under themselves
    // (e.g. a Sales Manager adding a Sales Executive)?
    canManageTeamUsers: { type: Boolean, default: false },
    description: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

RoleSchema.index({ team: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Role', RoleSchema);
