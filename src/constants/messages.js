// src/constants/messages.js

/**
 * Validation error types
 */
export const VALIDATION_ERRORS = {
  BOATS_MISSING: 'BOATS_MISSING',
  SEGELNUMMER_REQUIRED: 'SEGELNUMMER_REQUIRED',
  SEGELNUMMER_EXISTS: 'SEGELNUMMER_EXISTS',
  SEGELNUMMER_INVALID: 'SEGELNUMMER_INVALID',
  ALL_FIELDS_REQUIRED: 'ALL_FIELDS_REQUIRED',
  WETTFAHRT_INCOMPLETE: 'WETTFAHRT_INCOMPLETE'
};

/**
 * User-facing validation messages
 */
export const VALIDATION_MESSAGES = {
  [VALIDATION_ERRORS.BOATS_MISSING]: 'Wertung kann nicht abgeschlossen werden!',
  [VALIDATION_ERRORS.SEGELNUMMER_REQUIRED]: 'Segelnummer ist erforderlich',
  [VALIDATION_ERRORS.SEGELNUMMER_EXISTS]: 'Diese Segelnummer existiert bereits',
  [VALIDATION_ERRORS.SEGELNUMMER_INVALID]: 'Segelnummer enthält ungültige Zeichen',
  [VALIDATION_ERRORS.ALL_FIELDS_REQUIRED]: 'Bitte alle Felder ausfüllen',
  [VALIDATION_ERRORS.WETTFAHRT_INCOMPLETE]: 'Die Wettfahrt ist noch nicht vollständig'
};
