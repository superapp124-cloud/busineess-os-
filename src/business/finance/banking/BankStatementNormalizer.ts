/**
 * CHATR Bank Statement Normalizer (Phase 4)
 * Parses bank CSV exports into canonical CHATR bank transactions.
 */

export interface NormalizedBankTransaction {
  transaction_date: string;
  value_date?: string;
  amount: number;
  transaction_type: 'CREDIT' | 'DEBIT';
  currency: string;
  description: string;
  reference_number?: string;
  payee_payer?: string;
  running_balance?: number;
}

export class BankStatementNormalizer {
  /**
   * Parses standard CSV rows into canonical NormalizedBankTransaction records
   */
  public static parseCSV(csvContent: string, defaultCurrency: string = 'INR'): NormalizedBankTransaction[] {
    const lines = csvContent
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length <= 1) return [];

    const header = lines[0].toLowerCase();
    const rows = lines.slice(1);
    const transactions: NormalizedBankTransaction[] = [];

    rows.forEach(row => {
      // Basic CSV splitter respecting simple commas
      const cols = row.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length < 3) return;

      let date = '';
      let desc = '';
      let ref = '';
      let debit = 0;
      let credit = 0;
      let balance: number | undefined;

      // Handle common formats: [Date, Description, Ref, Debit, Credit, Balance]
      // Or [Date, Description, Amount, Type]
      if (header.includes('debit') && header.includes('credit')) {
        date = cols[0];
        desc = cols[1];
        ref = cols[2] || '';
        debit = parseFloat(cols[3].replace(/[^0-9.-]/g, '')) || 0;
        credit = parseFloat(cols[4].replace(/[^0-9.-]/g, '')) || 0;
        if (cols[5]) balance = parseFloat(cols[5].replace(/[^0-9.-]/g, ''));
      } else {
        date = cols[0];
        desc = cols[1];
        const rawAmt = parseFloat(cols[2].replace(/[^0-9.-]/g, '')) || 0;
        if (rawAmt < 0 || (cols[3] && cols[3].toUpperCase() === 'DR')) {
          debit = Math.abs(rawAmt);
        } else {
          credit = Math.abs(rawAmt);
        }
      }

      const isCredit = credit > 0;
      const amount = isCredit ? credit : debit;
      if (amount <= 0) return;

      // Normalize date string (YYYY-MM-DD)
      let normDate = date;
      if (date.includes('/')) {
        const parts = date.split('/');
        if (parts.length === 3) {
          // Check DD/MM/YYYY vs MM/DD/YYYY
          normDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }

      // Extract payee/payer from narrative
      let payee: string | undefined;
      const upeerDesc = desc.toUpperCase();
      if (upeerDesc.includes('FROM ') || upeerDesc.includes('BY ')) {
        const match = desc.match(/(?:FROM|BY)\s+([A-Za-z0-9\s]+)/i);
        if (match) payee = match[1].trim();
      } else if (upeerDesc.includes('TO ')) {
        const match = desc.match(/TO\s+([A-Za-z0-9\s]+)/i);
        if (match) payee = match[1].trim();
      }

      transactions.push({
        transaction_date: normDate,
        amount: Math.round(amount * 100) / 100,
        transaction_type: isCredit ? 'CREDIT' : 'DEBIT',
        currency: defaultCurrency,
        description: desc,
        reference_number: ref || undefined,
        payee_payer: payee,
        running_balance: balance,
      });
    });

    return transactions;
  }
}
