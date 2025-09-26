import { rateLimiter } from './security';

// API 호출에 대한 Rate Limiting 적용
export class APIRateLimiter {
  private static readonly DEFAULT_LIMITS = {
    login: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 15분에 5회
    postCreate: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 1시간에 10회
    postUpdate: { maxRequests: 20, windowMs: 60 * 60 * 1000 }, // 1시간에 20회
    search: { maxRequests: 100, windowMs: 60 * 1000 }, // 1분에 100회
    general: { maxRequests: 1000, windowMs: 60 * 1000 } // 1분에 1000회
  };

  static checkLimit(operation: keyof typeof APIRateLimiter.DEFAULT_LIMITS, identifier: string): boolean {
    const limit = this.DEFAULT_LIMITS[operation];
    return rateLimiter.isAllowed(identifier, limit.maxRequests, limit.windowMs);
  }

  static recordAttempt(operation: keyof typeof APIRateLimiter.DEFAULT_LIMITS, identifier: string, success: boolean): void {
    const limit = this.DEFAULT_LIMITS[operation];
    rateLimiter.isAllowed(identifier, limit.maxRequests, limit.windowMs);
  }

  static getRemainingTime(operation: keyof typeof APIRateLimiter.DEFAULT_LIMITS, identifier: string): number {
    const limit = this.DEFAULT_LIMITS[operation];
    return Math.max(0, limit.windowMs - (Date.now() - (rateLimiter as any).requests.get(identifier)?.[0] || 0));
  }
}

// 특정 작업에 대한 Rate Limiting 데코레이터
export function withRateLimit(operation: keyof typeof APIRateLimiter.DEFAULT_LIMITS) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const identifier = args[0] || 'anonymous'; // 첫 번째 인자를 식별자로 사용
      
      if (!APIRateLimiter.checkLimit(operation, identifier)) {
        const remainingTime = Math.ceil(APIRateLimiter.getRemainingTime(operation, identifier) / 60000);
        throw new Error(`Rate limit exceeded. Please try again in ${remainingTime} minutes.`);
      }

      try {
        const result = await method.apply(this, args);
        APIRateLimiter.recordAttempt(operation, identifier, true);
        return result;
      } catch (error) {
        APIRateLimiter.recordAttempt(operation, identifier, false);
        throw error;
      }
    };
  };
}
