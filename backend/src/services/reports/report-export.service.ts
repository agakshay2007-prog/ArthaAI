import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { ComprehensiveFinancialReport } from '../../types/index.js';

export class ReportExportService {
  /**
   * Sanitize string value against formula injection attacks in spreadsheets
   */
  public static sanitizeFormulaInjection(value: unknown): string {
    if (value === null || value === undefined) return '';
    const str = String(value).trim();
    if (/^[=+\-@\t\r]/.test(str)) {
      return `'${str}`;
    }
    return str;
  }

  /**
   * Escape and quote field for RFC 4180 CSV
   */
  public static escapeCsvField(value: unknown): string {
    if (value === null || value === undefined) return '';
    const sanitized = this.sanitizeFormulaInjection(value);
    if (sanitized.includes(',') || sanitized.includes('"') || sanitized.includes('\n')) {
      return `"${sanitized.replace(/"/g, '""')}"`;
    }
    return sanitized;
  }

  /**
   * Generate CSV export for a comprehensive financial report
   */
  public static generateCsv(report: ComprehensiveFinancialReport): string {
    const lines: string[] = [];

    // Header Metadata
    lines.push(
      `"ArthaAI Personal Financial Report - ${this.escapeCsvField(report.period.label)}"`
    );
    lines.push(`"Generated At","${report.period.generatedAt}","Currency","${report.period.currency}"`);
    lines.push(`"Date Range","${report.period.startDate} to ${report.period.endDate}"`);
    lines.push('');

    // Section 1: Executive Summary
    lines.push('"EXECUTIVE SUMMARY"');
    lines.push('"Metric","Value"');
    lines.push(`"Total Income","$${report.summary.totalIncome.toFixed(2)}"`);
    lines.push(`"Total Expenses","$${report.summary.totalExpenses.toFixed(2)}"`);
    lines.push(`"Net Cash Flow","$${report.summary.netCashFlow.toFixed(2)}"`);
    lines.push(`"Savings Rate","${report.summary.savingsRatePercentage.toFixed(1)}%"`);
    lines.push(`"Transaction Count","${report.summary.transactionCount}"`);
    lines.push(
      `"Highest Spending Category","${this.escapeCsvField(
        report.summary.highestSpendingCategory?.category || 'None'
      )} ($${report.summary.highestSpendingCategory?.amount.toFixed(2) || '0.00'})"`
    );
    lines.push(
      `"Budget Utilization","${report.summary.budgetUtilization.utilizationPercentage}% (${report.summary.budgetUtilization.exceededCount} exceeded)"`
    );
    lines.push(`"Net Worth Status","${this.escapeCsvField(report.summary.netWorthNote)}"`);
    lines.push('');

    // Section 2: Category Breakdown
    lines.push('"CATEGORY BREAKDOWN"');
    lines.push('"Category","Total Amount ($)","Percentage (%)","Transactions","Prior Period ($)","Change (%)"');
    for (const cat of report.categories) {
      lines.push(
        [
          this.escapeCsvField(cat.category),
          cat.amount.toFixed(2),
          cat.percentage.toFixed(1),
          cat.transactionCount,
          cat.previousAmount !== undefined ? cat.previousAmount.toFixed(2) : '0.00',
          cat.changePercentage !== undefined ? `${cat.changePercentage}%` : 'N/A',
        ].join(',')
      );
    }
    lines.push('');

    // Section 3: Budget Performance
    lines.push('"BUDGET PERFORMANCE"');
    lines.push('"Budget Name","Category","Limit ($)","Spent ($)","Remaining ($)","Utilization (%)","Status"');
    for (const b of report.budgetPerformance) {
      lines.push(
        [
          this.escapeCsvField(b.name),
          this.escapeCsvField(b.category),
          b.limit.toFixed(2),
          b.spent.toFixed(2),
          b.remaining.toFixed(2),
          b.utilizationPercentage.toFixed(1),
          b.status.toUpperCase(),
        ].join(',')
      );
    }
    lines.push('');

    // Section 4: Savings Goals
    lines.push('"SAVINGS GOALS PROGRESS"');
    lines.push('"Goal Name","Category","Target ($)","Current ($)","Progress (%)","Period Contributions ($)","Status"');
    for (const g of report.savingsPerformance) {
      lines.push(
        [
          this.escapeCsvField(g.name),
          this.escapeCsvField(g.category),
          g.targetAmount.toFixed(2),
          g.currentAmount.toFixed(2),
          g.progressPercentage.toFixed(1),
          g.periodContributions.toFixed(2),
          this.escapeCsvField(g.status),
        ].join(',')
      );
    }
    lines.push('');

    // Section 5: Bills & Obligations
    lines.push('"BILLS & RECURRING OBLIGATIONS"');
    lines.push('"Bill Name","Category","Amount ($)","Due Date","Frequency","Payment Status"');
    for (const bill of report.billsAnalysis) {
      lines.push(
        [
          this.escapeCsvField(bill.name),
          this.escapeCsvField(bill.category),
          bill.amount.toFixed(2),
          bill.dueDate,
          bill.frequency,
          bill.paymentStatus.toUpperCase(),
        ].join(',')
      );
    }

    // Prepend UTF-8 BOM so Excel opens with proper character encoding
    return `\uFEFF${lines.join('\r\n')}`;
  }

  /**
   * Generate multi-sheet styled Excel workbook using ExcelJS
   */
  public static async generateExcel(report: ComprehensiveFinancialReport): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ArthaAI Financial Platform';
    workbook.created = new Date();

    const headerFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E1B4B' }, // Dark Indigo
    };

    const headerFont: Partial<ExcelJS.Font> = {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };

    // Sheet 1: Executive Summary
    const summarySheet = workbook.addWorksheet('Executive Summary');
    summarySheet.columns = [
      { header: 'Financial Metric', key: 'metric', width: 32 },
      { header: 'Current Period', key: 'current', width: 22 },
      { header: 'Prior Period', key: 'previous', width: 22 },
      { header: 'Period Delta', key: 'delta', width: 20 },
      { header: 'Change %', key: 'change', width: 16 },
    ];

    summarySheet.getRow(1).fill = headerFill;
    summarySheet.getRow(1).font = headerFont;

    const s = report.summary;
    const c = report.comparison;

    summarySheet.addRow({
      metric: 'Total Income',
      current: s.totalIncome,
      previous: c ? c.income.previous : undefined,
      delta: c ? c.income.delta : undefined,
      change: c ? `${c.income.percentageChange}%` : undefined,
    });

    summarySheet.addRow({
      metric: 'Total Expenses',
      current: s.totalExpenses,
      previous: c ? c.expenses.previous : undefined,
      delta: c ? c.expenses.delta : undefined,
      change: c ? `${c.expenses.percentageChange}%` : undefined,
    });

    summarySheet.addRow({
      metric: 'Net Cash Flow',
      current: s.netCashFlow,
      previous: c ? c.netCashFlow.previous : undefined,
      delta: c ? c.netCashFlow.delta : undefined,
      change: c ? `${c.netCashFlow.percentageChange}%` : undefined,
    });

    summarySheet.addRow({
      metric: 'Savings Rate',
      current: `${s.savingsRatePercentage}%`,
      previous: c ? `${c.savingsRate.previous}%` : undefined,
      delta: c ? `${c.savingsRate.delta}%` : undefined,
      change: c ? `${c.savingsRate.percentageChange}%` : undefined,
    });

    summarySheet.addRow({
      metric: 'Completed Transactions',
      current: s.transactionCount,
    });

    summarySheet.addRow({
      metric: 'Overall Budget Utilization',
      current: `${s.budgetUtilization.utilizationPercentage}%`,
    });

    summarySheet.addRow({
      metric: 'Net Worth Advisory',
      current: s.netWorthNote,
    });

    // Sheet 2: Category Breakdown
    const catSheet = workbook.addWorksheet('Category Breakdown');
    catSheet.columns = [
      { header: 'Category', key: 'category', width: 28 },
      { header: 'Amount ($)', key: 'amount', width: 18 },
      { header: 'Share (%)', key: 'percentage', width: 14 },
      { header: 'Transactions', key: 'txCount', width: 16 },
      { header: 'Prior Period ($)', key: 'prevAmount', width: 18 },
      { header: 'Change (%)', key: 'change', width: 16 },
    ];
    catSheet.getRow(1).fill = headerFill;
    catSheet.getRow(1).font = headerFont;

    for (const cat of report.categories) {
      catSheet.addRow({
        category: this.sanitizeFormulaInjection(cat.category),
        amount: cat.amount,
        percentage: `${cat.percentage}%`,
        txCount: cat.transactionCount,
        prevAmount: cat.previousAmount || 0,
        change: cat.changePercentage !== undefined ? `${cat.changePercentage}%` : 'N/A',
      });
    }

    // Sheet 3: Budget Performance
    const budgetSheet = workbook.addWorksheet('Budget Performance');
    budgetSheet.columns = [
      { header: 'Budget Name', key: 'name', width: 28 },
      { header: 'Category', key: 'category', width: 24 },
      { header: 'Limit ($)', key: 'limit', width: 18 },
      { header: 'Spent ($)', key: 'spent', width: 18 },
      { header: 'Remaining ($)', key: 'remaining', width: 18 },
      { header: 'Utilization (%)', key: 'util', width: 16 },
      { header: 'Status', key: 'status', width: 16 },
    ];
    budgetSheet.getRow(1).fill = headerFill;
    budgetSheet.getRow(1).font = headerFont;

    for (const b of report.budgetPerformance) {
      budgetSheet.addRow({
        name: this.sanitizeFormulaInjection(b.name),
        category: this.sanitizeFormulaInjection(b.category),
        limit: b.limit,
        spent: b.spent,
        remaining: b.remaining,
        util: `${b.utilizationPercentage}%`,
        status: b.status.toUpperCase(),
      });
    }

    // Sheet 4: Savings Goals
    const savingsSheet = workbook.addWorksheet('Savings Goals');
    savingsSheet.columns = [
      { header: 'Goal Name', key: 'name', width: 28 },
      { header: 'Category', key: 'category', width: 24 },
      { header: 'Target ($)', key: 'target', width: 18 },
      { header: 'Current ($)', key: 'current', width: 18 },
      { header: 'Progress (%)', key: 'progress', width: 16 },
      { header: 'Period Contributions ($)', key: 'contrib', width: 24 },
      { header: 'Status', key: 'status', width: 16 },
    ];
    savingsSheet.getRow(1).fill = headerFill;
    savingsSheet.getRow(1).font = headerFont;

    for (const g of report.savingsPerformance) {
      savingsSheet.addRow({
        name: this.sanitizeFormulaInjection(g.name),
        category: this.sanitizeFormulaInjection(g.category),
        target: g.targetAmount,
        current: g.currentAmount,
        progress: `${g.progressPercentage}%`,
        contrib: g.periodContributions,
        status: this.sanitizeFormulaInjection(g.status),
      });
    }

    // Sheet 5: Bills & Payments
    const billSheet = workbook.addWorksheet('Bills & Obligations');
    billSheet.columns = [
      { header: 'Bill Name', key: 'name', width: 28 },
      { header: 'Category', key: 'category', width: 24 },
      { header: 'Amount ($)', key: 'amount', width: 18 },
      { header: 'Due Date', key: 'dueDate', width: 16 },
      { header: 'Frequency', key: 'frequency', width: 16 },
      { header: 'Payment Status', key: 'status', width: 18 },
    ];
    billSheet.getRow(1).fill = headerFill;
    billSheet.getRow(1).font = headerFont;

    for (const bill of report.billsAnalysis) {
      billSheet.addRow({
        name: this.sanitizeFormulaInjection(bill.name),
        category: this.sanitizeFormulaInjection(bill.category),
        amount: bill.amount,
        dueDate: bill.dueDate,
        frequency: bill.frequency,
        status: bill.paymentStatus.toUpperCase(),
      });
    }

    // Sheet 6: Cash Flow Timeline
    const cashFlowSheet = workbook.addWorksheet('Cash Flow Timeline');
    cashFlowSheet.columns = [
      { header: 'Date', key: 'date', width: 18 },
      { header: 'Income ($)', key: 'income', width: 18 },
      { header: 'Expenses ($)', key: 'expenses', width: 18 },
      { header: 'Net Cash Flow ($)', key: 'net', width: 20 },
    ];
    cashFlowSheet.getRow(1).fill = headerFill;
    cashFlowSheet.getRow(1).font = headerFont;

    for (const point of report.cashFlowTrend) {
      cashFlowSheet.addRow({
        date: point.date,
        income: point.income,
        expenses: point.expenses,
        net: point.netCashFlow,
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Generate professional PDF report using PDFKit
   */
  public static async generatePdf(report: ComprehensiveFinancialReport): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          margin: 40,
          size: 'A4',
          info: {
            Title: `ArthaAI Financial Report - ${report.period.label}`,
            Author: 'ArthaAI Wealth Platform',
          },
        });

        const buffers: Buffer[] = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        // 1. Header Banner
        doc
          .rect(0, 0, doc.page.width, 70)
          .fill('#1e1b4b'); // Deep Navy brand color

        doc
          .fillColor('#ffffff')
          .fontSize(18)
          .font('Helvetica-Bold')
          .text('ARTHAAI WEALTH INTELLIGENCE', 40, 20);

        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#cbd5e1')
          .text(`Personal Financial Statement | ${report.period.label}`, 40, 42);

        doc
          .fontSize(9)
          .fillColor('#94a3b8')
          .text(`Generated: ${report.period.generatedAt.split('T')[0]}`, doc.page.width - 180, 42, {
            align: 'right',
            width: 140,
          });

        doc.moveDown(3);

        // 2. Report Details Summary Block
        const s = report.summary;
        doc
          .fontSize(13)
          .font('Helvetica-Bold')
          .fillColor('#0f172a')
          .text('1. EXECUTIVE CASH FLOW & LIQUIDITY');

        doc
          .fontSize(9)
          .font('Helvetica')
          .fillColor('#475569')
          .text(`Statement Period: ${report.period.startDate} through ${report.period.endDate} (Currency: ${report.period.currency})`);

        doc.moveDown(0.8);

        // Summary KPI Box
        const kpiTop = doc.y;
        const boxWidth = (doc.page.width - 80 - 30) / 4;

        const drawKpi = (x: number, label: string, value: string, sub: string, color: string) => {
          doc
            .rect(x, kpiTop, boxWidth, 54)
            .fillAndStroke('#f8fafc', '#e2e8f0');

          doc
            .fontSize(8)
            .fillColor('#64748b')
            .font('Helvetica-Bold')
            .text(label, x + 8, kpiTop + 8, { width: boxWidth - 16 });

          doc
            .fontSize(13)
            .fillColor(color)
            .font('Helvetica-Bold')
            .text(value, x + 8, kpiTop + 22, { width: boxWidth - 16 });

          doc
            .fontSize(7.5)
            .fillColor('#94a3b8')
            .font('Helvetica')
            .text(sub, x + 8, kpiTop + 40, { width: boxWidth - 16 });
        };

        drawKpi(40, 'TOTAL INCOME', `$${s.totalIncome.toFixed(2)}`, `${s.incomeTransactionCount} deposits`, '#059669');
        drawKpi(40 + boxWidth + 10, 'TOTAL OUTFLOWS', `$${s.totalExpenses.toFixed(2)}`, `${s.expenseTransactionCount} expenses`, '#dc2626');
        drawKpi(40 + (boxWidth + 10) * 2, 'NET CASH FLOW', `${s.netCashFlow >= 0 ? '+' : ''}$${s.netCashFlow.toFixed(2)}`, s.netCashFlow >= 0 ? 'Surplus' : 'Deficit', '#4f46e5');
        drawKpi(40 + (boxWidth + 10) * 3, 'SAVINGS RATE', `${s.savingsRatePercentage}%`, 'Income preserved', '#7c3aed');

        doc.y = kpiTop + 68;

        // 3. Category Spending Breakdown
        doc
          .fontSize(13)
          .font('Helvetica-Bold')
          .fillColor('#0f172a')
          .text('2. EXPENDITURE BY CATEGORY');

        doc.moveDown(0.5);

        // Category Table Header
        let tableY = doc.y;
        doc
          .rect(40, tableY, doc.page.width - 80, 20)
          .fill('#f1f5f9');

        doc
          .fontSize(8.5)
          .font('Helvetica-Bold')
          .fillColor('#334155')
          .text('Category', 50, tableY + 5)
          .text('Total Spent', 220, tableY + 5)
          .text('Share (%)', 310, tableY + 5)
          .text('Transactions', 380, tableY + 5)
          .text('Prior Period', 460, tableY + 5);

        tableY += 22;

        const topCategories = report.categories.slice(0, 7);
        for (const cat of topCategories) {
          doc
            .fontSize(8)
            .font('Helvetica')
            .fillColor('#1e293b')
            .text(cat.category, 50, tableY + 4)
            .text(`$${cat.amount.toFixed(2)}`, 220, tableY + 4)
            .text(`${cat.percentage}%`, 310, tableY + 4)
            .text(`${cat.transactionCount}`, 380, tableY + 4)
            .text(cat.previousAmount !== undefined ? `$${cat.previousAmount.toFixed(2)}` : '$0.00', 460, tableY + 4);

          doc
            .moveTo(40, tableY + 18)
            .lineTo(doc.page.width - 40, tableY + 18)
            .strokeColor('#f1f5f9')
            .stroke();

          tableY += 20;
        }

        doc.y = tableY + 10;

        // 4. Budget & Savings Allocation Summary
        doc
          .fontSize(13)
          .font('Helvetica-Bold')
          .fillColor('#0f172a')
          .text('3. BUDGET & SAVINGS EXECUTION');

        doc.moveDown(0.5);

        doc
          .fontSize(8.5)
          .font('Helvetica')
          .fillColor('#334155')
          .text(
            `• Overall Budget Utilization: ${s.budgetUtilization.utilizationPercentage}% with ${s.budgetUtilization.exceededCount} categories exceeding limits.`
          )
          .text(
            `• Savings Goals: Accumulated $${s.savingsProgress.totalSaved.toFixed(2)} against $${s.savingsProgress.totalTarget.toFixed(2)} target (${s.savingsProgress.overallProgressPercentage}% completion).`
          )
          .text(
            `• Recurring Commitments: $${s.billsSummary.totalPaidInPeriod.toFixed(2)} paid in period, with $${s.billsSummary.pendingCommitments.toFixed(2)} in active obligations.`
          );

        doc.moveDown(1.5);

        // 5. Net Worth Note & Legal Disclaimer
        doc
          .rect(40, doc.y, doc.page.width - 80, 50)
          .fillAndStroke('#f8fafc', '#e2e8f0');

        doc
          .fontSize(8)
          .font('Helvetica-Bold')
          .fillColor('#b45309')
          .text('DATA & SCOPE ADVISORY', 50, doc.y - 42);

        doc
          .fontSize(7.5)
          .font('Helvetica')
          .fillColor('#64748b')
          .text(
            `${s.netWorthNote} Cash flow surpluses reflect eligible completed transaction ledgers within ArthaAI and do not represent comprehensive asset valuations.`,
            50,
            doc.y - 28,
            { width: doc.page.width - 100 }
          );

        // Footer
        doc
          .fontSize(7)
          .fillColor('#94a3b8')
          .text(
            'Generated by ArthaAI — Personal Financial Report. Informational summary only; not certified financial or tax advice.',
            40,
            doc.page.height - 30,
            { align: 'center', width: doc.page.width - 80 }
          );

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
