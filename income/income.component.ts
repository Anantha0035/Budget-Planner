import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IncomeService } from '../../income.service';

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.scss'],
  providers: [IncomeService],
})
export class IncomeComponent implements OnInit {
  incomeForm: any;
  selectedMonth: string = '';
  incomes: any[] = [];
  filteredIncomes: any[] = [];
  monthSelected: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private incomeService: IncomeService
  ) {}

  ngOnInit(): void {
    this.incomeForm = this.fb.group({
      month: ['', Validators.required],
      source: ['', Validators.required],
      amount: ['', Validators.required]
    });
  }

  onChange(event: any) {
    this.selectedMonth = event.target.value;
    this.monthSelected = true;
    console.log('Selected month:', this.selectedMonth);
    this.fetchIncomes();
  }

  calculateTotalIncome(): number {
    let totalIncome = 0;
    for (const income of this.filteredIncomes) {
      totalIncome += income.amount;
    }
    return totalIncome;
  }

  fetchIncomes() {
    if (this.selectedMonth) {
      this.incomeService.getIncomes(this.selectedMonth).subscribe((data) => {
        this.filteredIncomes = data;
        console.log(`Fetched incomes for ${this.selectedMonth}:`, this.filteredIncomes);
      });
    }
  }

  onSubmit() {
    if (this.incomeForm.valid) {
      const formValue = this.incomeForm.value;
      const newIncome = {
        ...formValue,
        month: this.selectedMonth
      };

      console.log('Adding new income:', newIncome);

      this.incomeService.addIncome(newIncome).subscribe(() => {
        this.fetchIncomes();
        this.incomeForm.reset();
        this.incomeForm.patchValue({ month: '', source: '', amount: '' });
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
