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

interface OptionCalculation {
  breakEven: number;
  profitLoss: number;
  maxProfit: number;
  maxLoss: number;
  returnOnInvestment: number;
  totalInvestment: number;
}

interface GreeksCalculation {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
  theoreticalPrice: number;
}

interface OptionStopLoss {
  maxLots: number;
  totalInvestment: number;
  stopLossPrice: number;
  stopLossAmount: number;
  lotsToBuy: number;
}

@Component({
  standalone: false,
  selector: 'app-position-calculator',
  templateUrl: './position-calculator.component.html',
  styleUrls: ['./position-calculator.component.css']
})
export class PositionCalculatorComponent implements OnInit {
  // Calculator Mode
  calculatorMode: 'stock' | 'option' | 'blackscholes' | 'strategy' = 'stock';
  
  // Stock Calculator Fields
  accountSize: number = 100000;
  riskPercentage: number = 2;
  entryPrice: number = null;
  stopLoss: number = null;
  target: number = null;
  leverageMultiplier: number = 1;
  
  // Options Calculator Fields
  optionType: 'call' | 'put' = 'call';
  optionAction: 'buy' | 'sell' = 'buy';
  strikePrice: number = null;
  premium: number = null;
  customLotSize: number = 700; // Lot size (shares per lot) - default 700
  currentPrice: number = null;
  quantity: number = 1; // Number of lots
  
  // Option Stop Loss Fields
  optionCapital: number = 0; // How much capital you want to risk (in rupees)
  maxRiskPercentage: number = 0; // Max % of premium to risk as SL
  targetPremium: number = 0; // Target premium for profit booking
  
  // Multiple Targets
  target1Premium: number = 0; // First target
  target2Premium: number = 0; // Second target
  target3Premium: number = 0; // Third target
  
  // Days to Expiry
  expiryDate: string = ''; // Store as string in yyyy-MM-dd format for HTML date input
  daysToExpiry: number = 0;
  
  // Position Sizing
  totalCapital: number = 100000; // Total trading capital
  riskPerTradePercent: number = 2; // % of capital to risk per trade
  
  // Black-Scholes Fields
  stockPrice: number = null;
  bsStrikePrice: number = null;
  timeToExpiry: number = 30; // Days
  volatility: number = 20; // %
  riskFreeRate: number = 6.5; // %
  
  // Strategy Fields
  strategyType: 'straddle' | 'strangle' | 'ironcondor' | 'butterfly' = 'straddle';
  
  // Calculation Results
  result: PositionCalculation = null;
  optionResult: OptionCalculation = null;
  greeksResult: GreeksCalculation = null;
  optionSLResult: OptionStopLoss = null;
  
  // Saved Positions
  savedPositions: any[] = [];
  
  // Expose Math to template
  Math = Math;

  constructor() {}

  ngOnInit() {
    // Load saved positions from localStorage
    const saved = localStorage.getItem('tradingPositions');
    if (saved) {
      this.savedPositions = JSON.parse(saved);
    }
    
    // Set default expiry date to last Friday of current month
    this.expiryDate = this.getLastFridayOfMonthString(new Date());
    this.calculateDaysToExpiry();
  }
  
  /**
   * Get the last Friday of a given month as a string in yyyy-MM-dd format
   */
  getLastFridayOfMonthString(date: Date): string {
    const lastFriday = this.getLastFridayOfMonth(date);
    return this.formatDateToString(lastFriday);
  }
  
  /**
   * Get the last Friday of a given month
   */
  getLastFridayOfMonth(date: Date): Date {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Find the last Friday
    // Friday is day 5 (0 = Sunday, 1 = Monday, ..., 5 = Friday)
    const lastDayOfWeek = lastDay.getDay();
    const daysToSubtract = (lastDayOfWeek + 2) % 7; // Calculate days back to Friday
    
    const lastFriday = new Date(year, month, lastDay.getDate() - daysToSubtract);
    return lastFriday;
  }
  
  /**
   * Convert Date object to yyyy-MM-dd string format
   */
  formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    // Stock calculator fields
    this.entryPrice = null;
    this.stopLoss = null;
    this.target = null;
    this.leverageMultiplier = 1;
    this.result = null;
    
    // Options calculator fields
    this.optionType = 'call';
    this.optionAction = 'buy';
    this.strikePrice = null;
    this.premium = null;
    this.currentPrice = null;
    this.quantity = 1;
    this.customLotSize = 700;
    
    // Stop loss and targets
    this.optionCapital = 0;
    this.maxRiskPercentage = 0;
    this.targetPremium = 0;
    this.target1Premium = 0;
    this.target2Premium = 0;
    this.target3Premium = 0;
    
    // Days to expiry - reset to last Friday of current month
    this.expiryDate = this.getLastFridayOfMonthString(new Date());
    this.calculateDaysToExpiry();
    
    // Position sizing
    this.totalCapital = 100000;
    this.riskPerTradePercent = 2;
    
    // Results
    this.optionResult = null;
    this.optionSLResult = null;
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

  // ==================== OPTIONS CALCULATOR ====================
  
  /**
   * Calculate Options P&L
   */
  calculateOption() {
    const effectiveLotSize = this.customLotSize;
    
    if (!this.strikePrice || !this.premium || !this.currentPrice || !effectiveLotSize || effectiveLotSize <= 0) {
      alert('Please fill all required fields (including custom lot size if selected)');
      return;
    }

    let profitLoss = 0;
    let breakEven = 0;
    let maxProfit = 0;
    let maxLoss = 0;

    const totalLots = this.quantity * effectiveLotSize;
    const totalInvestment = this.premium * totalLots;

    if (this.optionType === 'call') {
      if (this.optionAction === 'buy') {
        // Buy Call
        breakEven = this.strikePrice + this.premium;
        profitLoss = Math.max(0, this.currentPrice - this.strikePrice) - this.premium;
        profitLoss *= totalLots;
        maxProfit = Infinity; // Unlimited
        maxLoss = totalInvestment;
      } else {
        // Sell Call
        breakEven = this.strikePrice + this.premium;
        profitLoss = this.premium - Math.max(0, this.currentPrice - this.strikePrice);
        profitLoss *= totalLots;
        maxProfit = totalInvestment;
        maxLoss = Infinity; // Unlimited
      }
    } else {
      // Put Option
      if (this.optionAction === 'buy') {
        // Buy Put
        breakEven = this.strikePrice - this.premium;
        profitLoss = Math.max(0, this.strikePrice - this.currentPrice) - this.premium;
        profitLoss *= totalLots;
        maxProfit = (this.strikePrice - this.premium) * totalLots;
        maxLoss = totalInvestment;
      } else {
        // Sell Put
        breakEven = this.strikePrice - this.premium;
        profitLoss = this.premium - Math.max(0, this.strikePrice - this.currentPrice);
        profitLoss *= totalLots;
        maxProfit = totalInvestment;
        maxLoss = (this.strikePrice - this.premium) * totalLots;
      }
    }

    const returnOnInvestment = (profitLoss / totalInvestment) * 100;

    this.optionResult = {
      breakEven,
      profitLoss,
      maxProfit,
      maxLoss,
      returnOnInvestment,
      totalInvestment
    };
  }

  // ==================== OPTION STOP LOSS CALCULATOR ====================
  
  /**
   * Calculate SL price based on max loss (either % or amount)
   * Support both percentage-based and amount-based risk management
   */
  calculateOptionStopLoss() {
    const effectiveLotSize = this.customLotSize;
    
    if (!this.premium || this.premium <= 0 || !effectiveLotSize || effectiveLotSize <= 0 || !this.quantity || this.quantity <= 0) {
      alert('Please fill all required fields (premium, lot size, and number of lots)');
      return;
    }

    // Check which mode is selected
    const isPercentageMode = this.maxRiskPercentage > 0;
    const isAmountMode = this.optionCapital > 0;

    if (!isPercentageMode && !isAmountMode) {
      alert('Please set stop loss by percentage OR amount');
      return;
    }

    // Total shares = lot size × number of lots
    const totalShares = effectiveLotSize * this.quantity;
    
    // Total investment = premium × total shares
    const totalInvestment = this.premium * totalShares;
    
    let stopLossPrice: number;
    let actualMaxLoss: number;

    if (isPercentageMode) {
      // Calculate SL based on percentage
      // If max risk is 20%, exit at 80% of entry premium
      stopLossPrice = this.premium * (1 - this.maxRiskPercentage / 100);
      actualMaxLoss = (this.premium - stopLossPrice) * totalShares;
    } else {
      // Calculate SL based on fixed amount
      const lossPerShare = this.optionCapital / totalShares;
      stopLossPrice = Math.max(0, this.premium - lossPerShare);
      actualMaxLoss = (this.premium - stopLossPrice) * totalShares;
    }

    stopLossPrice = Math.max(0, stopLossPrice);

    this.optionSLResult = {
      maxLots: this.quantity,
      totalInvestment: totalInvestment,
      stopLossPrice: stopLossPrice,
      stopLossAmount: actualMaxLoss,
      lotsToBuy: this.quantity
    };
  }

  // ==================== PRESET STRATEGIES ====================
  
  /**
   * Apply conservative preset: 10% SL, 25% target
   */
  applyConservativePreset() {
    if (!this.premium) {
      alert('Please enter premium first');
      return;
    }
    this.maxRiskPercentage = 10;
    this.optionCapital = 0;
    this.targetPremium = this.premium * 1.25;
    this.target1Premium = this.premium * 1.15;
    this.target2Premium = this.premium * 1.20;
    this.target3Premium = this.premium * 1.25;
  }

  /**
   * Apply moderate preset: 20% SL, 50% target
   */
  applyModeratePreset() {
    if (!this.premium) {
      alert('Please enter premium first');
      return;
    }
    this.maxRiskPercentage = 20;
    this.optionCapital = 0;
    this.targetPremium = this.premium * 1.5;
    this.target1Premium = this.premium * 1.25;
    this.target2Premium = this.premium * 1.375;
    this.target3Premium = this.premium * 1.5;
  }

  /**
   * Apply aggressive preset: 30% SL, 100% target
   */
  applyAggressivePreset() {
    if (!this.premium) {
      alert('Please enter premium first');
      return;
    }
    this.maxRiskPercentage = 30;
    this.optionCapital = 0;
    this.targetPremium = this.premium * 2;
    this.target1Premium = this.premium * 1.4;
    this.target2Premium = this.premium * 1.7;
    this.target3Premium = this.premium * 2;
  }

  /**
   * Calculate break-even price for the option
   */
  getBreakEvenPrice(): number {
    if (!this.strikePrice || !this.premium) return 0;
    if (this.optionType === 'call') {
      return this.strikePrice + this.premium;
    } else {
      return this.strikePrice - this.premium;
    }
  }

  // ==================== DAYS TO EXPIRY ====================
  
  /**
   * Calculate days to expiry when date changes
   */
  calculateDaysToExpiry() {
    if (!this.expiryDate) {
      this.daysToExpiry = 0;
      return;
    }
    const today = new Date();
    const expiry = new Date(this.expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    this.daysToExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get time decay warning level
   */
  getTimeDecayWarning(): string {
    if (this.daysToExpiry <= 0) return 'expired';
    if (this.daysToExpiry <= 3) return 'critical';
    if (this.daysToExpiry <= 7) return 'high';
    if (this.daysToExpiry <= 15) return 'medium';
    return 'low';
  }

  // ==================== PROFIT/LOSS SCENARIOS ====================
  
  /**
   * Calculate P&L at different stock price movements
   */
  calculatePLScenarios(): Array<{movement: string, stockPrice: number, premium: number, pl: number, plPercent: number}> {
    if (!this.currentPrice || !this.premium || !this.strikePrice) return [];
    
    const scenarios = [];
    const movements = [10, 5, 2, 0, -2, -5, -10];
    const totalShares = this.customLotSize * this.quantity;
    
    movements.forEach(pct => {
      const newStockPrice = this.currentPrice * (1 + pct / 100);
      let intrinsicValue = 0;
      
      if (this.optionType === 'call') {
        intrinsicValue = Math.max(0, newStockPrice - this.strikePrice);
      } else {
        intrinsicValue = Math.max(0, this.strikePrice - newStockPrice);
      }
      
      // Simple approximation: Premium = Intrinsic Value (ignoring time value for simplicity)
      // In reality, there would be time value component
      const estimatedPremium = Math.max(0.05, intrinsicValue);
      
      let pl = 0;
      if (this.optionAction === 'buy') {
        pl = (estimatedPremium - this.premium) * totalShares;
      } else {
        pl = (this.premium - estimatedPremium) * totalShares;
      }
      
      const plPercent = (pl / (this.premium * totalShares)) * 100;
      
      scenarios.push({
        movement: pct > 0 ? `+${pct}%` : `${pct}%`,
        stockPrice: newStockPrice,
        premium: estimatedPremium,
        pl: pl,
        plPercent: plPercent
      });
    });
    
    return scenarios;
  }

  // ==================== POSITION SIZING ====================
  
  /**
   * Calculate recommended number of lots based on position sizing
   */
  getRecommendedLots(): number {
    if (!this.premium || !this.totalCapital || !this.riskPerTradePercent) return 0;
    
    const lotSize = this.customLotSize;
    if (!lotSize || lotSize <= 0) return 0;
    
    // Calculate max risk amount per trade
    const maxRiskAmount = (this.totalCapital * this.riskPerTradePercent) / 100;
    
    // Calculate risk per lot based on stop loss
    let riskPerLot: number;
    
    if (this.maxRiskPercentage > 0) {
      // If stop loss is by percentage (e.g., 50% = exit at ₹2.50 if entry is ₹5)
      const stopLossPrice = this.premium * (1 - this.maxRiskPercentage / 100);
      riskPerLot = (this.premium - stopLossPrice) * lotSize;
    } else if (this.optionCapital > 0) {
      // If stop loss is by fixed amount
      riskPerLot = this.optionCapital;
    } else {
      // No stop loss set, assume 100% risk (premium × lot size)
      riskPerLot = this.premium * lotSize;
    }
    
    // Calculate how many lots we can buy with our max risk
    const recommendedLots = Math.floor(maxRiskAmount / riskPerLot);
    
    return Math.max(1, recommendedLots);
  }

  /**
   * Get total position value
   */
  getTotalPositionValue(): number {
    if (!this.premium) return 0;
    const lotSize = this.customLotSize;
    return this.premium * lotSize * this.quantity;
  }

  /**
   * Get position size as % of capital
   */
  getPositionSizePercent(): number {
    if (!this.totalCapital) return 0;
    return (this.getTotalPositionValue() / this.totalCapital) * 100;
  }

  // ==================== BLACK-SCHOLES MODEL ====================
  
  /**
   * Calculate Black-Scholes Option Price and Greeks
   */
  calculateBlackScholes() {
    if (!this.stockPrice || !this.bsStrikePrice || this.timeToExpiry <= 0 || this.volatility <= 0) {
      alert('Please fill all required fields');
      return;
    }

    const S = this.stockPrice;
    const K = this.bsStrikePrice;
    const T = this.timeToExpiry / 365; // Convert days to years
    const sigma = this.volatility / 100;
    const r = this.riskFreeRate / 100;

    // Calculate d1 and d2
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);

    // Standard normal cumulative distribution function
    const N = (x: number) => {
      const t = 1 / (1 + 0.2316419 * Math.abs(x));
      const d = 0.3989423 * Math.exp(-x * x / 2);
      const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
      return x > 0 ? 1 - prob : prob;
    };

    // Standard normal probability density function
    const n = (x: number) => (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);

    // Call and Put prices
    const callPrice = S * N(d1) - K * Math.exp(-r * T) * N(d2);
    const putPrice = K * Math.exp(-r * T) * N(-d2) - S * N(-d1);

    // Greeks
    const delta = this.optionType === 'call' ? N(d1) : N(d1) - 1;
    const gamma = n(d1) / (S * sigma * Math.sqrt(T));
    const theta = this.optionType === 'call' 
      ? -(S * n(d1) * sigma) / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * N(d2)
      : -(S * n(d1) * sigma) / (2 * Math.sqrt(T)) + r * K * Math.exp(-r * T) * N(-d2);
    const vega = S * n(d1) * Math.sqrt(T) * 0.01; // 1% change
    const rho = this.optionType === 'call'
      ? K * T * Math.exp(-r * T) * N(d2) * 0.01
      : -K * T * Math.exp(-r * T) * N(-d2) * 0.01;

    this.greeksResult = {
      delta: delta,
      gamma: gamma,
      theta: theta / 365, // Per day
      vega: vega,
      rho: rho,
      theoreticalPrice: this.optionType === 'call' ? callPrice : putPrice
    };
  }

  // ==================== HELPER METHODS ====================
  
  switchCalculator(mode: 'stock' | 'option' | 'blackscholes' | 'strategy') {
    this.calculatorMode = mode;
    this.resetAllCalculations();
  }

  resetAllCalculations() {
    this.result = null;
    this.optionResult = null;
    this.greeksResult = null;
  }

  getProfitLossColor(value: number): string {
    if (value > 0) return 'text-success';
    if (value < 0) return 'text-danger';
    return 'text-warning';
  }

  getOptionLabel(): string {
    return `${this.optionAction.toUpperCase()} ${this.optionType.toUpperCase()}`;
  }
}
