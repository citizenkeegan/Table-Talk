/**
 * Converts a UTC ISO string to the local device time string representation.
 * @param utcString ISO UTC string from database
 * @returns Localized readable string
 */
export function formatUTCToLocal(utcString: string): string {
  try {
    const date = new Date(utcString);
    // Returns date and time formatted to the user's current locale/timezone
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  } catch (error) {
    console.error('Error parsing date:', error);
    return utcString;
  }
}

/**
 * Creates a UTC ISO string from local input for database storage
 */
export function createUTCDate(localDate: Date): string {
  return localDate.toISOString();
}
