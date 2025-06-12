// Utility functions for the time tracking application

// Interface for holiday data from the API
interface Holiday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
}

// Cache for holiday data to avoid repeated API calls
const holidayCache: Record<string, string[]> = {};

/**
 * Fetch holidays for a specific year from the API
 * @param year The year to fetch holidays for
 * @returns Array of holiday dates in YYYY-MM-DD format
 */
export async function fetchHolidays(year: number): Promise<string[]> {
  if (holidayCache[year.toString()]) {
    return holidayCache[year.toString()];
  }

  try {
    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/IT`);
    if (!response.ok) {
      throw new Error('Failed to fetch holidays');
    }

    const holidays = await response.json() as Holiday[];
    const holidayDates = holidays.map((holiday: Holiday) => holiday.date);

    // Cache the results
    holidayCache[year.toString()] = holidayDates;

    return holidayDates;
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return [];
  }
}

/**
 * Check if a date is a holiday in Italy
 * @param dateString ISO date string
 * @returns true if the date is a holiday, false otherwise
 */
export function isHolyday(dateString: string): boolean {
  // Get the date in YYYY-MM-DD format
  const date = new Date(dateString);
  const year = date.getFullYear();
  console.log("is Holyday?",year);
  const formattedDate = dateString.split('T')[0]; // Get YYYY-MM-DD part

  // Check if the date is in the holiday cache
  if (holidayCache[year.toString()]) {
    return holidayCache[year.toString()].includes(formattedDate);
  }

  // If not in cache, we'll return false for now
  // The component should call fetchHolidays separately to populate the cache
  return false;
}

/**
 * Check if a date is a weekend (Saturday or Sunday)
 * @param dateString ISO date string
 * @returns true if the date is a weekend, false otherwise
 */
export function isWeekend(dateString: string): boolean {
  const date = new Date(dateString);
  const day = date.getDay();
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
}

/**
 * Format a duration in minutes to a human-readable string (e.g., "2h 30m")
 * @param minutes Duration in minutes
 * @returns Formatted duration string
 */
export function formatDuration(minutes: number): string {
  if (!minutes && minutes !== 0) return 'N/A';

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.floor(minutes % 60);

  if (hours === 0) {
    return `${remainingMinutes}m`;
  } else if (remainingMinutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${remainingMinutes}m`;
  }
}

/**
 * Format a date-time string to a human-readable format
 * @param dateTimeString ISO date-time string
 * @returns Formatted date-time string
 */
export function formatDateTime(dateTimeString?: string): string {
  if (!dateTimeString) return 'N/A';

  const date = new Date(dateTimeString);

  // Format: "Jan 1, 2023, 13:45"
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a date string to a human-readable format
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);

  // Format: "Jan 1, 2023"
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
