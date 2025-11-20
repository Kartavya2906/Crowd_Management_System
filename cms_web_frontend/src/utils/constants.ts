// src/utils/constants.ts

// API Base URL - Update this based on your environment
export const API_BASE_URL = 'https://crowd-management-system-lx1h.onrender.com';;

// Other constants can be added here
export const APP_NAME = 'Event Management System';
export const VERSION = '1.0.0';




// Other constants
export const DEFAULT_TIMEOUT = 30000; // 30 seconds
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

// Status options
export const LOST_PERSON_STATUSES = {
  MISSING: 'missing',
  SEARCHING: 'searching',
  FOUND: 'found',
  RESOLVED: 'resolved',
} as const;

// Priority options
export const LOST_PERSON_PRIORITIES = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;