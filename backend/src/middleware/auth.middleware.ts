import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/apiError.js';
import { verifyToken } from '../utils/token.js';
import { User, IUserDocument } from '../models/user.model.js';
import { isDatabaseReady } from '../config/database.js';
import { env } from '../config/env.js';

export interface AuthenticatedRequest extends Request {
  user?: IUserDocument | { id: string; email: string };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined = undefined;

    // 1. Check HttpOnly cookie first (preferred for browser clients)
    if (req.cookies && req.cookies[env.COOKIE_NAME]) {
      token = req.cookies[env.COOKIE_NAME];
    }

    // 2. Fall back to Authorization Bearer header (for mobile/API clients)
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw AppError.unauthorized('Authentication required: No session token provided');
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw AppError.unauthorized('Session has expired or token is invalid. Please log in again.');
    }

    // If MongoDB is connected, load the live user record
    if (isDatabaseReady()) {
      const user = await User.findById(payload.id).select('+password');
      if (!user) {
        throw AppError.unauthorized('The user account associated with this session no longer exists');
      }

      if (user.accountStatus === 'suspended' || user.accountStatus === 'deactivated') {
        throw AppError.forbidden(`Account access has been ${user.accountStatus}`);
      }

      req.user = user;
    } else {
      req.user = { id: payload.id, email: payload.email };
    }

    next();
  } catch (error) {
    next(error);
  }
};
