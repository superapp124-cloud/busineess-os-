/**
 * CHATR Revenue Intelligence Engine (Phase 3)
 * ASC 606 / IFRS 15 5-Step Revenue Recognition Engine:
 * 1. Identify contract
 * 2. Identify performance obligations (POBs)
 * 3. Determine transaction price
 * 4. Allocate transaction price across POBs based on Standalone Selling Price (SSP)
 * 5. Recognize revenue as obligations are satisfied (Straight-line, Milestone, Point-in-time)
 */

import { JournalProposal } from '../subledgers/ARSubledger';

export interface PerformanceObligationInput {
  title: string;
  standalone_selling_price: number;
  recognition_method: 'STRAIGHT_LINE' | 'MILESTONE' | 'POINT_IN_TIME';
  start_date: string;
  end_date: string;
  revenue_account_id: string;
  deferred_rev_account_id: string;
  milestone_condition?: string;
}

export interface AllocatedObligation extends PerformanceObligationInput {
  allocated_price: number;
  allocation_ratio: number;
}

export interface ScheduledMonth {
  schedule_number: number;
  scheduled_date: string;
  scheduled_amount: number;
  currency: string;
  obligation_title: string;
}

export class RevenueEngine {
  /**
   * Step 4: Allocates total contract transaction price across POBs based on relative Standalone Selling Prices (SSP)
   */
  public static allocateTransactionPrice(
    transactionPrice: number,
    obligations: PerformanceObligationInput[]
  ): AllocatedObligation[] {
    const totalSSP = obligations.reduce((s, o) => s + o.standalone_selling_price, 0);
    if (totalSSP <= 0) {
      throw new Error('Total Standalone Selling Price must be greater than 0');
    }

    let allocatedSum = 0;

    const allocated = obligations.map((ob, idx) => {
      const ratio = ob.standalone_selling_price / totalSSP;
      let price = Math.round(transactionPrice * ratio * 100) / 100;

      // Ensure last item absorbs any 1-cent rounding difference
      if (idx === obligations.length - 1) {
        price = Math.round((transactionPrice - allocatedSum) * 100) / 100;
      } else {
        allocatedSum += price;
      }

      return {
        ...ob,
        allocated_price: price,
        allocation_ratio: ratio,
      };
    });

    return allocated;
  }

  /**
   * Step 5: Generates period-by-period straight-line revenue recognition schedule
   */
  public static generateStraightLineSchedule(
    allocatedPrice: number,
    startDate: string,
    endDate: string,
    currency: string = 'INR',
    obligationTitle: string = 'Service'
  ): ScheduledMonth[] {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const months = Math.max(
      1,
      (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1
    );

    const monthlyAmount = Math.floor((allocatedPrice / months) * 100) / 100;
    const baseSum = Math.round(monthlyAmount * (months - 1) * 100) / 100;
    const finalMonthAmount = Math.round((allocatedPrice - baseSum) * 100) / 100;

    const schedule: ScheduledMonth[] = [];
    const curDate = new Date(start);

    for (let i = 1; i <= months; i++) {
      const amount = i === months ? finalMonthAmount : monthlyAmount;
      const dateStr = curDate.toISOString().substring(0, 10);

      schedule.push({
        schedule_number: i,
        scheduled_date: dateStr,
        scheduled_amount: amount,
        currency,
        obligation_title: obligationTitle,
      });

      curDate.setMonth(curDate.getMonth() + 1);
    }

    return schedule;
  }

  /**
   * Generates a balanced double-entry journal proposal to release deferred revenue into recognized revenue
   *
   * Accounting Treatment:
   * Dr Deferred Revenue (Liability decreases)
   *   Cr Revenue (Income increases)
   */
  public static proposeRevenueRecognitionJournal(
    contractNumber: string,
    obligationTitle: string,
    amount: number,
    currency: string,
    fxRate: number,
    postingDate: string,
    deferredRevAccountId: string,
    revenueAccountId: string
  ): JournalProposal {
    const funcAmount = Math.round(amount * fxRate * 100) / 100;

    return {
      memo: `ASC 606 Revenue Recognition for ${contractNumber} - ${obligationTitle}`,
      source_type: 'REVENUE_RECOGNITION',
      source_id: contractNumber,
      posting_date: postingDate,
      transaction_currency: currency,
      functional_currency: 'INR',
      fx_rate: fxRate,
      lines: [
        {
          account_id: deferredRevAccountId,
          debit_amount: amount,
          credit_amount: 0,
          currency,
          functional_debit: funcAmount,
          functional_credit: 0,
          memo: `Deferred revenue released: ${obligationTitle}`,
        },
        {
          account_id: revenueAccountId,
          debit_amount: 0,
          credit_amount: amount,
          currency,
          functional_debit: 0,
          functional_credit: funcAmount,
          memo: `Revenue earned: ${obligationTitle}`,
        },
      ],
    };
  }
}
