import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from '../types/auth';
import { authService } from '../services/auth';

export const GUEST_USER: User = {
  id: 'guest-alex-morgan',
  fullName: 'Alex Morgan',
  email: 'alex.morgan@artha.ai',
  phoneNumber: '+1 (555) 234-5678',
  accountStatus: 'active',
  isEmailVerified: true,
  createdAt: '2026-01-15T08:00:00.000Z',
  updatedAt: new Date().toISOString(),
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isGuestMode: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
  updateProfile: (payload: UpdateProfilePayload) => Promise<boolean>;
  changePassword: (payload: ChangePasswordPayload) => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Initialize session verification on mount
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      try {
        const res = await authService.getMe();
        if (isMounted && res.data?.user) {
          setUser(res.data.user);
          setIsGuestMode(false);
          localStorage.removeItem('artha_guest_mode');
          return;
        }
      } catch {
        // Not authenticated via HttpOnly cookie or backend unconfigured
      }

      // Check if user previously chosen guest demo mode
      if (isMounted) {
        const wasGuest = localStorage.getItem('artha_guest_mode') === 'true';
        if (wasGuest) {
          setUser(GUEST_USER);
          setIsGuestMode(true);
        } else {
          setUser(null);
          setIsGuestMode(false);
        }
      }
    };

    verifySession().finally(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials: LoginPayload): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.login(credentials);
      if (res.data?.user) {
        setUser(res.data.user);
        setIsGuestMode(false);
        localStorage.removeItem('artha_guest_mode');
        return true;
      }
      return false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.register(payload);
      if (res.data?.user) {
        setUser(res.data.user);
        setIsGuestMode(false);
        localStorage.removeItem('artha_guest_mode');
        return true;
      }
      return false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (!isGuestMode) {
        await authService.logout().catch(() => {});
      }
    } finally {
      setUser(null);
      setIsGuestMode(false);
      localStorage.removeItem('artha_guest_mode');
      setIsLoading(false);
    }
  };

  const enterGuestMode = () => {
    setUser(GUEST_USER);
    setIsGuestMode(true);
    localStorage.setItem('artha_guest_mode', 'true');
    setError(null);
  };

  const exitGuestMode = () => {
    setUser(null);
    setIsGuestMode(false);
    localStorage.removeItem('artha_guest_mode');
    setError(null);
  };

  const updateProfile = async (payload: UpdateProfilePayload): Promise<boolean> => {
    setError(null);
    if (isGuestMode) {
      // In guest demo mode, update local state
      setUser((prev) => (prev ? { ...prev, ...payload } : null));
      return true;
    }

    try {
      const res = await authService.updateProfile(payload);
      if (res.data?.user) {
        setUser(res.data.user);
        return true;
      }
      return false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Profile update failed';
      setError(msg);
      return false;
    }
  };

  const changePassword = async (payload: ChangePasswordPayload): Promise<boolean> => {
    setError(null);
    if (isGuestMode) {
      // In guest demo mode, simulate success
      return true;
    }

    try {
      await authService.changePassword(payload);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Password change failed';
      setError(msg);
      return false;
    }
  };

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isGuestMode,
        isLoading,
        error,
        login,
        register,
        logout,
        enterGuestMode,
        exitGuestMode,
        updateProfile,
        changePassword,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
