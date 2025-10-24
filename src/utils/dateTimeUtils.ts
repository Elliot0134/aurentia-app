/**
 * Utility functions for handling date and time conversions
 * with proper timezone support for the calendar system
 */

/**
 * Converts a Date object to a datetime-local input string (YYYY-MM-DDTHH:mm)
 * WITHOUT timezone conversion - preserves the local time exactly as displayed
 *
 * @param date - The date to format
 * @returns String in format "YYYY-MM-DDTHH:mm" in local timezone
 */
export const formatDateForDatetimeLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Parses a datetime-local string (YYYY-MM-DDTHH:mm) to a Date object
 * in the local timezone
 *
 * @param dateStr - String in format "YYYY-MM-DDTHH:mm"
 * @returns Date object in local timezone
 */
export const parseDatetimeLocalToDate = (dateStr: string): Date => {
  // datetime-local format is already in local timezone
  return new Date(dateStr);
};

/**
 * Converts a Date object to ISO format for database storage
 *
 * @param date - The date to format
 * @returns ISO string with timezone (e.g., "2025-10-13T10:30:00.000Z")
 */
export const formatDateForDatabase = (date: Date): string => {
  return date.toISOString();
};

/**
 * Formats a datetime-local string (from input) to ISO for database
 *
 * @param dateStr - String in format "YYYY-MM-DDTHH:mm"
 * @returns ISO string for database storage
 */
export const formatDatetimeLocalForDatabase = (dateStr: string): string => {
  const date = parseDatetimeLocalToDate(dateStr);
  return formatDateForDatabase(date);
};

/**
 * Converts an ISO string from database to datetime-local format for form inputs
 * This handles the reverse conversion: database (ISO) -> form input (datetime-local)
 *
 * @param isoStr - ISO string from database (e.g., "2025-10-13T10:30:00.000Z")
 * @returns String in format "YYYY-MM-DDTHH:mm" in local timezone
 */
export const convertISOToDatetimeLocal = (isoStr: string): string => {
  const date = new Date(isoStr);
  return formatDateForDatetimeLocal(date);
};

/**
 * Converts a datetime-local string to ISO format for database storage
 * This is an alias for formatDatetimeLocalForDatabase for clarity
 *
 * @param dateStr - String in format "YYYY-MM-DDTHH:mm"
 * @returns ISO string for database storage
 */
export const convertDatetimeLocalToISO = (dateStr: string): string => {
  return formatDatetimeLocalForDatabase(dateStr);
};

/**
 * Ensures a date from FullCalendar is in local timezone
 * FullCalendar sometimes returns dates with timezone offsets
 *
 * @param date - Date from FullCalendar
 * @returns Date in local timezone
 */
export const normalizeFullCalendarDate = (date: Date): Date => {
  // Create a new date in local timezone with the same time components
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds()
  );
};

/**
 * Extracts date part from datetime-local string (YYYY-MM-DD)
 * Used for split date/time inputs
 *
 * @param datetimeLocal - String in format "YYYY-MM-DDTHH:mm"
 * @returns Date string in format "YYYY-MM-DD"
 */
export const extractDateFromDatetimeLocal = (datetimeLocal: string): string => {
  if (!datetimeLocal) return '';
  return datetimeLocal.split('T')[0];
};

/**
 * Extracts time part from datetime-local string (HH:mm)
 * Used for split date/time inputs
 *
 * @param datetimeLocal - String in format "YYYY-MM-DDTHH:mm"
 * @returns Time string in format "HH:mm"
 */
export const extractTimeFromDatetimeLocal = (datetimeLocal: string): string => {
  if (!datetimeLocal) return '';
  const parts = datetimeLocal.split('T');
  return parts.length > 1 ? parts[1] : '';
};

/**
 * Combines separate date and time inputs into datetime-local format
 * Used for combining split date/time inputs
 *
 * @param date - Date string in format "YYYY-MM-DD"
 * @param time - Time string in format "HH:mm"
 * @returns Datetime-local string in format "YYYY-MM-DDTHH:mm"
 */
export const combineDateAndTime = (date: string, time: string): string => {
  if (!date || !time) return '';
  return `${date}T${time}`;
};
