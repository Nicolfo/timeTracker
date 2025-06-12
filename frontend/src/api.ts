// API service for communicating with the backend


// API service for communicating with the backend
import type {CurrentStatusDTO, DailySummaryDTO, TimestampDTO, UserInfoDTO, WeeklySummaryDTO} from "./types.ts";

const API_BASE_URL = '/api';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  // Check if T is string type using type parameter

  return response.json() as Promise<T>;
}

// API functions for time tracking
export const timeTrackingApi = {
  // Insert a timestamp (toggle between START and STOP)
  async insertTimestamp(timestamp?: TimestampDTO): Promise<{ id: number }> {
    const response = await fetch(`${API_BASE_URL}/timestamps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(timestamp || {}),
      credentials: 'include',
    });
    return handleResponse<{ id: number }>(response);
  },

  // Get the current status
  async getCurrentStatus(): Promise<CurrentStatusDTO> {
    const response = await fetch(`${API_BASE_URL}/timestamps/status`, {
      credentials: 'include',
    });
    return handleResponse<CurrentStatusDTO>(response);
  },

  // Get daily summary for a specific date
  async getDailySummary(date: string): Promise<DailySummaryDTO> {
    const response = await fetch(`${API_BASE_URL}/timestamps/daily/${date}`, {
      credentials: 'include',
    });
    return handleResponse<DailySummaryDTO>(response);
  },

  // Get weekly summary for a specific date
  async getWeeklySummary(date: string): Promise<WeeklySummaryDTO> {
    const response = await fetch(`${API_BASE_URL}/timestamps/weekly/${date}`, {
      credentials: 'include',
    });
    return handleResponse<WeeklySummaryDTO>(response);
  },
};

// API functions for user authentication
export const userApi = {
  // Get the currently logged in user
  async getLoggedInUser(): Promise<UserInfoDTO> {
    const response = await fetch(`${API_BASE_URL}/user/logged-in`, {
      credentials: 'include',
    });
    return handleResponse<UserInfoDTO>(response);
  },
};