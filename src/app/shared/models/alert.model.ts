export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  currentPrice?: number;
  createdAt: Date;
  triggered: boolean;
  triggeredAt?: Date;
  active: boolean;
  notificationSent?: boolean;
}

export interface AlertNotification {
  alert: PriceAlert;
  message: string;
  timestamp: Date;
}
