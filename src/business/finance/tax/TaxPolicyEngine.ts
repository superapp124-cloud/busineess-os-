/**
 * CHATR Tax Policy Engine (Phase 5)
 * Determines applicable GST (CGST/SGST/IGST), TDS withholding, and VAT rules.
 */

export interface TaxCalculationResult {
  taxable_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  tds_amount: number;
  total_tax: number;
  gross_amount: number;
}

export class TaxPolicyEngine {
  /**
   * Determines GST lines based on supplier and customer state/jurisdiction
   */
  public static calculateGST(
    taxableAmount: number,
    ratePct: number,
    supplierState: string,
    customerState: string,
    tdsSection?: '194C' | '194J'
  ): TaxCalculationResult {
    const isIntraState = supplierState.trim().toUpperCase() === customerState.trim().toUpperCase();
    let cgst = 0, sgst = 0, igst = 0, tds = 0;

    const totalGstRate = ratePct / 100;
    const totalGst = Math.round(taxableAmount * totalGstRate * 100) / 100;

    if (isIntraState) {
      cgst = Math.round((totalGst / 2) * 100) / 100;
      sgst = Math.round((totalGst - cgst) * 100) / 100;
    } else {
      igst = totalGst;
    }

    if (tdsSection === '194J') {
      // 10% TDS on professional/technical services
      tds = Math.round(taxableAmount * 0.10 * 100) / 100;
    } else if (tdsSection === '194C') {
      // 2% TDS on contractor payments
      tds = Math.round(taxableAmount * 0.02 * 100) / 100;
    }

    return {
      taxable_amount: taxableAmount,
      cgst_amount: cgst,
      sgst_amount: sgst,
      igst_amount: igst,
      tds_amount: tds,
      total_tax: totalGst,
      gross_amount: Math.round((taxableAmount + totalGst - tds) * 100) / 100,
    };
  }
}
