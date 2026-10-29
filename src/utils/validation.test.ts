import test from 'node:test';
import assert from 'node:assert/strict';
import { validateOrderInput, formatLabelDate } from './validation.ts';

test('validates correct order inputs with complete fields', () => {
  const result = validateOrderInput({
    customerPoNumber: 'PO-ARAMCO-2026-99',
    expiryDate: '2028-12-31',
    batchNumber: 'MN-CLN-2610-A',
  });
  assert.equal(result.isValid, true);
  assert.equal(Object.keys(result.errors).length, 0);
});

test('catches missing customer PO number', () => {
  const result = validateOrderInput({
    customerPoNumber: '',
    expiryDate: '2028-12-31',
    batchNumber: 'MN-CLN-2610-A',
  });
  assert.equal(result.isValid, false);
  assert.ok(result.errors.customerPoNumber);
});

test('catches missing batch number', () => {
  const result = validateOrderInput({
    customerPoNumber: 'PO-1234',
    expiryDate: '2028-12-31',
    batchNumber: '',
  });
  assert.equal(result.isValid, false);
  assert.ok(result.errors.batchNumber);
});

test('catches invalid date format', () => {
  const result = validateOrderInput({
    customerPoNumber: 'PO-1234',
    expiryDate: 'not-a-date',
    batchNumber: 'B-99',
  });
  assert.equal(result.isValid, false);
  assert.ok(result.errors.expiryDate);
});

test('formats dates correctly according to user format configuration', () => {
  const input = '2027-05-18';
  assert.equal(formatLabelDate(input, 'DD/MM/YYYY'), '18/05/2027');
  assert.equal(formatLabelDate(input, 'DD-MMM-YYYY'), '18-MAY-2027');
  assert.equal(formatLabelDate(input, 'YYYY-MM-DD'), '2027-05-18');
});
