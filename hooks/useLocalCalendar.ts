import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Calendar from 'expo-calendar';

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
}

export function useLocalCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // Calendar API is fully supported on iOS/Android. Web support is limited.
      if (Platform.OS === 'web') {
        setLoading(false);
        return;
      }
      
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        setPermissionGranted(true);
      }
      setLoading(false);
    })();
  }, []);

  const loadEventsForDateRange = async (startDate: Date, endDate: Date) => {
    if (!permissionGranted || Platform.OS === 'web') return;

    try {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      // Filter for calendars that are likely to contain personal events
      const activeCalendars = calendars.filter(c => c.allowsModifications || c.source.name === 'Default');
      const calendarIds = activeCalendars.map(c => c.id);

      if (calendarIds.length === 0) return;

      const fetchedEvents = await Calendar.getEventsAsync(
        calendarIds,
        startDate,
        endDate
      );

      const formattedEvents: CalendarEvent[] = fetchedEvents.map(e => ({
        id: e.id,
        title: e.title,
        startDate: new Date(e.startDate).toISOString(),
        endDate: new Date(e.endDate).toISOString()
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Failed to load calendar events", error);
    }
  };

  /**
   * Checks if a proposed time overlaps with any local calendar events.
   * Assumes proposedTime is a 2-hour window for MVP.
   */
  const checkConflict = (proposedTimeUtc: string): CalendarEvent | null => {
    const proposedStart = new Date(proposedTimeUtc).getTime();
    const proposedEnd = proposedStart + (2 * 60 * 60 * 1000); // 2 hour duration

    const conflict = events.find(event => {
      const eventStart = new Date(event.startDate).getTime();
      const eventEnd = new Date(event.endDate).getTime();
      
      // Check for overlap
      return (proposedStart < eventEnd && proposedEnd > eventStart);
    });

    return conflict || null;
  };

  return {
    events,
    permissionGranted,
    loading,
    loadEventsForDateRange,
    checkConflict
  };
}
