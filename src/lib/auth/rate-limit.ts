// Simple in-memory rate limiter for login attempts
const attempts = new Map<string, { count: number, resetTime: number }>();

export function checkRateLimit(identifier: string) {
  const now = Date.now();
  const userAttempt = attempts.get(identifier);

  if (userAttempt && now < userAttempt.resetTime) {
    if (userAttempt.count >= 5) {
      return { allowed: false, retryAfter: Math.ceil((userAttempt.resetTime - now) / 1000) };
    }
  }

  return { allowed: true };
}

export function incrementRateLimit(identifier: string) {
  const now = Date.now();
  const userAttempt = attempts.get(identifier);

  if (!userAttempt || now > userAttempt.resetTime) {
    attempts.set(identifier, { count: 1, resetTime: now + 5 * 60 * 1000 }); // 5 minutes window
  } else {
    userAttempt.count += 1;
  }
}

export function resetRateLimit(identifier: string) {
  attempts.delete(identifier);
}
