import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ViewEncapsulation } from '@angular/core';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatIconModule, SideNavComponent, CommonModule, HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class DashboardComponent implements OnInit {
  incomeData: any[] = [];
  expenseData: any[] = [];
  monthlyIncomeTotals: { [month: string]: number } = {};
  monthlyExpenseTotals: { [month: string]: number } = {};
  todoTransactions: any[] = [];
  currentMonthIncome: number = 0;
  currentMonthExpense: number = 0;

  @ViewChild('pdfTable') pdfTable!: ElementRef;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchDataForMonths(['January', 'February', 'March']);
    this.fetchTodoTransactions();
  }

  fetchDataForMonths(months: string[]): void {
    months.forEach(month => {
      this.fetchIncomeDataForMonth(month);
      this.fetchExpenseDataForMonth(month);
    });
  }

  fetchIncomeDataForMonth(month: string): void {
    this.http.get<any[]>(`http://localhost:5000/incomes?month=${month}`).subscribe(
      data => {
        this.incomeData = [...this.incomeData, ...data];
        this.processIncomeData();
      },
      error => {
        console.error(`Failed to fetch income data for ${month}:`, error);
      }
    );
  }

  fetchExpenseDataForMonth(month: string): void {
    this.http.get<any[]>(`http://localhost:5000/expenses?month=${month}`).subscribe(
      data => {
        this.expenseData = [...this.expenseData, ...data];
        this.processExpenseData();
      },
      error => {
        console.error(`Failed to fetch expense data for ${month}:`, error);
      }
    );
  }

  fetchTodoTransactions(): void {
    this.todoTransactions = [
      { description: 'Pay electricity bill' },
      { description: 'Submit monthly report' },
      { description: 'Buy groceries' },
      { description: 'Call insurance company' }
    ];
  }

  processIncomeData(): void {
    this.monthlyIncomeTotals = {};
    this.incomeData.forEach(income => {
      if (!this.monthlyIncomeTotals[income.month]) {
        this.monthlyIncomeTotals[income.month] = 0;
      }
      this.monthlyIncomeTotals[income.month] += income.amount;
    });

    this.currentMonthIncome = this.monthlyIncomeTotals['January'] || 0;
  }

  processExpenseData(): void {
    this.monthlyExpenseTotals = {};
    this.expenseData.forEach(expense => {
      if (!this.monthlyExpenseTotals[expense.month]) {
        this.monthlyExpenseTotals[expense.month] = 0;
      }
      this.monthlyExpenseTotals[expense.month] += expense.amount;
    });

    this.currentMonthExpense = this.monthlyExpenseTotals['January'] || 0;
  }

  get currentMonthSavings(): number {
    return this.currentMonthIncome - this.currentMonthExpense;
  }

  get totalIncome(): number {
    return Object.values(this.monthlyIncomeTotals).reduce((sum, income) => sum + income, 0);
  }

  get totalExpense(): number {
    return Object.values(this.monthlyExpenseTotals).reduce((sum, expense) => sum + expense, 0);
  }

  get totalSavings(): number {
    return this.totalIncome - this.totalExpense;
  }

  generateReport(): void {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Budget Planner Report', 14, 22);

    doc.setFontSize(14);
    doc.text('Income and Expense Report', 14, 32);

    doc.setFontSize(12);
    doc.text('Income', 14, 42);
    const incomeRows = this.getMonthlyIncomeKeys().map(month => [
      month, `$${this.monthlyIncomeTotals[month]}`
    ]);
    autoTable(doc, {
      head: [['Month', 'Total Income']],
      body: incomeRows,
      startY: 46
    });

    const lastIncomeTableY = (doc as any).lastAutoTable.finalY + 10;
    doc.text('Expense', 14, lastIncomeTableY);
    const expenseRows = this.getMonthlyExpenseKeys().map(month => [
      month, `$${this.monthlyExpenseTotals[month]}`
    ]);
    autoTable(doc, {
      head: [['Month', 'Total Expense']],
      body: expenseRows,
      startY: lastIncomeTableY + 4
    });

    const lastExpenseTableY = (doc as any).lastAutoTable.finalY + 10;
    doc.text('Summary', 14, lastExpenseTableY);
    autoTable(doc, {
      body: [
        ['Total Income', `$${this.totalIncome}`],
        ['Total Expense', `$${this.totalExpense}`],
        ['Total Savings', `$${this.totalSavings}`]
      ],
      startY: lastExpenseTableY + 4,
      theme: 'plain'
    });

    doc.save('report.pdf');
  }

  onIncome(): void {
    this.router.navigate(['/budget-planner/income']);
  }

  onExpense(): void {
    this.router.navigate(['/budget-planner/expense']);
  }

  onTodo(): void {
    this.router.navigate(['/budget-planner/todo']);
  }

  getMonthlyIncomeKeys(): string[] {
    return Object.keys(this.monthlyIncomeTotals);
  }

  getMonthlyExpenseKeys(): string[] {
    return Object.keys(this.monthlyExpenseTotals);
  }
}
