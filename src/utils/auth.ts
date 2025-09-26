import { supabase } from './supabase/client';

// JWT 토큰 관리
export class AuthManager {
  private static readonly ADMIN_TOKEN_KEY = 'admin_token';
  private static readonly ADMIN_EMAIL_KEY = 'admin_email';
  private static readonly TOKEN_EXPIRY_KEY = 'token_expiry';

  // 관리자 로그인
  static async loginAdmin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 환경변수에서 관리자 자격증명 확인
      const adminUsername = import.meta.env.VITE_ADMIN_USERNAME;
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

      if (!adminUsername || !adminPassword) {
        return { success: false, error: 'Admin credentials not configured' };
      }

      if (email !== adminUsername || password !== adminPassword) {
        return { success: false, error: 'Invalid credentials' };
      }

      // JWT 토큰 생성 (간단한 구현)
      const token = this.generateJWT({ email, role: 'admin' });
      const expiry = Date.now() + (24 * 60 * 60 * 1000); // 24시간

      // 토큰 저장
      localStorage.setItem(this.ADMIN_TOKEN_KEY, token);
      localStorage.setItem(this.ADMIN_EMAIL_KEY, email);
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiry.toString());

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  // 로그아웃
  static logout(): void {
    localStorage.removeItem(this.ADMIN_TOKEN_KEY);
    localStorage.removeItem(this.ADMIN_EMAIL_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
  }

  // 관리자 권한 확인
  static isAdmin(): boolean {
    try {
      const token = localStorage.getItem(this.ADMIN_TOKEN_KEY);
      const email = localStorage.getItem(this.ADMIN_EMAIL_KEY);
      const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);

      if (!token || !email || !expiry) {
        return false;
      }

      // 토큰 만료 확인
      if (Date.now() > parseInt(expiry)) {
        this.logout();
        return false;
      }

      // 토큰 유효성 확인
      const payload = this.parseJWT(token);
      return payload && payload.email === email && payload.role === 'admin';
    } catch (error) {
      console.error('Auth check error:', error);
      this.logout();
      return false;
    }
  }

  // JWT 토큰 생성 (간단한 구현)
  private static generateJWT(payload: any): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = btoa(`${encodedHeader}.${encodedPayload}.secret`);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  // JWT 토큰 파싱
  private static parseJWT(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      return null;
    }
  }

  // 토큰 갱신
  static refreshToken(): boolean {
    if (!this.isAdmin()) {
      return false;
    }

    const email = localStorage.getItem(this.ADMIN_EMAIL_KEY);
    if (!email) return false;

    // 새 토큰 생성
    const token = this.generateJWT({ email, role: 'admin' });
    const expiry = Date.now() + (24 * 60 * 60 * 1000);

    localStorage.setItem(this.ADMIN_TOKEN_KEY, token);
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiry.toString());

    return true;
  }
}

// Rate limiting for authentication attempts
export class AuthRateLimit {
  private static attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly LOCKOUT_TIME = 15 * 60 * 1000; // 15분

  static isBlocked(identifier: string): boolean {
    const attempt = this.attempts.get(identifier);
    if (!attempt) return false;

    const now = Date.now();
    if (now - attempt.lastAttempt > this.LOCKOUT_TIME) {
      this.attempts.delete(identifier);
      return false;
    }

    return attempt.count >= this.MAX_ATTEMPTS;
  }

  static recordAttempt(identifier: string, success: boolean): void {
    const now = Date.now();
    const attempt = this.attempts.get(identifier) || { count: 0, lastAttempt: now };

    if (success) {
      this.attempts.delete(identifier);
    } else {
      attempt.count++;
      attempt.lastAttempt = now;
      this.attempts.set(identifier, attempt);
    }
  }

  static getRemainingTime(identifier: string): number {
    const attempt = this.attempts.get(identifier);
    if (!attempt) return 0;

    const now = Date.now();
    const elapsed = now - attempt.lastAttempt;
    return Math.max(0, this.LOCKOUT_TIME - elapsed);
  }
}
