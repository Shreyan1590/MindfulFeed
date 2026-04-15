/**
 * MindfulFeed Standardized Error Mapping
 * 
 * Maps technical error messages and statuses to diagnostic codes.
 * N1 - Network (Fetch/DNS)
 * S1 - Server (500/Worker Crash)
 * D1 - Database (D1/SQLite)
 * A1 - Auth (Credentials/Session)
 * R1 - R2 Storage (Upload)
 * U1 - Validation (Formatting/Required)
 */

export type ErrorCode = 'D1' | 'A1' | 'N1' | 'S1' | 'R1' | 'U1' | 'G1';

interface StandardError {
  code: ErrorCode;
  label: string;
}

export function getErrorCode(error: any): StandardError {
  const msg = (String(error?.message || error) || '').toLowerCase();
  
  // 1. Network Errors (Check first to avoid masking by logic errors)
  if (
    msg.includes('fetch') || 
    msg.includes('network') || 
    msg.includes('offline') || 
    msg.includes('internet') ||
    msg.includes('dns')
  ) {
    return { code: 'N1', label: 'Network Error' };
  }

  // 2. Server Errors
  if (msg.includes('500') || msg.includes('worker error') || msg.includes('internal server')) {
    return { code: 'S1', label: 'Server Error' };
  }

  // 3. Database / D1 Errors
  if (
    msg.includes('d1_error') || 
    msg.includes('sqlite') || 
    msg.includes('sql') || 
    msg.includes('no such column') || 
    msg.includes('constraint') ||
    msg.includes('database')
  ) {
    return { code: 'D1', label: 'Database Error' };
  }

  // 4. Authentication Errors (More specific keywords to avoid false positives)
  if (
    msg.includes('auth') || 
    msg.includes('login') || 
    msg.includes('register') || 
    msg.includes('unauthorized') || 
    msg.includes('token') ||
    msg.includes('credentials') ||
    msg.includes('invalid email') ||
    msg.includes('invalid password') ||
    msg.includes('incorrect')
  ) {
    return { code: 'A1', label: 'Auth Error' };
  }

  // 5. R2 Storage Errors
  if (msg.includes('r2') || msg.includes('upload') || msg.includes('bucket')) {
    return { code: 'R1', label: 'Storage Error' };
  }

  // 6. Validation/Logic
  if (msg.includes('match') || msg.includes('required')) {
    return { code: 'U1', label: 'Validation Error' };
  }

  // Generic Fallback
  return { code: 'G1', label: 'System Error' };
}

export function formatErrorCode(error: any): string {
  const err = getErrorCode(error);
  return `${err.label} (${err.code})`;
}
