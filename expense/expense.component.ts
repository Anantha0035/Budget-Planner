import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ExpenseService } from '../../expense.service';

@Component({
  selector: 'app-expense',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.scss'],
  providers: [ExpenseService],
})
export class ExpenseComponent implements OnInit {
  expenseForm: any;
  selectedMonth: string = '';
  expenses: any[] = [];
  filteredExpenses: any[] = [];
  monthSelected: boolean = false;
  totalExpense: number = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private expenseService: ExpenseService
  ) {}

  ngOnInit(): void {
    this.expenseForm = this.fb.group({
      month: ['', Validators.required],
      expenseType: ['', Validators.required],
      amount: ['', Validators.required]
    });
  }

  onChangeExpense(event: any) {
    this.selectedMonth = event.target.value;
    this.monthSelected = true;
    console.log('Selected month:', this.selectedMonth);
    this.fetchExpenses();
  }

  fetchExpenses() {
    if (this.selectedMonth) {
      this.expenseService.getExpenses(this.selectedMonth).subscribe((data) => {
        this.filteredExpenses = data;
        console.log(`Fetched expenses for ${this.selectedMonth}:`, this.filteredExpenses);
        this.calculateTotalExpense();
      });
    }
  }

  calculateTotalExpense(): void {
    this.totalExpense = this.filteredExpenses.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    console.log(`Total expense for ${this.selectedMonth}:`, this.totalExpense);
  }

  onSubmitExpense() {
    if (this.expenseForm.valid) {
      const formValue = this.expenseForm.value;
      const newExpense = {
        ...formValue,
        month: this.selectedMonth
      };

      console.log('Adding new expense:', newExpense);

      this.expenseService.addExpense(newExpense).subscribe(() => {
        this.fetchExpenses();
        this.expenseForm.reset();
        this.expenseForm.patchValue({ month: '', expenseType: '', amount: '' });
      });
    }
  }

  saveForm() {
    console.log("Form saved!");
  }

  onBack() {
    this.router.navigate(['/budget-planner/dashboard']);
  }
}
