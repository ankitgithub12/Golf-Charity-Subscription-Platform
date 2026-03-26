const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// Helper — sign JWT
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, password, adminSecret } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ success: false, message: 'Email already registered' });

    // logic for admin registration via secret code
    let role = 'user';
    if (adminSecret && adminSecret === process.env.ADMIN_REGISTRATION_SECRET) {
      role = 'admin';
    }

    const user = await User.create({ name, email, password, role });
    const token = signToken(user._id);

    // PRD Requirement: Notify user via email on registration (Section 13)
    try {
      await sendEmail({
        email: user.email,
        subject: 'Welcome to Golf Charity!',
        message: `
          <div style="background-color: #020617; padding: 40px 20px; font-family: 'Inter', sans-serif, Arial; color: #f8fafc; text-align: center;">
            <div style="max-width: 500px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; padding: 40px; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
              <div style="background: linear-gradient(135deg, #10b981, #f59e0b); width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; font-size: 32px;">⛳</div>
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin-bottom: 16px; letter-spacing: -0.025em;">Welcome, ${user.name}!</h1>
              <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                Your account has been created successfully. You're now part of a community that plays golf to make a difference.
              </p>
              <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 20px; margin-bottom: 32px; text-align: left;">
                <p style="color: #10b981; font-weight: 600; margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase;">Next Steps:</p>
                <ul style="color: #cbd5e1; margin: 0; padding-left: 20px; font-size: 14px;">
                  <li style="margin-bottom: 8px;">Pick a subscription plan</li>
                  <li style="margin-bottom: 8px;">Select your favorite charity</li>
                  <li>Enter your golf scores to win!</li>
                </ul>
              </div>
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" 
                 style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-weight: 600; text-decoration: none; transition: background-color 0.3s ease;">
                 Visit Dashboard
              </a>
              <div style="margin-top: 40px; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 24px;">
                <p style="color: #64748b; font-size: 13px; margin: 0;">
                  Sent with ❤️ from the Golf Charity Team
                </p>
              </div>
            </div>
          </div>
        `
      });
    } catch (emailErr) {
      console.error('Welcome email failed:', emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: role === 'admin' ? 'Admin account created successfully' : 'Account created successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Explicitly select password (excluded by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Account deactivated' });

    const token = signToken(user._id);

    // Re-fetch with populate so selectedCharity is an object, not a raw ObjectId
    const populatedUser = await User.findById(user._id).populate('selectedCharity', 'name coverImage');

    res.json({
      success: true,
      token,
      user: populatedUser,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('selectedCharity', 'name coverImage');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/auth/profile  — update name / profile image
 */
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const update = {};
    if (name) update.name = name;
    if (req.file) update.profileImage = req.file.path;

    const user = await User.findByIdAndUpdate(req.user._id, update, {
      new: true,
      runValidators: true,
    }).populate('selectedCharity', 'name coverImage');

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/auth/forgotpassword
 */
const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'There is no user with that email' });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const message = `
      <div style="background-color: #020617; padding: 40px 20px; font-family: 'Inter', sans-serif, Arial; color: #f8fafc; text-align: center;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; padding: 40px; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
          <div style="background: rgba(245, 158, 11, 0.1); width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; font-size: 32px; border: 1px solid rgba(245, 158, 11, 0.2);">🔑</div>
          <h1 style="color: #ffffff; font-size: 26px; font-weight: 700; margin-bottom: 16px; letter-spacing: -0.025em;">Password Reset</h1>
          <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
            We received a request to reset your password. Click the button below to choose a new one. This link will expire in 10 minutes.
          </p>
          <a href="${resetUrl}" 
             style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-weight: 600; text-decoration: none; transition: background-color 0.3s ease;">
             Reset Password
          </a>
          <p style="color: #64748b; font-size: 13px; margin-top: 32px;">
            If you didn't request this, you can safely ignore this email.
          </p>
          <div style="margin-top: 40px; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 24px;">
            <p style="color: #64748b; font-size: 12px; margin: 0; word-break: break-all;">
              Or copy this link: <br/>
              <span style="color: #10b981;">${resetUrl}</span>
            </p>
          </div>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password reset token',
        message
      });

      res.status(200).json({ success: true, message: 'Email sent' });
    } catch (err) {
      console.log(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/auth/resetpassword/:resettoken
 */
const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }

    if (req.body.password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = signToken(user._id);

    res.status(200).json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe, updateProfile, forgotPassword, resetPassword };
