import { Throttle } from '@nestjs/throttler';

export const StrictThrottle = () =>
  Throttle({
    default: {
      limit: 5,
      ttl: 60000,
    },
  });

export const ModerateThrottle = () =>
  Throttle({
    default: {
      limit: 20,
      ttl: 60000,
    },
  });

export const RelaxedThrottle = () =>
  Throttle({
    default: {
      limit: 50,
      ttl: 60000,
    },
  });
