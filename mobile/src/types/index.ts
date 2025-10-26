// Import AppRouter type from backend
// This will be used for type-safe TRPC client
export type { AppRouter } from '../../../backend/src/routes';

export interface User {
  id: string;
  email: string;
  name: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  isEmailVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface EyeProfile {
  id: string;
  userId: string;
  occupation?: string;
  dailyScreenTime?: number;
  dailyOutdoorTime?: number;
  sleepHours?: number;
  usesGlasses: boolean;
  rightEyeDiopter?: string;
  leftEyeDiopter?: string;
  hasAstigmatism: boolean;
  astigmatismDegree?: string;
  familyHistory?: string;
  lastEyeExam?: string;
}
