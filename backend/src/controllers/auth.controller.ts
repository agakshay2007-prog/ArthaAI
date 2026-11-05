import { Request, Response } from 'express';
import { User, IUserDocument } from '../models/user.model.js';
import { AppError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { generateToken, setAuthCookie, clearAuthCookie } from '../utils/token.js';
import { isDatabaseReady } from '../config/database.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

// Email format regex RFC 5322 standard simplification
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Strong password check: min 8 characters, at least 1 number, at least 1 letter
const isStrongPassword = (pass: string): boolean => {
  return pass.length >= 8 && /[A-Za-z]/.test(pass) && /[0-9]/.test(pass);
};

const assertDatabaseReady = (): void => {
  if (!isDatabaseReady()) {
    throw new AppError(
      'Database service is currently unconfigured or disconnected. Please configure MONGODB_URI in backend/.env to access live user account operations.',
      503
    );
  }
};

/**
 * POST /api/auth/register
 * Register a new personal user account
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const { fullName, email, password, phoneNumber } = req.body;

  // Validation
  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    throw AppError.badRequest('Full name is required (minimum 2 characters)');
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    throw AppError.badRequest('A valid email address is required');
  }

  if (!password || typeof password !== 'string' || !isStrongPassword(password)) {
    throw AppError.badRequest(
      'Password must be at least 8 characters long and contain both letters and numbers'
    );
  }

  assertDatabaseReady();

  const normalizedEmail = email.trim().toLowerCase();

  // Duplicate email check
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError('An account with this email address already exists', 409);
  }

  // Create new user
  const user = new User({
    fullName: fullName.trim(),
    email: normalizedEmail,
    password,
    phoneNumber: phoneNumber ? String(phoneNumber).trim() : undefined,
  });

  await user.save();

  // Generate token and configure HttpOnly cookie
  const token = generateToken({ id: user.id, email: user.email });
  setAuthCookie(res, token);

  ApiResponse.created(res, 'User registered successfully', {
    user,
    token,
  });
};

/**
 * POST /api/auth/login
 * Authenticate existing user with email and password
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw AppError.badRequest('Email and password credentials are required');
  }

  assertDatabaseReady();

  const normalizedEmail = String(email).trim().toLowerCase();

  // Fetch user explicitly selecting the hidden password field
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  // Generic constant-time failure response for invalid email or password
  if (!user) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const isPasswordValid = await user.comparePassword(String(password));
  if (!isPasswordValid) {
    throw AppError.unauthorized('Invalid email or password');
  }

  if (user.accountStatus !== 'active') {
    throw AppError.forbidden(`Account access has been ${user.accountStatus}`);
  }

  // Issue token and cookie
  const token = generateToken({ id: user.id, email: user.email });
  setAuthCookie(res, token);

  ApiResponse.success(res, 'Authentication successful', {
    user,
    token,
  });
};

/**
 * POST /api/auth/logout
 * Invalidate session and clear authentication cookie
 */
export const logout = (_req: Request, res: Response): void => {
  clearAuthCookie(res);
  ApiResponse.success(res, 'Logged out successfully', null);
};

/**
 * GET /api/auth/me
 * Retrieve current authenticated session identity
 */
export const getMe = (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    throw AppError.unauthorized('User session not found');
  }

  ApiResponse.success(res, 'User session verified', {
    user: req.user,
  });
};

/**
 * PATCH /api/auth/profile
 * Update user full name, phone number or profile avatar
 */
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  assertDatabaseReady();

  if (!req.user || !('id' in req.user)) {
    throw AppError.unauthorized('User session not found');
  }

  const { fullName, phoneNumber, profileImageUrl } = req.body;

  const updates: Partial<IUserDocument> = {};

  if (fullName !== undefined) {
    if (typeof fullName !== 'string' || fullName.trim().length < 2) {
      throw AppError.badRequest('Full name must be at least 2 characters');
    }
    updates.fullName = fullName.trim();
  }

  if (phoneNumber !== undefined) {
    updates.phoneNumber = typeof phoneNumber === 'string' ? phoneNumber.trim() : undefined;
  }

  if (profileImageUrl !== undefined) {
    updates.profileImageUrl =
      typeof profileImageUrl === 'string' ? profileImageUrl.trim() : undefined;
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    throw AppError.notFound('User account not found');
  }

  ApiResponse.success(res, 'Profile updated successfully', {
    user: updatedUser,
  });
};

/**
 * PATCH /api/auth/change-password
 * Securely change account password verifying current credentials
 */
export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  assertDatabaseReady();

  if (!req.user || !('id' in req.user)) {
    throw AppError.unauthorized('User session not found');
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw AppError.badRequest('Current password and new password are required');
  }

  if (!isStrongPassword(String(newPassword))) {
    throw AppError.badRequest(
      'New password must be at least 8 characters long and contain both letters and numbers'
    );
  }

  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    throw AppError.notFound('User account not found');
  }

  const isCurrentValid = await user.comparePassword(String(currentPassword));
  if (!isCurrentValid) {
    throw AppError.badRequest('Current password provided is incorrect');
  }

  if (currentPassword === newPassword) {
    throw AppError.badRequest('New password must be different from current password');
  }

  user.password = String(newPassword);
  await user.save();

  // Re-issue token & reset cookie
  const token = generateToken({ id: user.id, email: user.email });
  setAuthCookie(res, token);

  ApiResponse.success(res, 'Password changed successfully', null);
};
