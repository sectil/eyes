import { router } from '../trpc';
import { authRouter } from './auth';
import { profileRouter } from './profile';
import { eyeTrackingRouter } from './eyeTracking';
import { calibrationRouter } from './calibration';
import { exercisesRouter } from './exercises';
import { testsRouter } from './tests';
import { progressRouter } from './progress';

export const appRouter = router({
  auth: authRouter,
  profile: profileRouter,
  eyeTracking: eyeTrackingRouter,
  calibration: calibrationRouter,
  exercises: exercisesRouter,
  tests: testsRouter,
  progress: progressRouter,
});

export type AppRouter = typeof appRouter;
