import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { Observable } from 'rxjs';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatIconModule, HttpClientModule], // Include HttpClientModule
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss'],
 
})
export class TodoComponent implements OnInit {
  todoForm!: FormGroup; // Use definite assignment assertion
  selectedMonth: string;
  expenses: any[] = []; // Initialize as empty array
  monthSelected: boolean = false;

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    this.selectedMonth = currentMonth;
  }

  ngOnInit(): void {
    this.todoForm = this.fb.group({
      month: [this.selectedMonth, Validators.required], // Initialize with the selectedMonth
      expenseType: ['', Validators.required],
      expenseAmount: ['', Validators.required]
    });

    // Load initial data for the current month
    this.fetchExpenses(this.selectedMonth);
  }

  onSubmitExpense() {
    if (this.todoForm.valid) {
      const newExpense = {
        amount: this.todoForm.value.expenseAmount,
        expenseType: this.todoForm.value.expenseType,
        month: this.selectedMonth
      };
      this.addExpense(newExpense).subscribe(expense => {
        this.expenses.push(expense);
        this.todoForm.reset({ month: this.selectedMonth });
      });
    }
  }

  onChangeExpense(event: any) {
    this.selectedMonth = event.target.value;
    this.monthSelected = true;
    this.fetchExpenses(this.selectedMonth);
  }

  fetchExpenses(month: string): void {
    this.http.get<any[]>(`http://localhost:5000/expenses?month=${month}`).subscribe(data => {
      this.expenses = data;
    });
  }

  addExpense(expense: any): Observable<any> {
    return this.http.post<any>('http://localhost:5000/expenses', expense);
  }

  calculateTotalExpense(): number {
    return this.expenses.reduce((total, expense) => total + expense.amount, 0);
  }

  onBack() {
    this.router.navigate(['/budget-planner/dashboard']);
  }

  toggleSelection(expense: any) {
    expense.selected = !expense.selected;
  }
}
