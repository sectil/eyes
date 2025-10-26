import { router } from '../trpc';
import { authRouter } from './auth';
import { profileRouter } from './profile';
import { eyeTrackingRouter } from './eyeTracking';

export const appRouter = router({
  auth: authRouter,
  profile: profileRouter,
  eyeTracking: eyeTrackingRouter,
});

export type AppRouter = typeof appRouter;
