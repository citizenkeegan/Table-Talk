import { Platform } from 'react-native';

/**
 * Generates an .ics file string for a given session.
 */
function generateICS(title: string, startDateUtc: string, durationHours: number = 2): string {
  const startDate = new Date(startDateUtc);
  const endDate = new Date(startDate.getTime() + (durationHours * 60 * 60 * 1000));

  // Format: YYYYMMDDTHHMMSSZ
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Table Talk//MVP//EN',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${title}`,
    'DESCRIPTION:Table Talk Campaign Session',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\n');
}

/**
 * Triggers a download of the .ics file on Web, or handles native intent on Mobile.
 */
export async function exportSessionToCalendar(title: string, startDateUtc: string) {
  const icsContent = generateICS(title, startDateUtc);

  if (Platform.OS === 'web') {
    // Create a blob and trigger download via a hidden anchor tag
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    // On native mobile, a full implementation would use `expo-calendar` or `expo-file-system` 
    // to save and share the file, or add directly to the calendar.
    // For this MVP, we alert the user (or we could implement the full expo-calendar insertion).
    alert("On native apps, this will write directly to your default calendar using expo-calendar APIs.");
  }
}
