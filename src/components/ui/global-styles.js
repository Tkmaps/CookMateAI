/**
 * Global style utilities for use throughout the app
 */

export const gradients = {
  primary: {
    colors: ["#14b8a6", "#0f766e"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 }
  },
  secondary: {
    colors: ["#4f46e5", "#3730a3"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 }
  },
  success: {
    colors: ["#22c55e", "#15803d"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 }
  },
  danger: {
    colors: ["#ef4444", "#b91c1c"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 }
  },
  warning: {
    colors: ["#f59e0b", "#b45309"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 }
  },
  info: {
    colors: ["#3b82f6", "#1d4ed8"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 }
  },
};

export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12, 
  xl: 16,
  round: 999,
}; 