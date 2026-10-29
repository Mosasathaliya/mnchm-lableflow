/**
 * Validation utilities for MNChem Label Studio order entry and templates
 */

export interface OrderValidationInput {
  customerPoNumber: string;
  expiryDate: string;
  batchNumber: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

/**
 * Validates the required order-generation fields
 */
export function validateOrderInput(input: OrderValidationInput): ValidationResult {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  // 1. Customer PO Number
  const trimmedPo = (input.customerPoNumber || '').trim();
  if (!trimmedPo) {
    errors.customerPoNumber = 'Customer PO Number is required.';
  } else if (trimmedPo.length < 2) {
    errors.customerPoNumber = 'PO Number must be at least 2 characters.';
  } else if (trimmedPo.length > 40) {
    warnings.customerPoNumber = 'PO Number exceeds recommended 40 characters and may downscale or wrap on the printed label.';
  }

  // 2. Expiry Date
  const trimmedExpiry = (input.expiryDate || '').trim();
  if (!trimmedExpiry) {
    errors.expiryDate = 'Expiry Date is required.';
  } else {
    const parsedDate = new Date(trimmedExpiry);
    if (isNaN(parsedDate.getTime())) {
      errors.expiryDate = 'Expiry Date must be a valid calendar date.';
    } else {
      // Optional safety check: Expiry date should typically be in the future for chemical shipments
      const now = new Date();
      // Reset hours to start of day for comparison
      now.setHours(0, 0, 0, 0);
      if (parsedDate < now) {
        warnings.expiryDate = 'Warning: Expiry date is in the past. Verify packaging specifications before finalization.';
      }
    }
  }

  // 3. Batch Number
  const trimmedBatch = (input.batchNumber || '').trim();
  if (!trimmedBatch) {
    errors.batchNumber = 'Batch Number is required.';
  } else if (trimmedBatch.length < 2) {
    errors.batchNumber = 'Batch Number must be at least 2 characters.';
  } else if (trimmedBatch.length > 35) {
    warnings.batchNumber = 'Batch Number is longer than 35 characters. Ensure it fits in the designated batch field.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
}

/**
 * Formats a date string (YYYY-MM-DD) according to user preferences
 */
export function formatLabelDate(dateStr: string, format: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'DD-MMM-YYYY' = 'DD/MM/YYYY'): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];

  if (format === 'DD/MM/YYYY') {
    return `${day}/${month}/${year}`;
  }

  if (format === 'DD-MMM-YYYY') {
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const monthIndex = parseInt(month, 10) - 1;
    const mName = monthNames[monthIndex] || month;
    return `${day}-${mName}-${year}`;
  }

  return dateStr;
}

/**
 * Generates an internal order identifier
 */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${year}-${randomSuffix}`;
}
