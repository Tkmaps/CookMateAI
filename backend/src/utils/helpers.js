const crypto = require('crypto');
const { promisify } = require('util');

// Time utilities
const timeUtils = {
  // Convert seconds to human readable format
  formatDuration: (seconds) => {
    if (!seconds || seconds < 0) return '0 seconds';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
    if (remainingSeconds > 0 || parts.length === 0) {
      parts.push(`${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`);
    }
    
    return parts.join(', ');
  },

  // Get time ago string
  timeAgo: (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return new Date(date).toLocaleDateString();
  },

  // Check if date is today
  isToday: (date) => {
    const today = new Date();
    const checkDate = new Date(date);
    return today.toDateString() === checkDate.toDateString();
  }
};

// String utilities
const stringUtils = {
  // Capitalize first letter
  capitalize: (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  // Convert to title case
  toTitleCase: (str) => {
    if (!str) return '';
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  },

  // Truncate string with ellipsis
  truncate: (str, length = 100) => {
    if (!str || str.length <= length) return str;
    return str.substring(0, length).trim() + '...';
  },

  // Generate random string
  randomString: (length = 10) => {
    return crypto.randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  },

  // Slugify string
  slugify: (str) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
};

// Array utilities
const arrayUtils = {
  // Remove duplicates from array
  unique: (arr) => [...new Set(arr)],

  // Chunk array into smaller arrays
  chunk: (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  },

  // Shuffle array
  shuffle: (arr) => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  // Get random item from array
  randomItem: (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
  }
};

// Object utilities
const objectUtils = {
  // Deep clone object
  deepClone: (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => objectUtils.deepClone(item));
    
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = objectUtils.deepClone(obj[key]);
      }
    }
    return cloned;
  },

  // Pick specific keys from object
  pick: (obj, keys) => {
    const picked = {};
    keys.forEach(key => {
      if (key in obj) picked[key] = obj[key];
    });
    return picked;
  },

  // Omit specific keys from object
  omit: (obj, keys) => {
    const omitted = { ...obj };
    keys.forEach(key => delete omitted[key]);
    return omitted;
  },

  // Check if object is empty
  isEmpty: (obj) => {
    return Object.keys(obj).length === 0;
  }
};

// Validation utilities
const validationUtils = {
  // Check if valid email
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Check if valid UUID
  isValidUUID: (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  // Check if valid URL
  isValidURL: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Sanitize HTML
  sanitizeHTML: (str) => {
    return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/<[^>]*>/g, '');
  }
};

// Async utilities
const asyncUtils = {
  // Sleep/delay function
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Retry function with exponential backoff
  retry: async (fn, maxRetries = 3, baseDelay = 1000) => {
    let lastError;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (i === maxRetries) break;
        
        const delay = baseDelay * Math.pow(2, i);
        await asyncUtils.sleep(delay);
      }
    }
    
    throw lastError;
  },

  // Timeout wrapper
  timeout: (promise, ms) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Operation timed out')), ms)
      )
    ]);
  }
};

// Cooking-specific utilities
const cookingUtils = {
  // Convert cooking time to minutes
  parseTime: (timeStr) => {
    if (!timeStr) return 0;
    
    const hourMatch = timeStr.match(/(\d+)\s*h/i);
    const minuteMatch = timeStr.match(/(\d+)\s*m/i);
    const secondMatch = timeStr.match(/(\d+)\s*s/i);
    
    let totalMinutes = 0;
    if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60;
    if (minuteMatch) totalMinutes += parseInt(minuteMatch[1]);
    if (secondMatch) totalMinutes += Math.ceil(parseInt(secondMatch[1]) / 60);
    
    return totalMinutes;
  },

  // Format cooking time
  formatCookingTime: (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) return `${hours} hr`;
    return `${hours} hr ${remainingMinutes} min`;
  },

  // Calculate difficulty score
  calculateDifficulty: (factors) => {
    const {
      steps = 0,
      techniques = [],
      cookingTime = 0,
      ingredients = 0,
      equipment = []
    } = factors;
    
    let score = 0;
    
    // Base score from steps
    score += Math.min(steps * 2, 20);
    
    // Technique complexity
    const complexTechniques = ['braise', 'confit', 'sous-vide', 'flambé', 'tempering'];
    score += techniques.filter(t => complexTechniques.includes(t.toLowerCase())).length * 5;
    
    // Time factor
    if (cookingTime > 180) score += 10; // 3+ hours
    else if (cookingTime > 60) score += 5; // 1+ hours
    
    // Ingredient count
    if (ingredients > 15) score += 10;
    else if (ingredients > 10) score += 5;
    
    // Equipment complexity
    const complexEquipment = ['stand mixer', 'food processor', 'immersion blender', 'thermometer'];
    score += equipment.filter(e => complexEquipment.some(ce => e.toLowerCase().includes(ce))).length * 3;
    
    // Normalize to 1-5 scale
    if (score <= 10) return 1; // Easy
    if (score <= 25) return 2; // Medium-Easy
    if (score <= 40) return 3; // Medium
    if (score <= 60) return 4; // Medium-Hard
    return 5; // Hard
  }
};

// Error utilities
const errorUtils = {
  // Create standardized error response
  createErrorResponse: (message, statusCode = 500, details = null) => {
    return {
      status: 'error',
      message,
      statusCode,
      details,
      timestamp: new Date().toISOString()
    };
  },

  // Check if error is operational (expected)
  isOperationalError: (error) => {
    return error.isOperational === true;
  }
};

module.exports = {
  timeUtils,
  stringUtils,
  arrayUtils,
  objectUtils,
  validationUtils,
  asyncUtils,
  cookingUtils,
  errorUtils
};