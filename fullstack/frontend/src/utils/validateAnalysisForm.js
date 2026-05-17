/**
 * Validates the analysis form data.
 *
 * @param {object} formData - The form data to validate
 * @param {string} formData.method - Selected method ('MVEP', 'SIM', 'CAF')
 * @param {string} formData.targetIndex - Selected index ('LQ45', 'IDX30', 'JII')
 * @param {string} formData.periodStart - Start date (ISO date string)
 * @param {string} formData.periodEnd - End date (ISO date string)
 * @param {number} formData.capitalAllocation - Capital amount in Rp
 * @returns {{ isValid: boolean, errors: object }} Validation result with field-specific errors
 */

const VALID_METHODS = ['MVEP', 'SIM', 'CAF'];
const VALID_INDICES = ['LQ45', 'IDX30'];
const CAPITAL_MIN = 1;
const CAPITAL_MAX = 999_999_999_999;

export function validateAnalysisForm(formData) {
  const errors = {};

  // Method validation
  if (!formData.method || !VALID_METHODS.includes(formData.method)) {
    errors.method = 'Please select a method';
  }

  // Target Index validation
  if (!formData.targetIndex || !VALID_INDICES.includes(formData.targetIndex)) {
    errors.targetIndex = 'Please select a target index';
  }

  // Period Start validation
  if (!formData.periodStart) {
    errors.periodStart = 'Please select a start date';
  }

  // Period End validation
  if (!formData.periodEnd) {
    errors.periodEnd = 'End date must be on or after start date';
  } else if (formData.periodStart && formData.periodEnd < formData.periodStart) {
    errors.periodEnd = 'End date must be on or after start date';
  }

  // Capital Allocation validation
  const capital = Number(formData.capitalAllocation);
  if (
    formData.capitalAllocation === undefined ||
    formData.capitalAllocation === null ||
    formData.capitalAllocation === '' ||
    isNaN(capital) ||
    capital < CAPITAL_MIN ||
    capital > CAPITAL_MAX
  ) {
    errors.capitalAllocation = 'Capital must be between Rp 1 and Rp 999,999,999,999';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
