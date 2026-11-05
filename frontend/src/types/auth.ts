export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  accountStatus: 'active' | 'suspended' | 'pending';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  fullName?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface AuthSuccessData {
  user: User;
  token?: string;
}

export interface AuthResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

