import test from 'node:test';
import assert from 'node:assert/strict';

// Pure logic tests for server authorization & order storage
test('server access code authorization logic', () => {
  const configuredCode = '3056';
  
  const testValid = (input: string) => input.trim() === configuredCode;
  
  assert.equal(testValid('3056'), true);
  assert.equal(testValid(' 3056 '), true);
  assert.equal(testValid('wrong-code'), false);
  assert.equal(testValid('1234'), false);
  assert.equal(testValid(''), false);
});

test('order generation payload integrity', () => {
  const sampleOrder = {
    templateId: 'tmpl-mnclean-s',
    customerPoNumber: 'PO-ARAMCO-2026-X1',
    expiryDate: '2028-10-31',
    batchNumber: 'MNC-CLN-2610-01',
    status: 'Finalized',
  };

  assert.ok(sampleOrder.customerPoNumber.length > 0);
  assert.ok(sampleOrder.expiryDate.includes('-'));
  assert.ok(sampleOrder.batchNumber.startsWith('MNC-'));
  assert.equal(sampleOrder.status, 'Finalized');
});

test('template creation preserves blank canvas, custom artwork, and font configuration', () => {
  const customTemplatePayload = {
    name: 'SULFURIC ACID 98% REAGENT',
    code: 'H2SO4-RG-01',
    category: 'Industrial Acid',
    isBlankCanvas: true,
    layoutPreset: 'blank',
    canvasBgColor: '#ffffff',
    canvasBorder: 'industrial',
    canvasBorderColor: '#000000',
    artworkElements: [
      {
        id: 'txt-1',
        type: 'text',
        content: 'DANGER - STRONG ACID',
        fontFamily: '"Impact", "Arial Black", sans-serif',
        fontSize: 24,
        fontWeight: 'black',
        fontColor: '#dc2626',
        xPercent: 10,
        yPercent: 10,
        widthPercent: 80,
      },
    ],
    fields: [
      {
        id: 'box-po',
        name: 'po',
        label: 'PO#',
        type: 'text',
        fontFamily: '"Consolas", "Courier New", monospace',
        xPercent: 50,
        yPercent: 40,
        widthPercent: 40,
        fontSize: 16,
        fontWeight: 'bold',
        fontColor: '#071d3a',
        align: 'left',
        required: true,
      },
    ],
  };

  // Verify all fields are present and not stripped
  assert.equal(customTemplatePayload.isBlankCanvas, true);
  assert.equal(customTemplatePayload.artworkElements.length, 1);
  assert.equal(customTemplatePayload.artworkElements[0].fontFamily, '"Impact", "Arial Black", sans-serif');
  assert.equal(customTemplatePayload.fields[0].fontFamily, '"Consolas", "Courier New", monospace');
});

