import { Component, OnInit } from '@angular/core';

interface PositionCalculation {
  positionSize: number;
  quantity: number;
  riskAmount: number;
  potentialProfit: number;
  riskRewardRatio: number;
  marginRequired: number;
  portfolioRisk: number;
}

@Component({
  standalone: false,
  selector: 'app-position-calculator',
  templateUrl: './position-calculator.component.html',
  styleUrls: ['./position-calculator.component.css']
})
export class PositionCalculatorComponent implements OnInit {
  // Input Fields
  accountSize: number = 100000;
  riskPercentage: number = 2;
  entryPrice: number = null;
  stopLoss: number = null;
  target: number = null;
  leverageMultiplier: number = 1;
  
  // Calculation Results
  result: PositionCalculation = null;
  
  // Saved Positions
  savedPositions: any[] = [];

  constructor() {}

  ngOnInit() {
    // Load saved positions from localStorage
    const saved = localStorage.getItem('tradingPositions');
    if (saved) {
      this.savedPositions = JSON.parse(saved);
    }
  }

  calculatePosition() {
    if (!this.entryPrice || !this.stopLoss || this.accountSize <= 0 || this.riskPercentage <= 0) {
      alert('Please fill all required fields');
      return;
    }

    // Calculate risk per share
    const riskPerShare = Math.abs(this.entryPrice - this.stopLoss);
    
    // Calculate risk amount in rupees
    const riskAmount = (this.accountSize * this.riskPercentage) / 100;
    
    // Calculate position size (quantity)
    const quantity = Math.floor(riskAmount / riskPerShare);
    
    // Calculate total position value
    const positionSize = quantity * this.entryPrice;
    
    // Calculate margin required (with leverage)
    const marginRequired = positionSize / this.leverageMultiplier;
    
    // Calculate potential profit if target is provided
    let potentialProfit = 0;
    let riskRewardRatio = 0;
    
    if (this.target) {
      const profitPerShare = Math.abs(this.target - this.entryPrice);
      potentialProfit = quantity * profitPerShare;
      riskRewardRatio = profitPerShare / riskPerShare;
    }
    
    // Calculate portfolio risk percentage
    const portfolioRisk = (riskAmount / this.accountSize) * 100;
    
    this.result = {
      positionSize,
      quantity,
      riskAmount,
      potentialProfit,
      riskRewardRatio,
      marginRequired,
      portfolioRisk
    };
  }

  savePosition() {
    if (!this.result) {
      alert('Please calculate position first');
      return;
    }

    const position = {
      date: new Date(),
      accountSize: this.accountSize,
      riskPercentage: this.riskPercentage,
      entryPrice: this.entryPrice,
      stopLoss: this.stopLoss,
      target: this.target,
      quantity: this.result.quantity,
      riskAmount: this.result.riskAmount,
      potentialProfit: this.result.potentialProfit,
      riskRewardRatio: this.result.riskRewardRatio
    };

    this.savedPositions.unshift(position);
    localStorage.setItem('tradingPositions', JSON.stringify(this.savedPositions));
    alert('Position saved successfully!');
  }

  deletePosition(index: number) {
    if (confirm('Are you sure you want to delete this position?')) {
      this.savedPositions.splice(index, 1);
      localStorage.setItem('tradingPositions', JSON.stringify(this.savedPositions));
    }
  }

  clearAllPositions() {
    if (confirm('Are you sure you want to clear all saved positions?')) {
      this.savedPositions = [];
      localStorage.removeItem('tradingPositions');
    }
  }

  reset() {
    this.entryPrice = null;
    this.stopLoss = null;
    this.target = null;
    this.leverageMultiplier = 1;
    this.result = null;
  }

  getRiskColor(risk: number): string {
    if (risk <= 1) return 'text-success';
    if (risk <= 2) return 'text-warning';
    return 'text-danger';
  }

  getRRColor(rr: number): string {
    if (rr >= 3) return 'text-success';
    if (rr >= 2) return 'text-primary';
    if (rr >= 1) return 'text-warning';
    return 'text-danger';
  }
}
