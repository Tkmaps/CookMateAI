// Utility functions for AI Assistant
export const formatResponse = (response) => {
  // Add any formatting logic here
  return response;
};

export const sanitizePrompt = (prompt) => {
  // Add any input sanitization logic here
  return prompt.trim();
};

export const validateResponse = (response) => {
  // Add validation logic here
  return response && typeof response === 'string';
};
