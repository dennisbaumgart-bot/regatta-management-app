import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Lock, Unlock, ChevronLeft, Save, X, ArrowUpDown, ArrowUp, ArrowDown, GripVertical, Trophy, Check } from 'lucide-react';

// ============================================================================
// CONSTANTS
// ============================================================================

// Penalty Codes
const PENALTY_CODES = {
  DNF: 'DNF',  // Did Not Finish
  DNS: 'DNS',  // Did Not Start
  DNC: 'DNC',  // Did Not Compete
  DSQ: 'DSQ'   // Disqualified
};

// Penalty Order (for sorting)
const PENALTY_ORDER = {
  [PENALTY_CODES.DNF]: 0,
  [PENALTY_CODES.DNS]: 1,
  [PENALTY_CODES.DNC]: 2,
  [PENALTY_CODES.DSQ]: 3
};

// Penalty Labels (human-readable)
const PENALTY_LABELS = {
  [PENALTY_CODES.DNF]: 'Did Not Finish',
  [PENALTY_CODES.DNS]: 'Did Not Start',
  [PENALTY_CODES.DNC]: 'Did Not Compete',
  [PENALTY_CODES.DSQ]: 'Disqualified'
};

// View Names
const VIEWS = {
  OVERVIEW: 'overview',
  REGATTA_DETAIL: 'regattaDetail',
  CREATE_REGATTA: 'createRegatta',
  EDIT_REGATTA: 'editRegatta',
  EDIT_BOAT: 'editBoat',
  WERTUNG: 'wertung',
  WETTFAHRTEN_OVERVIEW: 'wettfahrtenOverview',
  ZIELERFASSUNG: 'zielerfassung',
  ERGEBNISSE: 'ergebnisseView'
};

// Navigation Items
const NAV_ITEMS = {
  ORGANISATION: 'organisation',
  WERTUNG: 'wertung'
};

// Storage Keys
const STORAGE_KEYS = {
  REGATTAS: 'regattas',
  BOATS: 'boats',
  WETTFAHRTEN: 'wettfahrten',
  ERGEBNISSE: 'ergebnisse'
};

// UI Constants
const UI = {
  MIN_TOUCH_HEIGHT: 44,
  MIN_BUTTON_HEIGHT: 48,
  SCROLL_DELAY: 100,
  DEBOUNCE_DELAY: 300
};

// ============================================================================
// DESIGN SYSTEM - Visual Design Tokens
// ============================================================================

/**
 * Design System Tokens für konsistentes Look & Feel
 * Mobile-First: Alle Größen optimiert für Touch-Bedienung
 */
const DESIGN_TOKENS = {
  // Card Styles (konsistente Container)
  card: {
    base: 'bg-white rounded-xl shadow-sm',
    padding: 'p-6',
    spacing: 'mb-6',
    // Kombiniert
    full: 'bg-white rounded-xl shadow-sm p-6 mb-6'
  },

  // Button Styles
  button: {
    // Heights (min 44px für Touch-Targets nach Apple HIG)
    height: {
      small: '44px',    // Standard Touch Target
      medium: '48px',   // Emphasized Actions
      large: '56px'     // Primary CTAs
    },
    // Padding
    padding: {
      small: 'px-4 py-2',
      medium: 'px-6 py-3',
      large: 'px-8 py-4'
    },
    // Base Styles
    base: 'rounded-lg font-medium transition-all duration-150 active:scale-95',
    // Variants
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
    success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    warning: 'bg-orange-600 text-white hover:bg-orange-700 active:bg-orange-800'
  },

  // Spacing Scale (8pt Grid System)
  spacing: {
    xs: 'gap-2',    // 8px
    sm: 'gap-3',    // 12px
    md: 'gap-4',    // 16px
    lg: 'gap-6',    // 24px
    xl: 'gap-8'     // 32px
  },

  // Typography Scale
  text: {
    h1: 'text-3xl font-bold',           // Page Titles (30px)
    h2: 'text-2xl font-bold',           // Section Titles (24px)
    h3: 'text-xl font-bold',            // Card Titles (20px)
    body: 'text-base',                  // Body Text (16px - no iOS zoom)
    small: 'text-sm',                   // Helper Text (14px)
    xs: 'text-xs'                       // Labels (12px)
  },

  // Input Styles
  input: {
    base: 'w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base',
    error: 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
  },

  // Border Radius (konsistent)
  radius: {
    sm: 'rounded-lg',    // Small elements
    md: 'rounded-xl',    // Cards, Modals
    lg: 'rounded-2xl',   // Large containers
    full: 'rounded-full' // Pills, Avatars
  },

  // Shadows (konsistent)
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  }
};

/**
 * Helper Functions für häufige Kombinationen
 */
const getCardClass = () => DESIGN_TOKENS.card.full;

const getButtonClass = (variant = 'primary', size = 'medium') => {
  return `${DESIGN_TOKENS.button.base} ${DESIGN_TOKENS.button[variant]} ${DESIGN_TOKENS.button.padding[size]}`;
};

const getInputClass = (hasError = false) => {
  return `${DESIGN_TOKENS.input.base} ${hasError ? DESIGN_TOKENS.input.error : ''}`;
};

// Validation Error Types
const VALIDATION_ERRORS = {
  BOATS_MISSING: 'BOATS_MISSING',
  SEGELNUMMER_REQUIRED: 'SEGELNUMMER_REQUIRED',
  SEGELNUMMER_EXISTS: 'SEGELNUMMER_EXISTS',
  SEGELNUMMER_INVALID: 'SEGELNUMMER_INVALID',
  ALL_FIELDS_REQUIRED: 'ALL_FIELDS_REQUIRED',
  WETTFAHRT_INCOMPLETE: 'WETTFAHRT_INCOMPLETE'
};

// Validation Messages
const VALIDATION_MESSAGES = {
  [VALIDATION_ERRORS.BOATS_MISSING]: 'Wertung kann nicht abgeschlossen werden!',
  [VALIDATION_ERRORS.SEGELNUMMER_REQUIRED]: 'Segelnummer ist erforderlich',
  [VALIDATION_ERRORS.SEGELNUMMER_EXISTS]: 'Diese Segelnummer existiert bereits',
  [VALIDATION_ERRORS.SEGELNUMMER_INVALID]: 'Segelnummer enthält ungültige Zeichen',
  [VALIDATION_ERRORS.ALL_FIELDS_REQUIRED]: 'Bitte alle Felder ausfüllen',
  [VALIDATION_ERRORS.WETTFAHRT_INCOMPLETE]: 'Die Wettfahrt ist noch nicht vollständig'
};

// Medal Emojis
const MEDALS = ['🥇', '🥈', '🥉'];

// ============================================================================
// VALIDATORS
// ============================================================================

/**
 * Validation result structure
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether validation passed
 * @property {string} [error] - Error type from VALIDATION_ERRORS
 * @property {Object} [data] - Additional error data
 * @property {string} [message] - Human-readable error message
 */

const validators = {
  // Wertung Validators
  wertung: {
    /**
     * Check if all boats in regatta are rated
     * @param {Array} regattaBoats - All boats in the regatta
     * @param {Array} zielBoats - Boats that have been rated
     * @returns {ValidationResult}
     */
    allBoatsRated: (regattaBoats, zielBoats) => {
      const missingBoats = regattaBoats.filter(boat => !zielBoats.includes(boat.id));
      
      if (missingBoats.length === 0) {
        return { valid: true };
      }
      
      return {
        valid: false,
        error: VALIDATION_ERRORS.BOATS_MISSING,
        message: VALIDATION_MESSAGES[VALIDATION_ERRORS.BOATS_MISSING],
        data: {
          count: missingBoats.length,
          boats: missingBoats
        }
      };
    },

    /**
     * Check if wettfahrt is complete (has results for all boats)
     * @param {Object} wettfahrt - The wettfahrt to check
     * @param {Array} ergebnisse - All results
     * @param {Array} boats - All boats in regatta
     * @returns {ValidationResult}
     */
    wettfahrtComplete: (wettfahrt, ergebnisse, boats) => {
      const wettfahrtResults = queries.wettfahrt.getResults(ergebnisse, wettfahrt.id);
      const regattaBoats = queries.regatta.getBoats(boats, wettfahrt.regattaId);
      
      if (wettfahrtResults.length === regattaBoats.length) {
        return { valid: true };
      }
      
      return {
        valid: false,
        error: VALIDATION_ERRORS.WETTFAHRT_INCOMPLETE,
        message: VALIDATION_MESSAGES[VALIDATION_ERRORS.WETTFAHRT_INCOMPLETE],
        data: {
          expected: regattaBoats.length,
          actual: wettfahrtResults.length,
          missing: regattaBoats.length - wettfahrtResults.length
        }
      };
    }
  },

  // Boot Validators
  boot: {
    /**
     * Check if segelnummer is provided
     * @param {string} segelnummer - The segelnummer to validate
     * @returns {ValidationResult}
     */
    segelnummerRequired: (segelnummer) => {
      if (segelnummer && segelnummer.trim().length > 0) {
        return { valid: true };
      }
      
      return {
        valid: false,
        error: VALIDATION_ERRORS.SEGELNUMMER_REQUIRED,
        message: VALIDATION_MESSAGES[VALIDATION_ERRORS.SEGELNUMMER_REQUIRED]
      };
    },

    /**
     * Check if segelnummer is unique in regatta
     * @param {string} segelnummer - The segelnummer to check
     * @param {string} regattaId - The regatta ID
     * @param {Array} boats - All boats
     * @param {string} [currentBoatId] - ID of boat being edited (to exclude from check)
     * @returns {ValidationResult}
     */
    segelnummerUnique: (segelnummer, regattaId, boats, currentBoatId = null) => {
      const existingBoat = boats.find(b => 
        b.regattaId === regattaId && 
        b.segelnummer === segelnummer &&
        b.id !== currentBoatId
      );
      
      if (!existingBoat) {
        return { valid: true };
      }
      
      return {
        valid: false,
        error: VALIDATION_ERRORS.SEGELNUMMER_EXISTS,
        message: VALIDATION_MESSAGES[VALIDATION_ERRORS.SEGELNUMMER_EXISTS],
        data: {
          existingBoatId: existingBoat.id,
          segelnummer: segelnummer
        }
      };
    },

    /**
     * Validate segelnummer format (no special characters except space and dash)
     * @param {string} segelnummer - The segelnummer to validate
     * @returns {ValidationResult}
     */
    segelnummerValid: (segelnummer) => {
      const validPattern = /^[a-zA-Z0-9\s-]+$/;
      
      if (validPattern.test(segelnummer)) {
        return { valid: true };
      }
      
      return {
        valid: false,
        error: VALIDATION_ERRORS.SEGELNUMMER_INVALID,
        message: VALIDATION_MESSAGES[VALIDATION_ERRORS.SEGELNUMMER_INVALID]
      };
    }
  },

  // Regatta Validators
  regatta: {
    /**
     * Check if all required fields are filled
     * @param {Object} regatta - The regatta form data
     * @returns {ValidationResult}
     */
    allFieldsRequired: (regatta) => {
      const requiredFields = ['name', 'datum'];
      const missingFields = requiredFields.filter(field => !regatta[field] || regatta[field].trim().length === 0);
      
      if (missingFields.length === 0) {
        return { valid: true };
      }
      
      return {
        valid: false,
        error: VALIDATION_ERRORS.ALL_FIELDS_REQUIRED,
        message: VALIDATION_MESSAGES[VALIDATION_ERRORS.ALL_FIELDS_REQUIRED],
        data: {
          missingFields: missingFields
        }
      };
    }
  }
};

// ============================================================================
// DATA ACCESS LAYER (Selectors/Queries)
// ============================================================================

/**
 * Zentrale Queries für Daten-Zugriffe
 * Verhindert Code-Duplikation und sorgt für konsistente Filter-Logik
 */
const queries = {
  // Regatta Queries
  regatta: {
    /**
     * Get all boats for a regatta
     * @param {Array} boats - All boats
     * @param {string} regattaId - Regatta ID
     * @returns {Array} Filtered boats
     */
    getBoats: (boats, regattaId) => {
      return boats.filter(b => b.regattaId === regattaId);
    },

    /**
     * Get all wettfahrten for a regatta
     * @param {Array} wettfahrten - All wettfahrten
     * @param {string} regattaId - Regatta ID
     * @returns {Array} Filtered wettfahrten
     */
    getWettfahrten: (wettfahrten, regattaId) => {
      return wettfahrten.filter(w => w.regattaId === regattaId);
    },

    /**
     * Get completed wettfahrten for a regatta
     * @param {Array} wettfahrten - All wettfahrten
     * @param {string} regattaId - Regatta ID
     * @returns {Array} Completed wettfahrten
     */
    getCompletedWettfahrten: (wettfahrten, regattaId) => {
      return wettfahrten.filter(w => w.regattaId === regattaId && w.abgeschlossen);
    },

    /**
     * Get available boats (not yet in Ziel)
     * @param {Array} boats - All boats
     * @param {string} regattaId - Regatta ID
     * @param {Array} zielBoats - Boat IDs already in Ziel
     * @returns {Array} Available boats
     */
    getAvailableBoats: (boats, regattaId, zielBoats) => {
      return boats.filter(b => b.regattaId === regattaId && !zielBoats.includes(b.id));
    }
  },

  // Wettfahrt Queries
  wettfahrt: {
    /**
     * Get all results for a wettfahrt
     * @param {Array} ergebnisse - All results
     * @param {string} wettfahrtId - Wettfahrt ID
     * @returns {Array} Filtered results
     */
    getResults: (ergebnisse, wettfahrtId) => {
      return ergebnisse.filter(e => e.wettfahrtId === wettfahrtId);
    },

    /**
     * Get active results (no penalty)
     * @param {Array} ergebnisse - All results
     * @param {string} wettfahrtId - Wettfahrt ID
     * @returns {Array} Active results sorted by platz
     */
    getActiveResults: (ergebnisse, wettfahrtId) => {
      return ergebnisse
        .filter(e => e.wettfahrtId === wettfahrtId && !e.penalty)
        .sort((a, b) => a.platz - b.platz);
    },

    /**
     * Get penalty results
     * @param {Array} ergebnisse - All results
     * @param {string} wettfahrtId - Wettfahrt ID
     * @returns {Array} Penalty results sorted by penalty order
     */
    getPenaltyResults: (ergebnisse, wettfahrtId) => {
      return ergebnisse
        .filter(e => e.wettfahrtId === wettfahrtId && e.penalty)
        .sort((a, b) => 
          (PENALTY_ORDER[a.penalty] ?? 99) - (PENALTY_ORDER[b.penalty] ?? 99)
        );
    }
  },

  // Boot Queries
  boot: {
    /**
     * Get boat by ID
     * @param {Array} boats - All boats
     * @param {string} boatId - Boat ID
     * @returns {Object|undefined} Boat object
     */
    getById: (boats, boatId) => {
      return boats.find(b => b.id === boatId);
    },

    /**
     * Get boat by segelnummer in regatta
     * @param {Array} boats - All boats
     * @param {string} segelnummer - Segelnummer
     * @param {string} regattaId - Regatta ID
     * @returns {Object|undefined} Boat object
     */
    getBySegelnummer: (boats, segelnummer, regattaId) => {
      return boats.find(b => b.regattaId === regattaId && b.segelnummer === segelnummer);
    },

    /**
     * Check if boat exists in Ziel
     * @param {Array} zielBoats - Boat IDs in Ziel
     * @param {string} boatId - Boat ID to check
     * @returns {boolean} True if in Ziel
     */
    isInZiel: (zielBoats, boatId) => {
      return zielBoats.includes(boatId);
    },

    /**
     * Get boat details for multiple IDs
     * @param {Array} boats - All boats
     * @param {Array} boatIds - Array of boat IDs
     * @returns {Array} Array of boat objects
     */
    getByIds: (boats, boatIds) => {
      return boatIds.map(id => boats.find(b => b.id === id)).filter(Boolean);
    }
  },

  // Gesamtergebnis Queries
  gesamtergebnis: {
    /**
     * Get all results for boats in completed wettfahrten
     * @param {Array} ergebnisse - All results
     * @param {Array} wettfahrten - All wettfahrten
     * @param {string} regattaId - Regatta ID
     * @returns {Object} Map of boatId -> array of results
     */
    getBoatResults: (ergebnisse, wettfahrten, regattaId) => {
      const completedWettfahrten = wettfahrten.filter(
        w => w.regattaId === regattaId && w.abgeschlossen
      );
      
      const boatResults = {};
      
      completedWettfahrten.forEach(wettfahrt => {
        const results = ergebnisse.filter(e => e.wettfahrtId === wettfahrt.id);
        
        results.forEach(result => {
          if (!boatResults[result.bootId]) {
            boatResults[result.bootId] = [];
          }
          boatResults[result.bootId].push(result);
        });
      });
      
      return boatResults;
    }
  },

  // Search Queries
  search: {
    /**
     * Filter boats by search query
     * @param {Array} boats - All boats
     * @param {string} query - Search query
     * @returns {Array} Filtered boats
     */
    filterBoats: (boats, query) => {
      if (!query || query.trim().length === 0) {
        return boats;
      }
      
      const searchLower = query.toLowerCase().trim();
      
      return boats.filter(boat => 
        boat.segelnummer?.toLowerCase().includes(searchLower) ||
        boat.steuermann?.toLowerCase().includes(searchLower) ||
        boat.verein?.toLowerCase().includes(searchLower)
      );
    }
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Einfache SVG Icons als React-Komponenten
// Hilfsfunktionen für LocalStorage
const loadFromStorage = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// UUID Generator
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// ============================================================================
// COMPONENTS (Extracted from render functions)
// ============================================================================

// ---------------------------------------------------------------------------
// Zielerfassung Components
// ---------------------------------------------------------------------------

/**
 * Header for Zielerfassung with back button and complete/reopen action
 */
const ZielerfassungHeader = ({ 
  wettfahrt, 
  isAbgeschlossen,
  isUnvollstaendig,
  boatsCount,
  onBack, 
  onComplete, 
  onReopen 
}) => (
  <div className={`flex items-center justify-between ${DESIGN_TOKENS.spacing.md} mb-6`}>
    <button
      onClick={onBack}
      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 py-2"
      style={{ minHeight: DESIGN_TOKENS.button.height.small }}
    >
      <ChevronLeft size={24} />
      <span className="font-medium">Zurück</span>
    </button>

    <h1 className={`${DESIGN_TOKENS.text.h1} flex-1 text-center`}>
      {wettfahrt.name}
    </h1>

    {isAbgeschlossen ? (
      <button
        onClick={onReopen}
        className={`${getButtonClass('warning', 'medium')} ${DESIGN_TOKENS.shadow.sm}`}
        style={{ minHeight: DESIGN_TOKENS.button.height.medium }}
      >
        <Unlock size={20} />
        Wertung erneut öffnen
      </button>
    ) : (
      <button
        onClick={() => onComplete()}
        disabled={boatsCount === 0}
        className={`${getButtonClass('success', 'medium')} ${DESIGN_TOKENS.shadow.sm} disabled:bg-gray-300 disabled:cursor-not-allowed`}
        style={{ minHeight: DESIGN_TOKENS.button.height.medium }}
      >
        <Check size={20} />
        Wertung abschließen
      </button>
    )}
  </div>
);

/**
 * Status banner showing current state of Wertung
 */
const ZielerfassungStatusBanner = ({ isAbgeschlossen, isUnvollstaendig }) => {
  const statusConfig = isAbgeschlossen
    ? isUnvollstaendig
      ? {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-300',
          iconBg: 'bg-yellow-500',
          titleColor: 'text-yellow-900',
          textColor: 'text-yellow-700',
          icon: Lock,
          title: 'Wertung unvollständig abgeschlossen',
          text: 'Nicht alle Boote wurden bewertet. Die Wertung ist gesperrt. Klicke auf "Wertung erneut öffnen" um fehlende Boote zu ergänzen.'
        }
      : {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-300',
          iconBg: 'bg-green-500',
          titleColor: 'text-green-900',
          textColor: 'text-green-700',
          icon: Lock,
          title: 'Wertung abgeschlossen',
          text: 'Die Wertung ist gesperrt. Klicke auf "Wertung erneut öffnen" um Änderungen vorzunehmen.'
        }
    : {
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-300',
        iconBg: 'bg-blue-500',
        titleColor: 'text-blue-900',
        textColor: 'text-blue-700',
        icon: Edit2,
        title: 'Wertung offen',
        text: 'Die Wertung ist bearbeitbar. Boote können hinzugefügt, entfernt und verschoben werden.'
      };

  const Icon = statusConfig.icon;

  return (
    <div className={`${DESIGN_TOKENS.radius.md} p-4 mb-6 ${statusConfig.bgColor} border-2 ${statusConfig.borderColor}`}>
      <div className={`flex items-center ${DESIGN_TOKENS.spacing.sm}`}>
        <div className={`flex-shrink-0 w-10 h-10 ${DESIGN_TOKENS.radius.full} flex items-center justify-center ${statusConfig.iconBg}`}>
          <Icon size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className={`${DESIGN_TOKENS.text.h3} ${statusConfig.titleColor}`}>
            {statusConfig.title}
          </h3>
          <p className={`${DESIGN_TOKENS.text.small} ${statusConfig.textColor}`}>
            {statusConfig.text}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Validation error banner when trying to complete with missing boats
 */
const ValidationErrorBanner = ({ 
  error, 
  onShowMissing, 
  onForceComplete, 
  onCancel 
}) => {
  if (!error) return null;

  return (
    <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5 mb-6">
      <div className={`flex items-start ${DESIGN_TOKENS.spacing.sm}`}>
        <div className="flex-shrink-0 mt-0.5">
          <div className={`w-8 h-8 bg-red-500 ${DESIGN_TOKENS.radius.full} flex items-center justify-center`}>
            <X size={18} className="text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className={`${DESIGN_TOKENS.text.h3} text-red-900 mb-3`}>
            Wertung kann nicht abgeschlossen werden!
          </h3>
          <p className={`${DESIGN_TOKENS.text.body} text-red-800 mb-3`}>
            Es {error.count === 1 ? 'ist noch' : 'sind noch'}{' '}
            <span className="font-bold">{error.count}</span>{' '}
            {error.count === 1 ? 'Boot' : 'Boote'} nicht im Ziel:
          </p>

          <ul className="space-y-2 mb-4">
            {error.boats.map(boat => (
              <li key={boat.id} className={`flex items-center ${DESIGN_TOKENS.spacing.xs} text-red-900 bg-red-100 px-3 py-2 ${DESIGN_TOKENS.radius.sm}`}>
                <span className={`w-2 h-2 bg-red-600 ${DESIGN_TOKENS.radius.full} flex-shrink-0`}></span>
                <span className={`font-mono font-bold ${DESIGN_TOKENS.text.body}`}>{boat.segelnummer}</span>
                {boat.steuermann && (
                  <span className={`${DESIGN_TOKENS.text.small} text-red-700`}>- {boat.steuermann}</span>
                )}
              </li>
            ))}
          </ul>

          <div className={`bg-yellow-50 border-2 border-yellow-300 ${DESIGN_TOKENS.radius.sm} p-4 mb-4`}>
            <div className={`flex items-start ${DESIGN_TOKENS.spacing.sm}`}>
              <div className="flex-shrink-0 mt-0.5">
                <div className={`w-6 h-6 bg-yellow-500 ${DESIGN_TOKENS.radius.full} flex items-center justify-center`}>
                  <span className={`text-white ${DESIGN_TOKENS.text.small} font-bold`}>!</span>
                </div>
              </div>
              <div className="flex-1">
                <p className={`text-yellow-900 font-semibold ${DESIGN_TOKENS.text.small} mb-1`}>
                  Hinweis: Automatische DNS-Wertung
                </p>
                <p className={`text-yellow-800 ${DESIGN_TOKENS.text.small}`}>
                  Wenn Sie "Trotzdem abschließen" wählen, werden alle nicht erfassten Boote 
                  automatisch mit <span className="font-bold">DNS (Did Not Start)</span> bewertet. 
                  Diese Boote erhalten die maximale Punktzahl.
                </p>
              </div>
            </div>
          </div>

          <div className={`flex flex-wrap ${DESIGN_TOKENS.spacing.sm}`}>
            <button
              onClick={onShowMissing}
              className={`${getButtonClass('danger', 'medium')} flex items-center ${DESIGN_TOKENS.spacing.xs}`}
              style={{ minHeight: DESIGN_TOKENS.button.height.medium }}
            >
              <span>Fehlende Boote anzeigen</span>
            </button>
            <button
              onClick={onForceComplete}
              className={`${getButtonClass('warning', 'medium')} flex items-center ${DESIGN_TOKENS.spacing.xs}`}
              style={{ minHeight: DESIGN_TOKENS.button.height.medium }}
            >
              <span>Trotzdem abschließen</span>
              <span className={`${DESIGN_TOKENS.text.xs} opacity-90`}>(alle nicht erfassten → DNS)</span>
            </button>
            <button
              onClick={onCancel}
              className={getButtonClass('secondary', 'medium')}
              style={{ minHeight: DESIGN_TOKENS.button.height.medium }}
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// RegattaDetail Components
// ---------------------------------------------------------------------------

/**
 * Header card with regatta info and status badge
 */
const RegattaInfoCard = ({ regatta, onEdit }) => {
  const statusConfig = {
    aktiv: { badge: 'bg-green-100 text-green-800', emoji: '🟢', label: 'Aktiv' },
    abgeschlossen: { badge: 'bg-gray-100 text-gray-800', emoji: '⚫', label: 'Abgeschlossen' },
    vorbereitung: { badge: 'bg-yellow-100 text-yellow-800', emoji: '🟡', label: 'In Vorbereitung' }
  };
  
  const status = statusConfig[regatta.status] || statusConfig.vorbereitung;

  return (
    <div className={getCardClass()}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className={`${DESIGN_TOKENS.text.h1} mb-2`}>{regatta.name}</h1>
          <div className={`${DESIGN_TOKENS.text.small} text-gray-600 space-y-1`}>
            {regatta.datum && <p>Datum: {regatta.datum}</p>}
            {regatta.veranstalter && <p>Veranstalter: {regatta.veranstalter}</p>}
            {regatta.bootsklasse && <p>Bootsklasse: {regatta.bootsklasse}</p>}
          </div>
        </div>
        <span className={`px-3 py-1 ${DESIGN_TOKENS.radius.full} ${DESIGN_TOKENS.text.small} font-medium ${status.badge}`}>
          {status.emoji} {status.label}
        </span>
      </div>

      {regatta.status !== 'abgeschlossen' && (
        <div className={DESIGN_TOKENS.spacing.sm}>
          <button
            onClick={onEdit}
            className={getButtonClass('secondary', 'medium')}
            style={{ minHeight: DESIGN_TOKENS.button.height.small }}
          >
            <Edit2 size={18} />
            Metadaten bearbeiten
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Inline boat form for adding boats
 */
const InlineBoatForm = ({ 
  formData, 
  formErrors, 
  onFormChange, 
  onSubmit, 
  onCancel 
}) => (
  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
    <h3 className={`${DESIGN_TOKENS.text.h3} mb-4`}>Neues Boot hinzufügen</h3>
    <div className={`grid grid-cols-1 md:grid-cols-3 ${DESIGN_TOKENS.spacing.md} mb-4`}>
      <div>
        <label className={`block ${DESIGN_TOKENS.text.small} font-medium text-gray-700 mb-2`}>
          Segelnummer *
        </label>
        <input
          type="text"
          value={formData.segelnummer}
          onChange={(e) => onFormChange({ ...formData, segelnummer: e.target.value })}
          className={getInputClass(!!formErrors.segelnummer)}
          placeholder="z.B. GER 1234"
          style={{ minHeight: DESIGN_TOKENS.button.height.small }}
        />
        {formErrors.segelnummer && (
          <p className={`${DESIGN_TOKENS.text.small} text-red-600 mt-1`}>{formErrors.segelnummer}</p>
        )}
      </div>
      <div>
        <label className={`block ${DESIGN_TOKENS.text.small} font-medium text-gray-700 mb-2`}>
          Steuermann
        </label>
        <input
          type="text"
          value={formData.steuermann}
          onChange={(e) => onFormChange({ ...formData, steuermann: e.target.value })}
          className={getInputClass()}
          placeholder="Name"
          style={{ minHeight: DESIGN_TOKENS.button.height.small }}
        />
      </div>
      <div>
        <label className={`block ${DESIGN_TOKENS.text.small} font-medium text-gray-700 mb-2`}>
          Verein
        </label>
        <input
          type="text"
          value={formData.verein}
          onChange={(e) => onFormChange({ ...formData, verein: e.target.value })}
          className={getInputClass()}
          placeholder="Vereinsname"
          style={{ minHeight: DESIGN_TOKENS.button.height.small }}
        />
      </div>
    </div>
    <div className={DESIGN_TOKENS.spacing.sm}>
      <button
        onClick={onSubmit}
        className={getButtonClass('primary', 'medium')}
        style={{ minHeight: DESIGN_TOKENS.button.height.small }}
      >
        <Plus size={20} />
        Boot hinzufügen
      </button>
      {onCancel && (
        <button
          onClick={onCancel}
          className={getButtonClass('secondary', 'medium')}
          style={{ minHeight: DESIGN_TOKENS.button.height.small }}
        >
          Abbrechen
        </button>
      )}
    </div>
  </div>
);

/**
 * Boat table with sorting
 */
const BoatTable = ({ 
  boats, 
  sortConfig, 
  onSort, 
  onEdit, 
  onDelete,
  isAbgeschlossen 
}) => {
  const SortIcon = ({ column }) => {
    if (sortConfig.column !== column) return <ArrowUpDown size={16} className="text-gray-400" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={16} className="text-blue-600" />
      : <ArrowDown size={16} className="text-blue-600" />;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b-2 border-gray-200">
          <tr>
            <th 
              onClick={() => onSort('segelnummer')}
              className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
            >
              <div className="flex items-center gap-2">
                Segelnummer
                <SortIcon column="segelnummer" />
              </div>
            </th>
            <th 
              onClick={() => onSort('steuermann')}
              className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
            >
              <div className="flex items-center gap-2">
                Steuermann
                <SortIcon column="steuermann" />
              </div>
            </th>
            <th 
              onClick={() => onSort('verein')}
              className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
            >
              <div className="flex items-center gap-2">
                Verein
                <SortIcon column="verein" />
              </div>
            </th>
            {!isAbgeschlossen && (
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Aktionen
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {boats.map(boat => (
            <tr key={boat.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono font-semibold text-gray-900">
                {boat.segelnummer}
              </td>
              <td className="px-4 py-3 text-gray-900">
                {boat.steuermann || '-'}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {boat.verein || '-'}
              </td>
              {!isAbgeschlossen && (
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(boat)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Bearbeiten"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(boat.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Löschen"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {boats.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Noch keine Boote hinzugefügt
        </div>
      )}
    </div>
  );
};

export default function RegattaApp() {
  // ============================================================================
  // STATE MANAGEMENT (Grouped)
  // ============================================================================
  
  // App Data State (Core data)
  const [appData, setAppData] = useState({
    regattas: [],
    boats: [],
    wettfahrten: [],
    ergebnisse: [],
    streicher: {} // Map: regattaId -> number of discards
  });
  
  // Navigation State (View & Selection)
  const [navigation, setNavigation] = useState({
    currentView: VIEWS.OVERVIEW,
    selectedRegatta: null,
    selectedWettfahrt: null,
    editingBoat: null,
    activeNavItem: NAV_ITEMS.ORGANISATION
  });
  
  // Form States (All form data)
  const [forms, setForms] = useState({
    regatta: { name: '', datum: '', veranstalter: '', bootsklasse: '' },
    boat: { segelnummer: '', steuermann: '', verein: '' },
    wettfahrt: { startzeit: '', zielzeit: '', windstaerke: '', bahnlaenge: '' }
  });
  
  // ============================================================================
  // STATE HELPERS (Convenience setters)
  // ============================================================================
  
  // AppData Helpers
  const setRegattas = (value) => setAppData(prev => ({ 
    ...prev, 
    regattas: typeof value === 'function' ? value(prev.regattas) : value 
  }));
  const setBoats = (value) => setAppData(prev => ({ 
    ...prev, 
    boats: typeof value === 'function' ? value(prev.boats) : value 
  }));
  const setWettfahrten = (value) => setAppData(prev => ({ 
    ...prev, 
    wettfahrten: typeof value === 'function' ? value(prev.wettfahrten) : value 
  }));
  const setErgebnisse = (value) => setAppData(prev => ({ 
    ...prev, 
    ergebnisse: typeof value === 'function' ? value(prev.ergebnisse) : value 
  }));
  const setStreicher = (value) => setAppData(prev => ({ 
    ...prev, 
    streicher: typeof value === 'function' ? value(prev.streicher) : value 
  }));
  
  // Navigation Helpers
  const setCurrentView = (value) => setNavigation(prev => ({ ...prev, currentView: value }));
  const setSelectedRegatta = (value) => setNavigation(prev => ({ ...prev, selectedRegatta: value }));
  const setSelectedWettfahrt = (value) => setNavigation(prev => ({ ...prev, selectedWettfahrt: value }));
  const setEditingBoat = (value) => setNavigation(prev => ({ ...prev, editingBoat: value }));
  const setActiveNavItem = (value) => setNavigation(prev => ({ ...prev, activeNavItem: value }));
  
  // Form Helpers
  const setRegattaForm = (value) => setForms(prev => ({ 
    ...prev, 
    regatta: typeof value === 'function' ? value(prev.regatta) : value 
  }));
  const setBoatForm = (value) => setForms(prev => ({ 
    ...prev, 
    boat: typeof value === 'function' ? value(prev.boat) : value 
  }));
  const setWettfahrtForm = (value) => setForms(prev => ({ 
    ...prev, 
    wettfahrt: typeof value === 'function' ? value(prev.wettfahrt) : value 
  }));
  
  // Destructure for easier access
  const { regattas, boats, wettfahrten, ergebnisse, streicher } = appData;
  const { currentView, selectedRegatta, selectedWettfahrt, editingBoat, activeNavItem } = navigation;
  const regattaForm = forms.regatta;
  const boatForm = forms.boat;
  const wettfahrtForm = forms.wettfahrt;
  
  // ============================================================================
  // OTHER STATES (Not grouped - kept separate for performance/simplicity)
  // ============================================================================
  
  const [confirmDialog, setConfirmDialog] = useState({ show: false, message: '', onConfirm: null });
  const [boatSort, setBoatSort] = useState({ column: 'segelnummer', direction: 'asc' });
  const [boatFilter, setBoatFilter] = useState({ segelnummer: '', steuermann: '', verein: '' });
  const [zielBoats, setZielBoats] = useState([]); // Boats in finish order
  const [boatPenalties, setBoatPenalties] = useState({}); // Map: boatId -> penalty code (DNF, DNS, DNC, DSQ)
  const [draggedIndex, setDraggedIndex] = useState(null); // Index of dragged item
  const [dragOverIndex, setDragOverIndex] = useState(null); // Track where drag is hovering
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 }); // Mouse position relative to element
  const [itemHeight, setItemHeight] = useState(70); // Actual measured height of items
  const [touchHoldTimer, setTouchHoldTimer] = useState(null); // Timer for touch-hold
  const [isDraggingTouch, setIsDraggingTouch] = useState(false); // Touch drag active
  const [touchDragPosition, setTouchDragPosition] = useState({ x: 0, y: 0 }); // Touch drag position
  
  // Swipe Gesture States
  const [swipeStartX, setSwipeStartX] = useState(null);
  const [swipeStartY, setSwipeStartY] = useState(null);
  const [swipeCurrentX, setSwipeCurrentX] = useState(null);
  const [swipeItemId, setSwipeItemId] = useState(null); // Which item is being swiped
  const [pullToRefreshDistance, setPullToRefreshDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showBootFormExpanded, setShowBootFormExpanded] = useState(false); // Expandable inline form
  const [boatFormErrors, setBoatFormErrors] = useState({ segelnummer: '' }); // Validation errors
  
  // Zielerfassung States
  const [zielSearchQuery, setZielSearchQuery] = useState(''); // Search für "Noch nicht im Ziel"
  const [zieleinlaufSearchQuery, setZieleinlaufSearchQuery] = useState(''); // Search für "Zieleinlauf"
  const [showVerfuegbareBoats, setShowVerfuegbareBoats] = useState(false);
  const [wertungValidationError, setWertungValidationError] = useState(null); // Error beim Abschließen
  const [selectedBoatInZiel, setSelectedBoatInZiel] = useState(null); // For manual placement editing
  const [showVorbereitung, setShowVorbereitung] = useState(false); // Overview collapsed sections
  const [showAbgeschlossen, setShowAbgeschlossen] = useState(false); // Overview collapsed sections
  const [showAktiv, setShowAktiv] = useState(true); // Aktiv Section - default expanded
  const [expandedRegattaId, setExpandedRegattaId] = useState(null); // Expanded regatta card in overview

  // Load data from localStorage on mount
  useEffect(() => {
    setRegattas(loadFromStorage('regattas', []));
    setBoats(loadFromStorage('boats', []));
    setWettfahrten(loadFromStorage('wettfahrten', []));
    setErgebnisse(loadFromStorage('ergebnisse', []));
    setStreicher(loadFromStorage('streicher', {}));
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveToStorage('regattas', regattas);
  }, [regattas]);

  useEffect(() => {
    saveToStorage('boats', boats);
  }, [boats]);

  useEffect(() => {
    saveToStorage('wettfahrten', wettfahrten);
  }, [wettfahrten]);

  useEffect(() => {
    saveToStorage('ergebnisse', ergebnisse);
  }, [ergebnisse]);

  useEffect(() => {
    saveToStorage('streicher', streicher);
  }, [streicher]);

  // Regatta Functions
  const createRegatta = () => {
    if (!regattaForm.name.trim()) {
      alert('Bitte geben Sie einen Namen für die Regatta ein.');
      return;
    }

    const newRegatta = {
      id: generateId(),
      name: regattaForm.name,
      datum: regattaForm.datum,
      veranstalter: regattaForm.veranstalter,
      bootsklasse: regattaForm.bootsklasse,
      status: 'vorbereitung', // 'vorbereitung', 'aktiv', 'abgeschlossen'
      erstelltAm: new Date().toISOString()
    };

    setRegattas([...regattas, newRegatta]);
    setRegattaForm({ name: '', datum: '', veranstalter: '', bootsklasse: '' });
    setCurrentView('overview');
  };

  const updateRegatta = () => {
    if (!regattaForm.name.trim()) {
      alert('Bitte geben Sie einen Namen für die Regatta ein.');
      return;
    }

    setRegattas(regattas.map(r => 
      r.id === selectedRegatta.id 
        ? { ...r, ...regattaForm }
        : r
    ));
    
    setSelectedRegatta({ ...selectedRegatta, ...regattaForm });
    setRegattaForm({ name: '', datum: '', veranstalter: '', bootsklasse: '' });
    setCurrentView('regattaDetail');
  };

  const deleteRegatta = (id) => {
    setConfirmDialog({
      show: true,
      message: 'Möchten Sie diese Regatta wirklich löschen? Alle zugehörigen Boote werden ebenfalls gelöscht.',
      onConfirm: () => {
        setRegattas(regattas.filter(r => r.id !== id));
        setBoats(boats.filter(b => b.regattaId !== id));
        if (selectedRegatta?.id === id) {
          setSelectedRegatta(null);
          setCurrentView('overview');
        }
        setConfirmDialog({ show: false, message: '', onConfirm: null });
      }
    });
  };

  const changeRegattaStatus = (regattaId, newStatus) => {
    setRegattas(regattas.map(r => 
      r.id === regattaId 
        ? { ...r, status: newStatus }
        : r
    ));
    if (selectedRegatta?.id === regattaId) {
      setSelectedRegatta({ ...selectedRegatta, status: newStatus });
    }
  };

  const openEditRegatta = (regatta) => {
    setSelectedRegatta(regatta);
    setRegattaForm({
      name: regatta.name,
      datum: regatta.datum || '',
      veranstalter: regatta.veranstalter || '',
      bootsklasse: regatta.bootsklasse || ''
    });
    setCurrentView('editRegatta');
  };

  // Boat Functions
  const addBoat = () => {
    // Validation: Segelnummer required
    const requiredValidation = validators.boot.segelnummerRequired(boatForm.segelnummer);
    if (!requiredValidation.valid) {
      setBoatFormErrors({ segelnummer: requiredValidation.message });
      return;
    }

    // Validation: Segelnummer unique
    const uniqueValidation = validators.boot.segelnummerUnique(
      boatForm.segelnummer,
      selectedRegatta.id,
      boats
    );
    if (!uniqueValidation.valid) {
      setBoatFormErrors({ segelnummer: uniqueValidation.message });
      return;
    }

    // Validation: Segelnummer format
    const formatValidation = validators.boot.segelnummerValid(boatForm.segelnummer);
    if (!formatValidation.valid) {
      setBoatFormErrors({ segelnummer: formatValidation.message });
      return;
    }

    // Clear errors
    setBoatFormErrors({ segelnummer: '' });

    const newBoat = {
      id: generateId(),
      regattaId: selectedRegatta.id,
      segelnummer: boatForm.segelnummer,
      steuermann: boatForm.steuermann,
      verein: boatForm.verein
    };

    setBoats([...boats, newBoat]);
    // Clear form but keep it open
    setBoatForm({ segelnummer: '', steuermann: '', verein: '' });
    // Form bleibt offen (setShowBootFormExpanded nicht auf false)
  };

  const updateBoat = () => {
    // Validation: Segelnummer required
    const requiredValidation = validators.boot.segelnummerRequired(boatForm.segelnummer);
    if (!requiredValidation.valid) {
      alert(requiredValidation.message);
      return;
    }

    // Validation: Segelnummer unique (exclude current boat)
    const uniqueValidation = validators.boot.segelnummerUnique(
      boatForm.segelnummer,
      selectedRegatta.id,
      boats,
      editingBoat.id
    );
    if (!uniqueValidation.valid) {
      alert(uniqueValidation.message);
      return;
    }

    // Validation: Segelnummer format
    const formatValidation = validators.boot.segelnummerValid(boatForm.segelnummer);
    if (!formatValidation.valid) {
      alert(formatValidation.message);
      return;
    }

    setBoats(boats.map(b => 
      b.id === editingBoat.id 
        ? { ...b, ...boatForm }
        : b
    ));
    
    setBoatForm({ segelnummer: '', steuermann: '', verein: '' });
    setEditingBoat(null);
    setCurrentView('regattaDetail');
  };

  const deleteBoat = (id) => {
    setConfirmDialog({
      show: true,
      message: 'Möchten Sie dieses Boot wirklich löschen?',
      onConfirm: () => {
        setBoats(boats.filter(b => b.id !== id));
        setConfirmDialog({ show: false, message: '', onConfirm: null });
      }
    });
  };

  const openEditBoat = (boat) => {
    setEditingBoat(boat);
    setBoatForm({
      segelnummer: boat.segelnummer,
      steuermann: boat.steuermann || '',
      verein: boat.verein || ''
    });
    setCurrentView('editBoat');
  };

  const openRegattaDetail = (regatta) => {
    setSelectedRegatta(regatta);
    setCurrentView('regattaDetail');
  };

  // Get boats for current regatta
  const regattaBoats = selectedRegatta 
    ? boats.filter(b => b.regattaId === selectedRegatta.id)
    : [];

  // Filter and sort boats
  const getFilteredAndSortedBoats = () => {
    let filtered = regattaBoats;

    // Apply filters
    if (boatFilter.segelnummer) {
      filtered = filtered.filter(b => 
        b.segelnummer.toLowerCase().includes(boatFilter.segelnummer.toLowerCase())
      );
    }
    if (boatFilter.steuermann) {
      filtered = filtered.filter(b => 
        (b.steuermann || '').toLowerCase().includes(boatFilter.steuermann.toLowerCase())
      );
    }
    if (boatFilter.verein) {
      filtered = filtered.filter(b => 
        (b.verein || '').toLowerCase().includes(boatFilter.verein.toLowerCase())
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aVal = a[boatSort.column] || '';
      let bVal = b[boatSort.column] || '';
      
      // Convert to lowercase for case-insensitive sorting
      aVal = aVal.toString().toLowerCase();
      bVal = bVal.toString().toLowerCase();

      if (aVal < bVal) return boatSort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return boatSort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  const handleSort = (column) => {
    if (boatSort.column === column) {
      // Toggle direction if same column
      setBoatSort({ column, direction: boatSort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      // New column, default to ascending
      setBoatSort({ column, direction: 'asc' });
    }
  };

  const clearFilters = () => {
    setBoatFilter({ segelnummer: '', steuermann: '', verein: '' });
  };

  // Wettfahrt Functions
  const createWettfahrt = (regattaId) => {
    const regattaWettfahrten = wettfahrten.filter(w => w.regattaId === regattaId);
    const nextNumber = regattaWettfahrten.length + 1;
    
    const newWettfahrt = {
      id: generateId(),
      regattaId: regattaId,
      nummer: nextNumber,
      name: `Wettfahrt ${nextNumber}`,
      startzeit: '',
      zielzeit: '',
      windstaerke: '',
      bahnlaenge: '',
      erstelltAm: new Date().toISOString(),
      abgeschlossen: false
    };

    setWettfahrten([...wettfahrten, newWettfahrt]);
    return newWettfahrt;
  };

  const deleteWettfahrt = (id) => {
    setConfirmDialog({
      show: true,
      message: 'Möchten Sie diese Wettfahrt wirklich löschen? Alle Ergebnisse werden ebenfalls gelöscht.',
      onConfirm: () => {
        setWettfahrten(wettfahrten.filter(w => w.id !== id));
        setErgebnisse(ergebnisse.filter(e => e.wettfahrtId !== id));
        setConfirmDialog({ show: false, message: '', onConfirm: null });
      }
    });
  };

  const openEditWettfahrt = (wettfahrt) => {
    setSelectedWettfahrt(wettfahrt);
    setWettfahrtForm({
      startzeit: wettfahrt.startzeit || '',
      zielzeit: wettfahrt.zielzeit || '',
      windstaerke: wettfahrt.windstaerke || '',
      bahnlaenge: wettfahrt.bahnlaenge || ''
    });
    setCurrentView('editWettfahrt');
  };

  const saveWettfahrtMetadata = () => {
    // Validierung: Zielzeit darf nicht vor Startzeit liegen
    if (wettfahrtForm.startzeit && wettfahrtForm.zielzeit) {
      if (wettfahrtForm.zielzeit < wettfahrtForm.startzeit) {
        alert('Die Zielzeit darf nicht vor der Startzeit liegen.');
        return;
      }
    }
    
    setWettfahrten(wettfahrten.map(w =>
      w.id === selectedWettfahrt.id
        ? {
            ...w,
            startzeit: wettfahrtForm.startzeit,
            zielzeit: wettfahrtForm.zielzeit,
            windstaerke: wettfahrtForm.windstaerke,
            bahnlaenge: wettfahrtForm.bahnlaenge
          }
        : w
    ));
    setWettfahrtForm({ startzeit: '', zielzeit: '', windstaerke: '', bahnlaenge: '' });
    setCurrentView('wettfahrtenOverview');
  };

  const startZielerfassung = (wettfahrt) => {
    setSelectedWettfahrt(wettfahrt);
    
    // Load existing results if any
    const existingResults = queries.wettfahrt.getResults(ergebnisse, wettfahrt.id);
    if (existingResults.length > 0) {
      // Get active and penalty results (already sorted by queries)
      const activeBoats = queries.wettfahrt.getActiveResults(ergebnisse, wettfahrt.id);
      const penaltyBoats = queries.wettfahrt.getPenaltyResults(ergebnisse, wettfahrt.id);
      
      // Combine: active boats first, then penalty boats
      const sortedResults = [...activeBoats, ...penaltyBoats];
      setZielBoats(sortedResults.map(r => r.bootId));
      
      // Load penalties
      const penalties = {};
      sortedResults.forEach(r => {
        if (r.penalty) {
          penalties[r.bootId] = r.penalty;
        }
      });
      setBoatPenalties(penalties);
      
      console.log('✅ Loaded results:', {
        active: activeBoats.length,
        penalties: penaltyBoats.length,
        total: sortedResults.length
      });
    } else {
      setZielBoats([]);
      setBoatPenalties({});
    }
    
    setCurrentView('zielerfassung');
  };

  const addBoatToZiel = (boatId) => {
    // Find the first penalty boat index
    let firstPenaltyIndex = zielBoats.length;
    for (let i = 0; i < zielBoats.length; i++) {
      if (boatPenalties[zielBoats[i]]) {
        firstPenaltyIndex = i;
        break;
      }
    }
    
    // Insert before penalty boats
    const newZielBoats = [...zielBoats];
    newZielBoats.splice(firstPenaltyIndex, 0, boatId);
    setZielBoats(newZielBoats);
    
    // Autosave after state update
    setTimeout(() => autoSaveZielerfassung(newZielBoats, boatPenalties), 100);
  };

  const removeBoatFromZiel = (boatId) => {
    const newZielBoats = zielBoats.filter(id => id !== boatId);
    setZielBoats(newZielBoats);
    
    // Also remove penalty if it had one
    const newPenalties = { ...boatPenalties };
    if (boatPenalties[boatId]) {
      delete newPenalties[boatId];
      setBoatPenalties(newPenalties);
    }
    
    // Autosave after state update
    setTimeout(() => autoSaveZielerfassung(newZielBoats, newPenalties), 100);
  };

  const reorderZielBoats = (fromIndex, toIndex) => {
    const newZielBoats = [...zielBoats];
    const [movedBoat] = newZielBoats.splice(fromIndex, 1);
    newZielBoats.splice(toIndex, 0, movedBoat);
    setZielBoats(newZielBoats);
    
    // Autosave after state update
    setTimeout(() => autoSaveZielerfassung(newZielBoats, boatPenalties), 100);
  };

  // Autosave Funktion - speichert in Ergebnisse
  const autoSaveZielerfassung = (currentZielBoats, currentPenalties) => {
    if (!selectedWettfahrt) return;
    
    // Remove old results for this Wettfahrt
    const filteredErgebnisse = ergebnisse.filter(e => e.wettfahrtId !== selectedWettfahrt.id);
    
    // Create new results from current zielBoats
    const newErgebnisse = [];
    let platzCounter = 1;
    
    currentZielBoats.forEach((boatId) => {
      const penalty = currentPenalties[boatId];
      
      newErgebnisse.push({
        id: `result_${selectedWettfahrt.id}_${boatId}_${Date.now()}`,
        wettfahrtId: selectedWettfahrt.id,
        bootId: boatId,
        platz: penalty ? null : platzCounter,
        penalty: penalty || null
      });
      
      if (!penalty) {
        platzCounter++;
      }
    });
    
    setErgebnisse([...filteredErgebnisse, ...newErgebnisse]);
    console.log('✅ Autosave:', newErgebnisse.length, 'Ergebnisse gespeichert');
  };

  // Wertung abschließen mit Validation
  const completeWertung = (force = false) => {
    console.log('🔍 ===== completeWertung START =====');
    console.log('🔍 force parameter:', force);
    console.log('🔍 typeof force:', typeof force);
    console.log('🔍 force === true:', force === true);
    console.log('🔍 force === false:', force === false);
    console.log('🔍 selectedRegatta:', selectedRegatta);
    
    const regattaBoats = queries.regatta.getBoats(boats, selectedRegatta.id);
    const verfuegbareBoats = queries.regatta.getAvailableBoats(boats, selectedRegatta.id, zielBoats);
    
    console.log('🔍 Total boats in regatta:', regattaBoats.length);
    console.log('🔍 regattaBoats:', regattaBoats.map(b => ({ id: b.id, seg: b.segelnummer })));
    console.log('🔍 Boats in Ziel:', zielBoats.length);
    console.log('🔍 zielBoats IDs:', zielBoats);
    
    // Welche Boote sind im Ziel (mit Segelnummer)
    const zielBoatsDetails = queries.boot.getByIds(boats, zielBoats).map(b => b.segelnummer);
    console.log('🔍 Boote im Ziel (Segelnummern):', zielBoatsDetails);
    
    console.log('🔍 Verfuegbare boats:', verfuegbareBoats.length);
    console.log('🔍 verfuegbareBoats:', verfuegbareBoats.map(b => ({ id: b.id, seg: b.segelnummer })));
    
    // Clear previous error
    setWertungValidationError(null);
    
    // Validation: Alle Boote müssen bewertet sein (außer wenn force=true)
    if (!force) {
      const validation = validators.wertung.allBoatsRated(regattaBoats, zielBoats);
      
      if (!validation.valid) {
        console.log('❌ VALIDATION FAILED - Showing error banner');
        setWertungValidationError(validation.data);
        console.error(
          `❌ ${validation.message}\n` +
          `Es sind noch ${validation.data.count} Boot(e) nicht im Ziel:\n` +
          validation.data.boats.map(b => `- ${b.segelnummer}`).join('\n')
        );
        console.log('🛑 RETURN - Stopping execution');
        return;
      }
    }
    
    console.log('✅ Validation passed - Proceeding with completion');
    
    // Wenn force=true: Füge fehlende Boote als DNS hinzu
    if (force && verfuegbareBoats.length > 0) {
      console.log('⚠️ Force mode - Adding DNS boats');
      const updatedZielBoats = [...zielBoats];
      const updatedPenalties = { ...boatPenalties };
      
      // Füge alle fehlenden Boote am Ende als DNS hinzu
      verfuegbareBoats.forEach(boat => {
        updatedZielBoats.push(boat.id);
        updatedPenalties[boat.id] = PENALTY_CODES.DNS;
      });
      
      setZielBoats(updatedZielBoats);
      setBoatPenalties(updatedPenalties);
      
      // Save with DNS boats
      autoSaveZielerfassung(updatedZielBoats, updatedPenalties);
      
      console.log(`⚠️ ${verfuegbareBoats.length} fehlende Boote als DNS hinzugefügt`);
    } else {
      // Normal save (alle Boote erfasst)
      console.log('💾 Normal save - all boats captured');
      autoSaveZielerfassung(zielBoats, boatPenalties);
    }
    
    // Mark Wettfahrt as completed (unvollstaendig if boats were missing)
    const isUnvollstaendig = verfuegbareBoats.length > 0;
    console.log('📊 isUnvollstaendig:', isUnvollstaendig);
    
    const updatedWettfahrten = wettfahrten.map(w =>
      w.id === selectedWettfahrt.id
        ? { ...w, abgeschlossen: true, unvollstaendig: isUnvollstaendig }
        : w
    );
    setWettfahrten(updatedWettfahrten);
    
    // Update selectedWettfahrt to reflect new status
    setSelectedWettfahrt({ 
      ...selectedWettfahrt, 
      abgeschlossen: true, 
      unvollstaendig: isUnvollstaendig 
    });
    
    // Success message
    if (isUnvollstaendig) {
      console.log(`⚠️ Wertung unvollständig abgeschlossen! ${zielBoats.length} Boote bewertet, ${verfuegbareBoats.length} fehlen.`);
    } else {
      console.log(`✅ Wertung abgeschlossen! ${zielBoats.length} Boote wurden bewertet.`);
    }
  };

  // Wertung erneut öffnen (für Korrekturen)
  const reopenWertung = () => {
    const updatedWettfahrten = wettfahrten.map(w =>
      w.id === selectedWettfahrt.id
        ? { ...w, abgeschlossen: false, unvollstaendig: false }
        : w
    );
    setWettfahrten(updatedWettfahrten);
    
    // Update selectedWettfahrt to reflect new status
    setSelectedWettfahrt({ 
      ...selectedWettfahrt, 
      abgeschlossen: false, 
      unvollstaendig: false 
    });
    
    console.log('🔓 Wertung erneut geöffnet - Bearbeitung möglich');
  };

  const changeBoatPlacement = (boatId, newPlacement) => {
    const currentIndex = zielBoats.indexOf(boatId);
    if (currentIndex === -1) return;
    
    const penaltyCodes = Object.values(PENALTY_CODES);
    const isPenaltyCode = penaltyCodes.includes(newPlacement);
    const hadPenalty = !!boatPenalties[boatId];
    
    // Remove from current position
    const newZielBoats = zielBoats.filter(id => id !== boatId);
    let newPenalties = { ...boatPenalties };
    
    if (isPenaltyCode) {
      // Setting a penalty code
      const newPenaltyValue = PENALTY_ORDER[newPlacement];
      
      // Find where to insert: after all regular boats and after all penalties with higher priority
      let insertIndex = newZielBoats.length;
      for (let i = newZielBoats.length - 1; i >= 0; i--) {
        const otherBoatPenalty = newPenalties[newZielBoats[i]];
        if (!otherBoatPenalty) {
          // This is a regular boat, insert after it
          insertIndex = i + 1;
          break;
        } else {
          const otherPenaltyValue = PENALTY_ORDER[otherBoatPenalty];
          if (otherPenaltyValue < newPenaltyValue) {
            // Other boat has higher priority (lower value), insert after it
            insertIndex = i + 1;
            break;
          }
        }
      }
      
      newZielBoats.splice(insertIndex, 0, boatId);
      newPenalties[boatId] = newPlacement;
    } else {
      // Setting a regular placement (number)
      const newIndex = newPlacement - 1; // Convert 1-based to 0-based index
      
      // Remove penalty if boat had one
      if (hadPenalty) {
        delete newPenalties[boatId];
      }
      
      // Find the first penalty boat index
      let firstPenaltyIndex = newZielBoats.length;
      for (let i = 0; i < newZielBoats.length; i++) {
        if (newPenalties[newZielBoats[i]]) {
          firstPenaltyIndex = i;
          break;
        }
      }
      
      // Insert at the new position, but never after a penalty boat
      const actualInsertIndex = Math.min(newIndex, firstPenaltyIndex);
      newZielBoats.splice(actualInsertIndex, 0, boatId);
    }
    
    setZielBoats(newZielBoats);
    setBoatPenalties(newPenalties);
    setSelectedBoatInZiel(null);
  };

  const saveWettfahrtErgebnisse = () => {
    // Remove old results for this wettfahrt
    const filteredErgebnisse = ergebnisse.filter(e => e.wettfahrtId !== selectedWettfahrt.id);
    
    // Create new results (including penalties)
    const newErgebnisse = zielBoats.map((boatId, index) => ({
      id: generateId(),
      wettfahrtId: selectedWettfahrt.id,
      bootId: boatId,
      platz: index + 1,
      penalty: boatPenalties[boatId] || null
    }));

    setErgebnisse([...filteredErgebnisse, ...newErgebnisse]);
    
    // Mark wettfahrt as completed
    setWettfahrten(wettfahrten.map(w => 
      w.id === selectedWettfahrt.id 
        ? { ...w, abgeschlossen: true }
        : w
    ));

    setCurrentView('wettfahrtenOverview');
    setZielBoats([]);
    setBoatPenalties({});
    setSelectedBoatInZiel(null);
  };

  const viewErgebnisse = (wettfahrt) => {
    setSelectedWettfahrt(wettfahrt);
    setCurrentView('ergebnisseView');
  };

  // Calculate overall results across all races
  const calculateGesamtergebnis = (regattaId) => {
    const regattaWettfahrten = queries.regatta.getCompletedWettfahrten(wettfahrten, regattaId);
    const regattaBoats = queries.regatta.getBoats(boats, regattaId);
    const numDiscards = streicher[regattaId] || 0;
    
    if (regattaWettfahrten.length < 2) {
      return null; // Need at least 2 races for overall results
    }
    
    // Build results map: boatId -> array of placements
    const boatResults = {};
    regattaBoats.forEach(boat => {
      boatResults[boat.id] = {
        boat: boat,
        placements: [], // Array of {platz, wettfahrtIndex, discarded}
        total: 0
      };
    });
    
    // Collect placements from each race (in order)
    regattaWettfahrten.sort((a, b) => a.nummer - b.nummer).forEach((wettfahrt, wfIndex) => {
      const raceResults = ergebnisse.filter(e => e.wettfahrtId === wettfahrt.id);
      const totalBoatsInRace = raceResults.length;
      const penaltyPoints = totalBoatsInRace + 1;
      
      raceResults.forEach(result => {
        if (boatResults[result.bootId]) {
          boatResults[result.bootId].placements.push({
            platz: result.penalty ? penaltyPoints : result.platz,
            penalty: result.penalty || null,
            wettfahrtIndex: wfIndex,
            discarded: false,
            isUnvollstaendig: wettfahrt.unvollstaendig || false  // Flag für gelbe Anzeige
          });
        }
      });
    });
    
    // Apply discards (streicher)
    Object.values(boatResults).forEach(result => {
      if (result.placements.length > 0 && numDiscards > 0) {
        // Sort placements to find worst results
        // Priority: 1. Highest placement, 2. Latest race (highest wettfahrtIndex)
        const sorted = [...result.placements].sort((a, b) => {
          if (b.platz !== a.platz) {
            return b.platz - a.platz; // Worst (highest) placement first
          }
          return b.wettfahrtIndex - a.wettfahrtIndex; // Latest race first if equal
        });
        
        // Mark worst results as discarded
        const toDiscard = Math.min(numDiscards, result.placements.length - 1); // Keep at least 1 result
        for (let i = 0; i < toDiscard; i++) {
          const worstResult = sorted[i];
          // Find and mark in original array
          const originalIndex = result.placements.findIndex(
            p => p.platz === worstResult.platz && 
                 p.wettfahrtIndex === worstResult.wettfahrtIndex && 
                 !p.discarded
          );
          if (originalIndex !== -1) {
            result.placements[originalIndex].discarded = true;
          }
        }
        
        // Calculate total only from non-discarded results
        result.total = result.placements
          .filter(p => !p.discarded)
          .reduce((sum, p) => sum + p.platz, 0);
      } else {
        // No discards, calculate total normally
        result.total = result.placements.reduce((sum, p) => sum + p.platz, 0);
      }
    });
    
    // Convert to array and sort with tie-breaking rules
    const sortedResults = Object.values(boatResults)
      .filter(br => br.placements.length > 0) // Only boats that participated
      .sort((a, b) => {
        // Rule 1: Lower total points is better (only counting non-discarded)
        if (a.total !== b.total) {
          return a.total - b.total;
        }
        
        // Rule 2: If total is equal, compare best non-discarded placements
        const aNonDiscarded = a.placements.filter(p => !p.discarded).map(p => p.platz).sort((x, y) => x - y);
        const bNonDiscarded = b.placements.filter(p => !p.discarded).map(p => p.platz).sort((x, y) => x - y);
        
        for (let i = 0; i < Math.min(aNonDiscarded.length, bNonDiscarded.length); i++) {
          if (aNonDiscarded[i] !== bNonDiscarded[i]) {
            return aNonDiscarded[i] - bNonDiscarded[i]; // Better (lower) placement wins
          }
        }
        
        // Rule 3: If all non-discarded placements are equal, use result from the absolute last race (regardless of discard status)
        // Find the chronologically last race (highest wettfahrtIndex) - always exists since boats must have participated
        const aAllPlacements = [...a.placements]; // Explicit copy
        const bAllPlacements = [...b.placements]; // Explicit copy
        
        aAllPlacements.sort((x, y) => y.wettfahrtIndex - x.wettfahrtIndex);
        bAllPlacements.sort((x, y) => y.wettfahrtIndex - x.wettfahrtIndex);
        
        const aAbsoluteLast = aAllPlacements[0]; // Highest index = latest race
        const bAbsoluteLast = bAllPlacements[0]; // Highest index = latest race
        
        if (aAbsoluteLast && bAbsoluteLast) {
          return aAbsoluteLast.platz - bAbsoluteLast.platz;
        }
        
        return 0; // Complete tie (very unlikely)
      });
    
    // Assign overall placements
    sortedResults.forEach((result, index) => {
      result.overallPlatz = index + 1;
    });
    
    return {
      wettfahrten: regattaWettfahrten,
      results: sortedResults
    };
  };

  // Touch-Hold Helper Functions
  const handleTouchStart = (e, index, boatId) => {
    // Don't allow dragging boats with penalties or during editing
    if (boatPenalties[boatId] || selectedBoatInZiel === boatId) {
      return;
    }

    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Start timer for long-press (500ms)
    const timer = setTimeout(() => {
      // Activate drag mode
      setIsDraggingTouch(true);
      setDraggedIndex(index);
      setDragOverIndex(index);
      
      // Haptisches Feedback wenn verfügbar
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      // Measure item height
      const nextSibling = e.currentTarget.nextElementSibling;
      if (nextSibling) {
        const nextRect = nextSibling.getBoundingClientRect();
        setItemHeight(nextRect.top - rect.top);
      }
      
      setTouchDragPosition({
        x: touch.clientX,
        y: touch.clientY
      });
    }, 500);
    
    setTouchHoldTimer(timer);
  };

  const handleTouchMove = (e, boatsLength) => {
    if (!isDraggingTouch || draggedIndex === null) {
      return;
    }
    
    // Prevent scrolling while dragging
    e.preventDefault();
    
    const touch = e.touches[0];
    setTouchDragPosition({
      x: touch.clientX,
      y: touch.clientY
    });
    
    // Calculate which index we're hovering over based on Y position
    const element = e.currentTarget.parentElement;
    const rect = element.getBoundingClientRect();
    const relativeY = touch.clientY - rect.top;
    const newIndex = Math.floor(relativeY / itemHeight);
    
    if (newIndex >= 0 && newIndex < boatsLength && newIndex !== dragOverIndex) {
      // Check if target boat has penalty
      const targetBoatId = zielBoats[newIndex];
      if (!boatPenalties[targetBoatId]) {
        setDragOverIndex(newIndex);
      }
    }
  };

  const handleTouchEnd = () => {
    // Clear timer if touch ended before 500ms
    if (touchHoldTimer) {
      clearTimeout(touchHoldTimer);
      setTouchHoldTimer(null);
    }
    
    // If was dragging, perform drop
    if (isDraggingTouch && draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const targetBoatId = zielBoats[dragOverIndex];
      if (!boatPenalties[targetBoatId]) {
        const newOrder = [...zielBoats];
        const [movedBoat] = newOrder.splice(draggedIndex, 1);
        newOrder.splice(dragOverIndex, 0, movedBoat);
        setZielBoats(newOrder);
      }
    }
    
    // Reset drag state
    setIsDraggingTouch(false);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Desktop Drag & Drop Handlers
  const handleDragStart = (index) => {
    setDraggedIndex(index);
    setDragOverIndex(index);
  };

  const handleDragOver = (index) => {
    if (draggedIndex === null) return;
    setDragOverIndex(index);
  };

  const handleDrop = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newOrder = [...zielBoats];
      const [movedBoat] = newOrder.splice(draggedIndex, 1);
      newOrder.splice(dragOverIndex, 0, movedBoat);
      setZielBoats(newOrder);
    }
    
    // Reset drag state
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Swipe Gesture Functions
  const handleSwipeStart = (e, itemId = null) => {
    const touch = e.touches[0];
    setSwipeStartX(touch.clientX);
    setSwipeStartY(touch.clientY);
    setSwipeCurrentX(touch.clientX);
    setSwipeItemId(itemId);
  };

  const handleSwipeMove = (e, isScreenSwipe = false) => {
    if (swipeStartX === null || swipeStartY === null) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - swipeStartX;
    const deltaY = touch.clientY - swipeStartY;
    
    // Pull-to-refresh (nur auf Screen-Level, nicht auf Items)
    if (isScreenSwipe && deltaY > 0 && Math.abs(deltaX) < 50 && window.scrollY === 0) {
      const distance = Math.min(deltaY, 120); // Max 120px
      setPullToRefreshDistance(distance);
      
      // Prevent default scroll when pulling
      if (distance > 10) {
        e.preventDefault();
      }
    }
    
    // Item swipe (nur horizontal)
    if (!isScreenSwipe && swipeItemId && Math.abs(deltaX) > Math.abs(deltaY)) {
      setSwipeCurrentX(touch.clientX);
      e.preventDefault(); // Prevent scrolling while swiping
    }
  };

  const handleSwipeEnd = (e, onDelete = null, isScreenSwipe = false) => {
    if (swipeStartX === null || swipeStartY === null) {
      return;
    }
    
    const deltaX = (swipeCurrentX || swipeStartX) - swipeStartX;
    const deltaY = (e.changedTouches?.[0]?.clientY || swipeStartY) - swipeStartY;
    
    // Pull-to-refresh
    if (isScreenSwipe && pullToRefreshDistance > 80) {
      setIsRefreshing(true);
      setPullToRefreshDistance(0);
      
      // Simulate refresh
      setTimeout(() => {
        // Reload data from localStorage
        const storedRegattas = loadFromStorage('regattas', []);
        const storedBoats = loadFromStorage('boats', []);
        const storedWettfahrten = loadFromStorage('wettfahrten', []);
        const storedErgebnisse = loadFromStorage('ergebnisse', []);
        const storedStreicher = loadFromStorage('streicher', {});
        
        setRegattas(storedRegattas);
        setBoats(storedBoats);
        setWettfahrten(storedWettfahrten);
        setErgebnisse(storedErgebnisse);
        setStreicher(storedStreicher);
        
        setIsRefreshing(false);
        
        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate([30, 50, 30]);
        }
      }, 1000);
    } else {
      setPullToRefreshDistance(0);
    }
    
    // Swipe back (right swipe > 100px)
    if (Math.abs(deltaY) < 50 && deltaX > 100) {
      // Navigate back
      if (currentView === 'regattaDetail') {
        setCurrentView('overview');
      } else if (currentView === 'editBoat') {
        setCurrentView('regattaDetail');
      } else if (currentView === 'wettfahrtenOverview') {
        setCurrentView('wertung');
      } else if (currentView === 'zielerfassung') {
        setCurrentView('wettfahrtenOverview');
      } else if (currentView === 'ergebnisseView') {
        setCurrentView('wettfahrtenOverview');
      } else if (currentView === 'editWettfahrt') {
        setCurrentView('wettfahrtenOverview');
      } else if (currentView === 'editRegatta') {
        setCurrentView('overview');
      } else if (currentView === 'createRegatta') {
        setCurrentView('overview');
      }
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(40);
      }
    }
    
    // Swipe left to delete (< -100px)
    if (!isScreenSwipe && swipeItemId && Math.abs(deltaY) < 50 && deltaX < -100 && onDelete) {
      onDelete(swipeItemId);
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
      }
    }
    
    // Reset
    setSwipeStartX(null);
    setSwipeStartY(null);
    setSwipeCurrentX(null);
    setSwipeItemId(null);
  };



  // Bottom Sheet Component für Boot hinzufügen
  // Pull-to-Refresh Indicator Component
  const PullToRefreshIndicator = () => {
    if (pullToRefreshDistance === 0 && !isRefreshing) return null;
    
    const isReady = pullToRefreshDistance > 80;
    const rotation = Math.min(pullToRefreshDistance * 3, 360);
    
    return (
      <div 
        className="fixed top-0 left-0 right-0 flex justify-center items-center z-50 pointer-events-none transition-opacity"
        style={{ 
          transform: `translateY(${isRefreshing ? '60px' : pullToRefreshDistance}px)`,
          opacity: isRefreshing ? 1 : Math.min(pullToRefreshDistance / 80, 1)
        }}
      >
        <div className={`bg-white rounded-full p-3 shadow-lg ${isRefreshing ? 'animate-spin' : ''}`}>
          {isRefreshing ? (
            <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full"></div>
          ) : (
            <div 
              className={`text-2xl transition-transform ${isReady ? 'text-green-500' : 'text-gray-400'}`}
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              ↻
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Functions
  const renderOverview = () => {
    const vorbereitungRegattas = regattas.filter(r => r.status === 'vorbereitung' || !r.status);
    const aktiveRegattas = regattas.filter(r => r.status === 'aktiv');
    const abgeschlosseneRegattas = regattas.filter(r => r.status === 'abgeschlossen');

    const RegattaCard = ({ regatta, isPrimary = false }) => {
      const boatCount = boats.filter(b => b.regattaId === regatta.id).length;
      const wettfahrtCount = wettfahrten.filter(w => w.regattaId === regatta.id).length;
      const status = regatta.status || 'vorbereitung';
      const isExpanded = expandedRegattaId === regatta.id;
      
      const statusConfig = {
        vorbereitung: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', borderStrong: 'border-yellow-500' },
        aktiv: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', borderStrong: 'border-green-500' },
        abgeschlossen: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', borderStrong: 'border-gray-500' }
      };
      
      const config = statusConfig[status];

      return (
        <div
          className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer border-2 ${
            isExpanded ? `${config.borderStrong} p-6` : 'border-transparent p-4'
          }`}
          onClick={() => {
            if (isExpanded) {
              // Wenn bereits expanded, öffne Detail
              openRegattaDetail(regatta);
            } else {
              // Sonst: expandiere Card
              setExpandedRegattaId(regatta.id);
            }
          }}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className={`font-bold text-gray-900 mb-2 ${isExpanded ? 'text-xl' : 'text-lg'}`}>
                {regatta.name}
              </h3>
              <select
                value={status}
                onChange={(e) => {
                  e.stopPropagation();
                  changeRegattaStatus(regatta.id, e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                className={`px-3 py-2 rounded-full text-sm font-medium ${config.bg} ${config.text} border ${config.border} cursor-pointer`}
                style={{ minHeight: '44px' }}
              >
                <option value="vorbereitung">🟡 Vorbereitung</option>
                <option value="aktiv">🟢 Aktiv</option>
                <option value="abgeschlossen">⚫ Abgeschlossen</option>
              </select>
            </div>
            {status !== 'abgeschlossen' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openEditRegatta(regatta);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <Edit2 size={20} />
              </button>
            )}
          </div>

          <div className={`grid gap-2 mb-4 ${isExpanded ? 'text-base' : 'text-sm'} text-gray-600`}>
            {regatta.datum && (
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span>{regatta.datum}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span>⛵</span>
              <span>{boatCount} Boote</span>
            </div>
            {wettfahrtCount > 0 && (
              <div className="flex items-center gap-2">
                <span>🏁</span>
                <span>{wettfahrtCount} Wettfahrten</span>
              </div>
            )}
          </div>

          {isExpanded && (
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openRegattaDetail(regatta);
                }}
                className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors active:scale-95"
                style={{ minHeight: '44px' }}
              >
                ÖFFNEN
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRegatta(regatta);
                  setCurrentView('wettfahrtenOverview');
                }}
                className="bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium transition-colors active:scale-95"
                style={{ minHeight: '44px' }}
              >
                WERTUNG
              </button>
            </div>
          )}
        </div>
      );
    };

    return (
      <div 
        className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8"
        onTouchStart={(e) => handleSwipeStart(e)}
        onTouchMove={(e) => handleSwipeMove(e, true)}
        onTouchEnd={(e) => handleSwipeEnd(e, null, true)}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Organisation</h1>
            <button
              onClick={() => setCurrentView('createRegatta')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors active:scale-95"
              style={{ minHeight: '44px' }}
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Neue Regatta</span>
            </button>
          </div>

          {regattas.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-6xl mb-4">⛵</div>
              <p className="text-gray-500 mb-4">Noch keine Regatten angelegt.</p>
              <button
                onClick={() => setCurrentView('createRegatta')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors active:scale-95"
                style={{ minHeight: '44px' }}
              >
                Erste Regatta erstellen
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Aktive Regatten - Collapsed/Expandable */}
              {aktiveRegattas.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <button
                    onClick={() => setShowAktiv(!showAktiv)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    style={{ minHeight: '60px' }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🟢</span>
                      <span className="font-bold text-green-700">AKTIV</span>
                      <span className="text-sm text-gray-500">({aktiveRegattas.length})</span>
                    </div>
                    <ChevronLeft 
                      size={24} 
                      className={`transform transition-transform text-gray-400 ${showAktiv ? 'rotate-90' : '-rotate-90'}`} 
                    />
                  </button>
                  {showAktiv && (
                    <div className="p-4 pt-0 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {aktiveRegattas.map((regatta) => (
                          <RegattaCard key={regatta.id} regatta={regatta} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* In Vorbereitung - Collapsed */}
              {vorbereitungRegattas.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <button
                    onClick={() => setShowVorbereitung(!showVorbereitung)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    style={{ minHeight: '60px' }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🟡</span>
                      <span className="font-bold text-yellow-700">IN VORBEREITUNG</span>
                      <span className="text-sm text-gray-500">({vorbereitungRegattas.length})</span>
                    </div>
                    <ChevronLeft 
                      size={24} 
                      className={`transform transition-transform text-gray-400 ${showVorbereitung ? 'rotate-90' : '-rotate-90'}`} 
                    />
                  </button>
                  {showVorbereitung && (
                    <div className="p-4 pt-0 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {vorbereitungRegattas.map((regatta) => (
                          <RegattaCard key={regatta.id} regatta={regatta} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Abgeschlossen - Collapsed */}
              {abgeschlosseneRegattas.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden opacity-75">
                  <button
                    onClick={() => setShowAbgeschlossen(!showAbgeschlossen)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    style={{ minHeight: '60px' }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">⚫</span>
                      <span className="font-bold text-gray-700">ABGESCHLOSSEN</span>
                      <span className="text-sm text-gray-500">({abgeschlosseneRegattas.length})</span>
                    </div>
                    <ChevronLeft 
                      size={24} 
                      className={`transform transition-transform text-gray-400 ${showAbgeschlossen ? 'rotate-90' : '-rotate-90'}`} 
                    />
                  </button>
                  {showAbgeschlossen && (
                    <div className="p-4 pt-0 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {abgeschlosseneRegattas.map((regatta) => (
                          <RegattaCard key={regatta.id} regatta={regatta} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };
  const renderRegattaForm = (isEdit = false) => (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => {
            setRegattaForm({ name: '', datum: '', veranstalter: '', bootsklasse: '' });
            setCurrentView(isEdit ? 'regattaDetail' : 'overview');
          }}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft size={20} />
          Zurück
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isEdit ? 'Regatta bearbeiten' : 'Neue Regatta anlegen'}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name der Regatta *
              </label>
              <input
                type="text"
                value={regattaForm.name}
                onChange={(e) => setRegattaForm({ ...regattaForm, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="z.B. Frühjahrsregatta 2026"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Datum (optional)
              </label>
              <input
                type="date"
                value={regattaForm.datum}
                onChange={(e) => setRegattaForm({ ...regattaForm, datum: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Veranstalter (optional)
              </label>
              <input
                type="text"
                value={regattaForm.veranstalter}
                onChange={(e) => setRegattaForm({ ...regattaForm, veranstalter: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="z.B. Segelclub Hamburg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bootsklasse (optional)
              </label>
              <input
                type="text"
                value={regattaForm.bootsklasse}
                onChange={(e) => setRegattaForm({ ...regattaForm, bootsklasse: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="z.B. Laser, 420, Optimist"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={isEdit ? updateRegatta : createRegatta}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Save size={20} />
                {isEdit ? 'Änderungen speichern' : 'Regatta anlegen'}
              </button>
              <button
                onClick={() => {
                  setRegattaForm({ name: '', datum: '', veranstalter: '', bootsklasse: '' });
                  setCurrentView(isEdit ? 'regattaDetail' : 'overview');
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRegattaDetail = () => (
    <div 
      className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8"
      onTouchStart={(e) => handleSwipeStart(e)}
      onTouchMove={(e) => handleSwipeMove(e, true)}
      onTouchEnd={(e) => handleSwipeEnd(e, null, true)}
    >
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => setCurrentView('overview')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 py-2"
          style={{ minHeight: '44px' }}
        >
          <ChevronLeft size={20} />
          Zurück zur Übersicht
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedRegatta.name}</h1>
              <div className="text-sm text-gray-600 space-y-1">
                {selectedRegatta.datum && <p>Datum: {selectedRegatta.datum}</p>}
                {selectedRegatta.veranstalter && <p>Veranstalter: {selectedRegatta.veranstalter}</p>}
                {selectedRegatta.bootsklasse && <p>Bootsklasse: {selectedRegatta.bootsklasse}</p>}
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedRegatta.status === 'aktiv'
                ? 'bg-green-100 text-green-800'
                : selectedRegatta.status === 'abgeschlossen'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {selectedRegatta.status === 'aktiv'
                ? '🟢 Aktiv'
                : selectedRegatta.status === 'abgeschlossen'
                ? '⚫ Abgeschlossen'
                : '🟡 In Vorbereitung'
              }
            </span>
          </div>

          <div className="flex gap-3">
            {selectedRegatta.status !== 'abgeschlossen' && (
              <button
                onClick={() => openEditRegatta(selectedRegatta)}
                className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                style={{ minHeight: '44px' }}
              >
                <Edit2 size={18} />
                Metadaten bearbeiten
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Header mit Expand-Button */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Boote ({regattaBoats.length})
            </h2>
            {selectedRegatta.status !== 'abgeschlossen' && (
              <button
                onClick={() => setShowBootFormExpanded(!showBootFormExpanded)}
                className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all active:scale-95"
                style={{ minHeight: '44px' }}
              >
                {showBootFormExpanded ? (
                  <>
                    <X size={20} />
                    <span className="hidden sm:inline">Abbrechen</span>
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    <span className="hidden sm:inline">Boot hinzufügen</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Expandable Form */}
          {showBootFormExpanded && selectedRegatta.status !== 'abgeschlossen' && (
            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-4">Neues Boot hinzufügen</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Segelnummer *
                  </label>
                  <input
                    type="text"
                    value={boatForm.segelnummer}
                    onChange={(e) => {
                      setBoatForm({ ...boatForm, segelnummer: e.target.value });
                      if (boatFormErrors.segelnummer) {
                        setBoatFormErrors({ ...boatFormErrors, segelnummer: '' });
                      }
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      boatFormErrors.segelnummer 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-300 focus:border-blue-500'
                    }`}
                    placeholder="GER 1234"
                    style={{ minHeight: '48px' }}
                  />
                  {boatFormErrors.segelnummer && (
                    <p className="text-sm text-red-600 mt-1">
                      {boatFormErrors.segelnummer}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Steuermann
                  </label>
                  <input
                    type="text"
                    value={boatForm.steuermann}
                    onChange={(e) => setBoatForm({ ...boatForm, steuermann: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Max Mustermann"
                    style={{ minHeight: '48px' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verein
                  </label>
                  <input
                    type="text"
                    value={boatForm.verein}
                    onChange={(e) => setBoatForm({ ...boatForm, verein: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="WSV München"
                    style={{ minHeight: '48px' }}
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  addBoat();
                  // Form bleibt offen für schnelles Hinzufügen mehrerer Boote
                }}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                style={{ minHeight: '48px' }}
              >
                <Plus size={20} />
                Boot hinzufügen
              </button>
            </div>
          )}

          {selectedRegatta.status === 'abgeschlossen' && regattaBoats.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Keine Boote vorhanden. Diese Regatta ist abgeschlossen.
            </div>
          )}

          {regattaBoats.length === 0 && selectedRegatta.status !== 'abgeschlossen' && !showBootFormExpanded && (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">⛵</div>
              <p className="text-gray-500 mb-4">Noch keine Boote hinzugefügt.</p>
              <p className="text-sm text-gray-400">Klicken Sie auf &quot;+ Boot hinzufügen&quot; um zu starten.</p>
            </div>
          )}

          {regattaBoats.length > 0 && (
            <div>
              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="🔍 Suche: Segelnummer, Steuermann oder Verein..."
                    value={boatFilter.segelnummer || boatFilter.steuermann || boatFilter.verein || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setBoatFilter({ 
                        segelnummer: value, 
                        steuermann: value, 
                        verein: value 
                      });
                    }}
                    className="w-full px-4 py-3 pl-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    style={{ minHeight: '48px' }}
                  />
                  {(boatFilter.segelnummer || boatFilter.steuermann || boatFilter.verein) && (
                    <button
                      onClick={clearFilters}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Chips & Sort */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="text-sm text-gray-600">Sortieren:</span>
                <button
                  onClick={() => handleSort('segelnummer')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    boatSort.column === 'segelnummer'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Segelnummer {boatSort.column === 'segelnummer' && (boatSort.direction === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => handleSort('steuermann')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    boatSort.column === 'steuermann'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Steuermann {boatSort.column === 'steuermann' && (boatSort.direction === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => handleSort('verein')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    boatSort.column === 'verein'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Verein {boatSort.column === 'verein' && (boatSort.direction === 'asc' ? '↑' : '↓')}
                </button>
              </div>

              {/* Boot Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getFilteredAndSortedBoats().map(boat => {
                  const swipeOffset = swipeItemId === boat.id && swipeCurrentX !== null 
                    ? Math.min(0, (swipeCurrentX - swipeStartX)) 
                    : 0;
                  const isSwipeDelete = swipeOffset < -100;

                  return (
                    <div
                      key={boat.id}
                      className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all border-2 ${
                        isSwipeDelete ? 'border-red-500 bg-red-50' : 'border-transparent'
                      }`}
                      style={{
                        transform: `translateX(${swipeOffset}px)`,
                        transition: swipeItemId === boat.id ? 'none' : 'transform 0.3s'
                      }}
                      onTouchStart={(e) => handleSwipeStart(e, boat.id)}
                      onTouchMove={(e) => handleSwipeMove(e, false)}
                      onTouchEnd={(e) => handleSwipeEnd(e, deleteBoat, false)}
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="font-mono text-lg font-bold text-gray-900 mb-1">
                              {boat.segelnummer}
                            </div>
                            {boat.steuermann && (
                              <div className="text-sm text-gray-700 mb-1">
                                {boat.steuermann}
                              </div>
                            )}
                            {boat.verein && (
                              <div className="text-sm text-gray-600 flex items-center gap-1">
                                <span>🏛️</span>
                                {boat.verein}
                              </div>
                            )}
                          </div>
                          {selectedRegatta.status !== 'abgeschlossen' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditBoat(boat)}
                                className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                                style={{ minWidth: '44px', minHeight: '44px' }}
                                title="Bearbeiten"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => deleteBoat(boat.id)}
                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center"
                                style={{ minWidth: '44px', minHeight: '44px' }}
                                title="Löschen"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          )}
                        </div>
                        {isSwipeDelete && (
                          <div className="text-xs text-red-600 font-medium">
                            ← Loslassen zum Löschen
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Empty State */}
              {getFilteredAndSortedBoats().length === 0 && regattaBoats.length > 0 && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-gray-500">Keine Boote entsprechen den Filterkriterien.</p>
                  <button
                    onClick={clearFilters}
                    className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Filter zurücksetzen
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderEditBoat = () => (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => {
            setBoatForm({ segelnummer: '', steuermann: '', verein: '' });
            setEditingBoat(null);
            setCurrentView('regattaDetail');
          }}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft size={20} />
          Zurück
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Boot bearbeiten</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Segelnummer *
              </label>
              <input
                type="text"
                value={boatForm.segelnummer}
                onChange={(e) => setBoatForm({ ...boatForm, segelnummer: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="z.B. GER 1234"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Steuermann (optional)
              </label>
              <input
                type="text"
                value={boatForm.steuermann}
                onChange={(e) => setBoatForm({ ...boatForm, steuermann: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="z.B. Max Mustermann"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verein (optional)
              </label>
              <input
                type="text"
                value={boatForm.verein}
                onChange={(e) => setBoatForm({ ...boatForm, verein: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="z.B. SCH"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={updateBoat}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Save size={20} />
                Änderungen speichern
              </button>
              <button
                onClick={() => {
                  setBoatForm({ segelnummer: '', steuermann: '', verein: '' });
                  setEditingBoat(null);
                  setCurrentView('regattaDetail');
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Wertungs-Bereich Render Functions
  const renderWertungOverview = () => {
    const aktiveRegattas = regattas.filter(r => r.status === 'aktiv');

    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Wertung</h1>
          </div>

          {aktiveRegattas.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-5xl mb-4">🏆</div>
              <p className="text-gray-500 mb-4">Keine aktiven Regatten vorhanden.</p>
              <p className="text-sm text-gray-400 mb-4">Setzen Sie eine Regatta auf &quot;Aktiv&quot; um sie hier anzuzeigen.</p>
              <button
                onClick={() => setCurrentView('overview')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Zur Organisation wechseln
              </button>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aktiveRegattas.map(regatta => {
                  const boatCount = boats.filter(b => b.regattaId === regatta.id).length;
                  const totalWettfahrten = wettfahrten.filter(w => w.regattaId === regatta.id).length;
                  
                  return (
                    <div
                      key={regatta.id}
                      onClick={() => {
                        setSelectedRegatta(regatta);
                        setCurrentView('wettfahrtenOverview');
                      }}
                      className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all cursor-pointer border-2 border-transparent hover:border-blue-200"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 mb-2">{regatta.name}</h3>
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            🟢 Aktiv
                          </span>
                        </div>
                      </div>
                      
                      {/* Info */}
                      <div className="text-sm text-gray-600 space-y-2 mb-4">
                        {regatta.datum && (
                          <div className="flex items-center gap-2">
                            <span>📅</span>
                            <span>{regatta.datum}</span>
                          </div>
                        )}
                        {regatta.bootsklasse && (
                          <div className="flex items-center gap-2">
                            <span>⛵</span>
                            <span>{regatta.bootsklasse}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span>👥</span>
                          <span>{boatCount} Boote</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>🏁</span>
                          <span>{totalWettfahrten} {totalWettfahrten === 1 ? 'Wettfahrt' : 'Wettfahrten'}</span>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <button 
                        className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
                        style={{ minHeight: '44px' }}
                      >
                        <span>Ergebnis anzeigen</span>
                        <ChevronLeft className="transform rotate-180" size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWettfahrtenOverview = () => {
    const regattaWettfahrten = wettfahrten.filter(w => w.regattaId === selectedRegatta.id);
    const gesamtergebnis = calculateGesamtergebnis(selectedRegatta.id);

    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8 pb-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <button
            onClick={() => {
              setSelectedRegatta(null);
              setCurrentView('wertung');
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 py-2"
            style={{ minHeight: '44px' }}
          >
            <ChevronLeft size={20} />
            <span className="font-medium">Zurück zur Regattaauswahl</span>
          </button>

          {/* Regatta Info */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedRegatta.name}</h1>
            <div className="text-sm text-gray-600 space-y-1">
              {selectedRegatta.datum && <p>📅 {selectedRegatta.datum}</p>}
              {selectedRegatta.bootsklasse && <p>⛵ {selectedRegatta.bootsklasse}</p>}
            </div>
          </div>

          {/* Wettfahrten Liste */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Wettfahrten ({regattaWettfahrten.length})
              </h2>
              <button
                onClick={() => createWettfahrt(selectedRegatta.id)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                style={{ minHeight: '44px' }}
              >
                <Plus size={20} />
                Neue Wettfahrt
              </button>
            </div>

            {regattaWettfahrten.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">🏁</div>
                <p className="text-gray-500 mb-2">Noch keine Wettfahrten angelegt</p>
                <p className="text-sm text-gray-400">Erstellen Sie Ihre erste Wettfahrt</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regattaWettfahrten.sort((a, b) => a.nummer - b.nummer).map(wettfahrt => {
                  const wettfahrtErgebnisse = ergebnisse.filter(e => e.wettfahrtId === wettfahrt.id);
                  
                  return (
                    <div
                      key={wettfahrt.id}
                      className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{wettfahrt.name}</h3>
                          <div className="flex items-center gap-2">
                            {wettfahrt.abgeschlossen ? (
                              wettfahrt.unvollstaendig ? (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                                  ⚠ Unvollständig
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                                  ✓ Abgeschlossen
                                </span>
                              )
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                                ⏱ Offen
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditWettfahrt(wettfahrt)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            style={{ minWidth: '36px', minHeight: '36px' }}
                            title="Bearbeiten"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteWettfahrt(wettfahrt.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            style={{ minWidth: '36px', minHeight: '36px' }}
                            title="Löschen"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="mb-4 space-y-1 text-sm text-gray-600">
                        <p>👥 {wettfahrtErgebnisse.length} Boote gewertet</p>
                        {wettfahrt.startzeit && <p>🕐 Start: {wettfahrt.startzeit}</p>}
                        {wettfahrt.windstaerke && <p>💨 Wind: {wettfahrt.windstaerke}</p>}
                      </div>

                      {/* Main Action Button */}
                      <button
                        onClick={() => startZielerfassung(wettfahrt)}
                        className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        style={{ minHeight: '48px' }}
                      >
                        {wettfahrt.abgeschlossen ? 'Zielerfassung anzeigen' : 'Zur Zielerfassung →'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Gesamtergebnis */}
          {gesamtergebnis && gesamtergebnis.results.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-gray-900">🏆 Gesamtergebnis</h2>
                
                {/* Streicher Selector */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Streicher:</label>
                  <select
                    value={streicher[selectedRegatta.id] || 0}
                    onChange={(e) => setStreicher({ ...streicher, [selectedRegatta.id]: parseInt(e.target.value) })}
                    className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    style={{ minHeight: '40px' }}
                  >
                    {Array.from({ length: regattaWettfahrten.length }, (_, i) => i).map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Results Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Platz</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Segelnummer</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Steuermann</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Verein</th>
                      {gesamtergebnis.wettfahrten.map(wf => (
                        <th key={wf.id} className="text-center py-3 px-4 font-semibold text-gray-700 bg-gray-50">
                          WF {wf.nummer}
                        </th>
                      ))}
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 bg-blue-50">Gesamt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gesamtergebnis.results.map((result, index) => {
                      const medals = ['🥇', '🥈', '🥉'];
                      return (
                        <tr
                          key={result.boat.id}
                          className={`border-b border-gray-200 ${index < 3 ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {index < 3 && <span className="text-xl">{medals[index]}</span>}
                              <span className="font-semibold">{index + 1}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold">{result.boat.segelnummer}</td>
                          <td className="py-3 px-4">{result.boat.steuermann || '-'}</td>
                          <td className="py-3 px-4">{result.boat.verein || '-'}</td>
                          {result.placements.map((placement, pIndex) => {
                            return (
                              <td
                                key={pIndex}
                                className={`text-center py-3 px-4 ${
                                  placement.discarded
                                    ? 'text-gray-400 line-through bg-gray-50'
                                    : placement.penalty
                                    ? 'text-orange-600 font-semibold bg-orange-50'
                                    : 'font-semibold'
                                }`}
                              >
                                {placement.penalty || placement.platz}
                              </td>
                            );
                          })}
                          <td className="text-center py-3 px-4 font-bold text-blue-700 bg-blue-50">
                            {result.total.toFixed(0)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEditWettfahrt = () => {
    // Check if Zielzeit is before Startzeit
    const isZielzeitInvalid = wettfahrtForm.startzeit && wettfahrtForm.zielzeit && wettfahrtForm.zielzeit < wettfahrtForm.startzeit;
    
    return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => {
            setWettfahrtForm({ startzeit: '', zielzeit: '', windstaerke: '', bahnlaenge: '' });
            setCurrentView('wettfahrtenOverview');
          }}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft size={20} />
          Zurück
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {selectedWettfahrt?.name} - Metadaten bearbeiten
          </h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Startzeit
              </label>
              <input
                type="time"
                value={wettfahrtForm.startzeit}
                onChange={(e) => setWettfahrtForm({ ...wettfahrtForm, startzeit: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zielzeit
              </label>
              <input
                type="time"
                value={wettfahrtForm.zielzeit}
                onChange={(e) => setWettfahrtForm({ ...wettfahrtForm, zielzeit: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isZielzeitInvalid ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {isZielzeitInvalid && (
                <p className="mt-1 text-sm text-red-600">
                  Die Zielzeit darf nicht vor der Startzeit liegen.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Windstärke
              </label>
              <input
                type="text"
                placeholder="z.B. 3-4 Bft"
                value={wettfahrtForm.windstaerke}
                onChange={(e) => setWettfahrtForm({ ...wettfahrtForm, windstaerke: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bahnlänge
              </label>
              <input
                type="text"
                placeholder="z.B. 2 sm"
                value={wettfahrtForm.bahnlaenge}
                onChange={(e) => setWettfahrtForm({ ...wettfahrtForm, bahnlaenge: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={saveWettfahrtMetadata}
                disabled={isZielzeitInvalid}
                className={`flex-1 px-6 py-3 rounded-lg transition-colors font-medium ${
                  isZielzeitInvalid
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Speichern
              </button>
              <button
                onClick={() => {
                  setWettfahrtForm({ startzeit: '', zielzeit: '', windstaerke: '', bahnlaenge: '' });
                  setCurrentView('wettfahrtenOverview');
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  };

  const renderZielerfassung = () => {
    const regattaBoats = queries.regatta.getBoats(boats, selectedRegatta.id);
    const verfuegbareBoats = queries.regatta.getAvailableBoats(boats, selectedRegatta.id, zielBoats);

    // Filter verfügbare Boote nach Suche
    const filteredVerfuegbare = queries.search.filterBoats(verfuegbareBoats, zielSearchQuery);

    // Filter Zieleinlauf-Boote nach Suche
    const zielBoatsWithDetails = queries.boot.getByIds(boats, zielBoats);
    const filteredZielBoatsDetails = queries.search.filterBoats(zielBoatsWithDetails, zieleinlaufSearchQuery);
    const filteredZielBoats = filteredZielBoatsDetails.map(b => b.id);

    const isAbgeschlossen = selectedWettfahrt.abgeschlossen;

    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8 pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <ZielerfassungHeader
            wettfahrt={selectedWettfahrt}
            isAbgeschlossen={isAbgeschlossen}
            isUnvollstaendig={selectedWettfahrt.unvollstaendig}
            boatsCount={zielBoats.length}
            onBack={() => {
              console.log('Zurück button clicked - navigating back');
              setCurrentView('wettfahrtenOverview');
              setZielBoats([]);
              setBoatPenalties({});
            }}
            onComplete={completeWertung}
            onReopen={reopenWertung}
          />

          {/* Status Banner */}
          <ZielerfassungStatusBanner
            isAbgeschlossen={isAbgeschlossen}
            isUnvollstaendig={selectedWettfahrt.unvollstaendig}
          />

          {/* Validation Error Banner */}
          <ValidationErrorBanner
            error={wertungValidationError}
            onShowMissing={() => {
              setShowVerfuegbareBoats(true);
              setWertungValidationError(null);
              setTimeout(() => {
                const element = document.getElementById('verfuegbare-boote-section');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  const searchInput = document.getElementById('verfuegbare-boote-search');
                  if (searchInput) {
                    searchInput.focus();
                  }
                }
              }, UI.SCROLL_DELAY);
            }}
            onForceComplete={() => completeWertung(true)}
            onCancel={() => setWertungValidationError(null)}
          />


          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{selectedWettfahrt.name}</h1>
            <p className="text-gray-600">{selectedRegatta.name}</p>
          </div>

          {/* Zieleinlauf - Main List */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Zieleinlauf ({zielBoats.length})
              </h2>
            </div>

            {/* Quick Search für Zieleinlauf */}
            {zielBoats.length > 0 && (
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="🔍 Boot im Ziel suchen..."
                    value={zieleinlaufSearchQuery}
                    onChange={(e) => setZieleinlaufSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    style={{ minHeight: '48px' }}
                  />
                  {zieleinlaufSearchQuery && (
                    <button
                      onClick={() => setZieleinlaufSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {zielBoats.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">🏁</div>
                <p className="text-gray-500 mb-2">Noch keine Boote im Ziel</p>
                <p className="text-sm text-gray-400">Tippen Sie auf + um Boote hinzuzufügen</p>
              </div>
            ) : filteredZielBoats.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-gray-500 mb-2">Keine Boote gefunden</p>
                <button
                  onClick={() => setZieleinlaufSearchQuery('')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Suche zurücksetzen
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredZielBoats.map((boatId, displayIdx) => {
                  const boat = regattaBoats.find(b => b.id === boatId);
                  if (!boat) return null;

                  // Get ABSOLUTE position in complete list (not filtered)
                  const absoluteIndex = zielBoats.indexOf(boatId);
                  
                  // For medals, only show for top 3 active (non-penalty) boats
                  const activeBoatsBeforeThis = zielBoats
                    .slice(0, absoluteIndex)
                    .filter(id => !boatPenalties[id])
                    .length;
                  const isActiveBoot = !boatPenalties[boatId];
                  const absolutePosition = isActiveBoot ? activeBoatsBeforeThis + 1 : null;
                  
                  const medals = ['🥇', '🥈', '🥉'];
                  const medal = absolutePosition && absolutePosition <= 3 ? medals[absolutePosition - 1] : null;
                  
                  const isPenalty = boatPenalties[boatId];
                  const isEditing = selectedBoatInZiel === boatId;

                  return (
                    <div
                      key={boatId}
                      onClick={() => !isAbgeschlossen && setSelectedBoatInZiel(boatId)}
                      className={`bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border-2 ${
                        isAbgeschlossen 
                          ? 'border-gray-200 cursor-default opacity-75' 
                          : isEditing 
                          ? 'border-gray-200 cursor-default' 
                          : 'border-gray-200 hover:border-blue-400 cursor-pointer'
                      } ${
                        isEditing ? 'ring-4 ring-blue-400' : ''
                      }`}
                      style={{
                        transition: 'border-color 0.15s, background-color 0.15s'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {/* Platzierung */}
                          <div className={`flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0 ${
                            isPenalty 
                              ? 'bg-orange-100 bg-opacity-50 border-2 border-orange-400' 
                              : 'bg-blue-100'
                          }`}>
                            {isPenalty ? (
                              <span className="text-base font-bold text-orange-600">{isPenalty}</span>
                            ) : medal ? (
                              <span className="text-2xl">{medal}</span>
                            ) : (
                              <span className="text-xl font-bold text-blue-700">{absolutePosition}</span>
                            )}
                          </div>

                          {/* Boot Info */}
                          <div className="flex-1 min-w-0">
                            {isEditing ? (
                              <div className="space-y-2">
                                <div className="font-mono text-lg font-bold text-gray-900">
                                  {boat.segelnummer}
                                </div>
                                <select
                                  value={(() => {
                                    // Current state
                                    const currentIndex = zielBoats.indexOf(boatId);
                                    const penalty = boatPenalties[boatId];
                                    
                                    if (penalty) {
                                      return `penalty:${penalty}`;
                                    } else {
                                      return `position:${currentIndex}`;
                                    }
                                  })()}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const [type, val] = value.split(':');
                                    
                                    if (type === 'penalty') {
                                      // Set penalty and move to end
                                      const newPenalties = { ...boatPenalties, [boatId]: val };
                                      setBoatPenalties(newPenalties);
                                      
                                      // Move to end (after all active boats, in penalty order)
                                      const newOrder = zielBoats.filter(id => id !== boatId);
                                      
                                      // Find position: after active boats, sorted by penalty
                                      const penaltyOrder = ['DNF', 'DNS', 'DNC', 'DSQ'];
                                      const penaltyBoats = newOrder.filter(id => boatPenalties[id]);
                                      const activeBoats = newOrder.filter(id => !boatPenalties[id]);
                                      
                                      // Insert in correct penalty position
                                      const insertIndex = activeBoats.length + penaltyBoats.filter(id => {
                                        const otherPenalty = boatPenalties[id];
                                        return penaltyOrder.indexOf(otherPenalty) < penaltyOrder.indexOf(val);
                                      }).length;
                                      
                                      newOrder.splice(insertIndex, 0, boatId);
                                      setZielBoats(newOrder);
                                      
                                      // Autosave
                                      setTimeout(() => autoSaveZielerfassung(newOrder, newPenalties), 100);
                                      
                                    } else if (type === 'position') {
                                      // Clear penalty and move to position
                                      const newPenalties = { ...boatPenalties };
                                      delete newPenalties[boatId];
                                      setBoatPenalties(newPenalties);
                                      
                                      // Move to new position
                                      const targetIndex = parseInt(val);
                                      const newOrder = zielBoats.filter(id => id !== boatId);
                                      newOrder.splice(targetIndex, 0, boatId);
                                      setZielBoats(newOrder);
                                      
                                      // Autosave
                                      setTimeout(() => autoSaveZielerfassung(newOrder, newPenalties), 100);
                                    }
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                                  style={{ minHeight: '40px' }}
                                >
                                  <optgroup label="Platzierungen">
                                    {(() => {
                                      const isPenaltyBoat = boatPenalties[boatId];
                                      const activeBoats = zielBoats.filter(id => !boatPenalties[id]);
                                      const maxPosition = isPenaltyBoat ? activeBoats.length + 1 : activeBoats.length;
                                      
                                      return Array.from({ length: maxPosition }, (_, i) => (
                                        <option key={i} value={`position:${i}`}>
                                          Platz {i + 1}
                                        </option>
                                      ));
                                    })()}
                                  </optgroup>
                                  <optgroup label="Penalty Codes">
                                    <option value="penalty:DNF">DNF - Did Not Finish</option>
                                    <option value="penalty:DNS">DNS - Did Not Start</option>
                                    <option value="penalty:DNC">DNC - Did Not Compete</option>
                                    <option value="penalty:DSQ">DSQ - Disqualified</option>
                                  </optgroup>
                                </select>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedBoatInZiel(null);
                                  }}
                                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                                  style={{ minHeight: '40px' }}
                                >
                                  Fertig
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="font-mono text-lg font-bold text-gray-900">
                                  {boat.segelnummer}
                                </div>
                                {boat.steuermann && (
                                  <div className="text-sm text-gray-600 truncate">{boat.steuermann}</div>
                                )}
                                {boat.verein && (
                                  <div className="text-xs text-gray-500 truncate">{boat.verein}</div>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Remove Button */}
                        {!isEditing && !isAbgeschlossen && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Remove button clicked for boat:', boatId, boat.segelnummer);
                              removeBoatFromZiel(boatId);
                            }}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center flex-shrink-0"
                            style={{ minWidth: '44px', minHeight: '44px' }}
                            title="Entfernen"
                          >
                            <X size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Noch nicht im Ziel - Collapsed */}
          <div className="bg-white rounded-xl shadow-sm" id="verfuegbare-boote-section">
            <button
              onClick={() => setShowVerfuegbareBoats(!showVerfuegbareBoats)}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors rounded-xl"
              style={{ minHeight: '60px' }}
            >
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-700">
                  Noch nicht im Ziel ({verfuegbareBoats.length})
                </h3>
              </div>
              <ChevronLeft 
                size={24} 
                className={`text-gray-400 transition-transform ${showVerfuegbareBoats ? 'rotate-90' : '-rotate-90'}`}
              />
            </button>

            {showVerfuegbareBoats && (
              <div className="px-5 pb-5">
                <div className="border-t border-gray-200 pt-4">
                  {/* Quick Search für verfügbare Boote */}
                  <div className="mb-4">
                    <div className="relative">
                      <input
                        id="verfuegbare-boote-search"
                        type="text"
                        placeholder="🔍 Boot suchen (Segelnummer, Steuermann, Verein)..."
                        value={zielSearchQuery}
                        onChange={(e) => setZielSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        style={{ minHeight: '48px' }}
                        autoFocus
                      />
                      {zielSearchQuery && (
                        <button
                          onClick={() => setZielSearchQuery('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  </div>

                  {filteredVerfuegbare.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {zielSearchQuery ? 'Keine Boote gefunden' : 'Alle Boote wurden erfasst'}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredVerfuegbare.map(boat => (
                        <button
                          key={boat.id}
                          onClick={() => {
                            addBoatToZiel(boat.id);
                            setZielSearchQuery('');
                          }}
                          className="w-full text-left p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                          style={{ minHeight: '60px' }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="font-mono text-base font-semibold text-gray-900">
                              {boat.segelnummer}
                            </div>
                            <div className="text-sm text-gray-600 flex-1">
                              {boat.steuermann && <span>{boat.steuermann}</span>}
                              {boat.steuermann && boat.verein && <span> • </span>}
                              {boat.verein && <span>{boat.verein}</span>}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* FAB - Floating Action Button (nur wenn offen) */}
          {!isAbgeschlossen && (
            <button
              onClick={() => setShowVerfuegbareBoats(!showVerfuegbareBoats)}
              className="fixed bottom-20 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 hover:shadow-2xl transition-all flex items-center justify-center z-40 active:scale-95"
              style={{ minWidth: '56px', minHeight: '56px' }}
            >
              {showVerfuegbareBoats ? <X size={24} /> : <Plus size={28} />}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderErgebnisse = () => {
    const wettfahrtErgebnisse = ergebnisse
      .filter(e => e.wettfahrtId === selectedWettfahrt.id)
      .sort((a, b) => a.platz - b.platz);

    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => setCurrentView('wettfahrtenOverview')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ChevronLeft size={20} />
            Zurück
          </button>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{selectedWettfahrt.name}</h1>
            <p className="text-gray-600">{selectedRegatta.name}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Ergebnisse</h2>
              <button
                onClick={() => startZielerfassung(selectedWettfahrt)}
                className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <Edit2 size={18} />
                Bearbeiten
              </button>
            </div>

            {wettfahrtErgebnisse.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Keine Ergebnisse vorhanden
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Platz</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Segelnummer</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Steuermann</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Verein</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wettfahrtErgebnisse.map((ergebnis) => {
                      const boat = boats.find(b => b.id === ergebnis.bootId);
                      if (!boat) return null;
                      
                      return (
                        <tr
                          key={ergebnis.id}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <span className="text-lg font-bold text-gray-900">
                              {ergebnis.penalty || `${ergebnis.platz}.`}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-lg font-semibold text-gray-900">
                            {boat.segelnummer}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {boat.steuermann || '-'}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {boat.verein || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Custom Confirm Dialog Component
  const ConfirmDialog = () => {
    if (!confirmDialog.show) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Bestätigung</h3>
          <p className="text-gray-700 mb-6">{confirmDialog.message}</p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setConfirmDialog({ show: false, message: '', onConfirm: null })}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Abbrechen
            </button>
            <button
              onClick={confirmDialog.onConfirm}
              className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Löschen
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Bottom Navigation Component
  const BottomNav = () => {
    const navItems = [
      { id: 'organisation', icon: Edit2, label: 'Organisation', views: ['overview', 'createRegatta', 'editRegatta', 'regattaDetail', 'editBoat'] },
      { id: 'wertung', icon: Trophy, label: 'Wertung', views: ['wertung', 'wettfahrtenOverview', 'editWettfahrt', 'zielerfassung', 'ergebnisseView'] },
    ];

    // Bestimme aktiven Tab basierend auf currentView
    const activeItem = navItems.find(item => item.views.includes(currentView)) || navItems[0];

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
        <div className="flex justify-around items-center" style={{ height: '64px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem.id === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNavItem(item.id);
                  if (item.id === 'organisation') {
                    setCurrentView('overview');
                  } else if (item.id === 'wertung') {
                    setCurrentView('wertung');
                  }
                }}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
                }`}
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className="mb-1" />
                <span className={`text-xs ${isActive ? 'font-semibold' : 'font-normal'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 rounded-b"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Main Render
  return (
    <div className="font-sans">
      <ConfirmDialog />
      <PullToRefreshIndicator />
      {/* Content Wrapper mit Bottom Padding für Bottom Nav */}
      <div className="pb-16">
        {currentView === 'overview' && renderOverview()}
        {currentView === 'createRegatta' && renderRegattaForm(false)}
        {currentView === 'editRegatta' && renderRegattaForm(true)}
        {currentView === 'regattaDetail' && renderRegattaDetail()}
        {currentView === 'editBoat' && renderEditBoat()}
        {currentView === 'wertung' && renderWertungOverview()}
        {currentView === 'wettfahrtenOverview' && renderWettfahrtenOverview()}
        {currentView === 'editWettfahrt' && renderEditWettfahrt()}
        {currentView === 'zielerfassung' && renderZielerfassung()}
        {currentView === 'ergebnisseView' && renderErgebnisse()}
      </div>
      {/* Bottom Navigation (nur Mobile) */}
      <BottomNav />
    </div>
  );
}
