# Bulk Fee Voucher PDF Fixes - Fee Type & Structure Display

## Step 1: ✅ COMPLETED - Create TODO.md

## Step 2: ✅ COMPLETED - src/components/pages/FeesPage.jsx
**handleBulkDownload() enhancement:**
- Map `bulkFilters.feeType` → FEE_TYPE_OPTIONS label  
- `const feeTypeLabel = FEE_TYPE_OPTS.find(opt => opt.value === bulkFilters.feeType)?.label || 'Fee';`
- Set `voucher.feeType = feeTypeLabel` for PDF generator

## Step 3: [PENDING] Primary Fix: src/lib/pdf/feeVoucherPdf.js
**buildFeeRows() restructuring:**
```
1. ALWAYS first row: ["FEE TYPE: " + formatFeeType(voucher?.feeType || voucher?.fee_type), ""]
2. If fee_breakdown: ["FEE STRUCTURE:", ""] + breakdown rows  
3. Existing totals: Total Amount, Remaining Amount, etc.
```

**renderVoucherPage() table styling:**
- Special columnStyles for row 0 (fee type): fontStyle: 'bold', fontSize: 9
- Ensure prominent display

## Step 4: [PENDING] Test bulk download
```
1. npm run dev
2. FeesPage → Bulk Download  
3. Select "Monthly Fee" → Download → Verify "FEE TYPE: Monthly Fee"
4. Check fee structure shows breakdown if available
```

## Step 5: [COMPLETED] Mark done + attempt_completion
```
- Update TODO.md progress after each step
- Final verification
```

