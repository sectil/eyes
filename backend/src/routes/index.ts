import { router } from '../trpc';
import { authRouter } from './auth';
import { profileRouter } from './profile';
import { eyeTrackingRouter } from './eyeTracking';
import { calibrationRouter } from './calibration';

export const appRouter = router({
  auth: authRouter,
  profile: profileRouter,
  eyeTracking: eyeTrackingRouter,
  calibration: calibrationRouter,
});

export type AppRouter = typeof appRouter;
