/**
 * Date utility functions
 */

export function getTodayDateString(): string {
  const today = new Date();
  return formatDateString(today);
}

export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateString(dateString: string): Date {
  return new Date(dateString + 'T00:00:00');
}

export function getDateStringDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDateString(date);
}

export function getDateStringDaysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDateString(date);
}

export function isToday(dateString: string): boolean {
  return dateString === getTodayDateString();
}

export function isYesterday(dateString: string): boolean {
  return dateString === getDateStringDaysAgo(1);
}

export function formatDateForDisplay(dateString: string): string {
  const date = parseDateString(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateForSidebar(dateString: string): string {
  const date = parseDateString(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
