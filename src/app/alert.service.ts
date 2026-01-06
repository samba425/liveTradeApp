import { Injectable } from '@angular/core';
import { BehaviorSubject, interval } from 'rxjs';
import { PriceAlert, AlertNotification } from './shared/models/alert.model';
import { CommonserviceService } from './commonservice.service';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertsKey = 'trading_app_alerts';
  private alertsSubject = new BehaviorSubject<PriceAlert[]>([]);
  private notificationsSubject = new BehaviorSubject<AlertNotification[]>([]);
  
  public alerts$ = this.alertsSubject.asObservable();
  public notifications$ = this.notificationsSubject.asObservable();
  
  private monitoringInterval: any;

  constructor(private commonService: CommonserviceService) {
    this.loadAlerts();
    this.startMonitoring();
    this.requestNotificationPermission();
  }

  private loadAlerts(): void {
    try {
      const savedAlerts = localStorage.getItem(this.alertsKey);
      if (savedAlerts) {
        const alerts = JSON.parse(savedAlerts).map(alert => ({
          ...alert,
          createdAt: new Date(alert.createdAt),
          triggeredAt: alert.triggeredAt ? new Date(alert.triggeredAt) : undefined
        }));
        this.alertsSubject.next(alerts);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
      this.alertsSubject.next([]);
    }
  }

  private saveAlerts(): void {
    try {
      const alerts = this.alertsSubject.value;
      localStorage.setItem(this.alertsKey, JSON.stringify(alerts));
    } catch (error) {
      console.error('Error saving alerts:', error);
    }
  }

  createAlert(symbol: string, targetPrice: number, condition: 'above' | 'below'): string {
    const newAlert: PriceAlert = {
      id: this.generateId(),
      symbol: symbol.trim().toUpperCase(),
      targetPrice,
      condition,
      createdAt: new Date(),
      triggered: false,
      active: true,
      notificationSent: false
    };

    const currentAlerts = this.alertsSubject.value;
    this.alertsSubject.next([...currentAlerts, newAlert]);
    this.saveAlerts();
    
    return newAlert.id;
  }

  deleteAlert(alertId: string): boolean {
    const currentAlerts = this.alertsSubject.value;
    const filteredAlerts = currentAlerts.filter(alert => alert.id !== alertId);
    
    if (filteredAlerts.length !== currentAlerts.length) {
      this.alertsSubject.next(filteredAlerts);
      this.saveAlerts();
      return true;
    }
    return false;
  }

  toggleAlertActive(alertId: string): boolean {
    const currentAlerts = this.alertsSubject.value;
    const alert = currentAlerts.find(a => a.id === alertId);
    
    if (alert) {
      alert.active = !alert.active;
      this.alertsSubject.next([...currentAlerts]);
      this.saveAlerts();
      return true;
    }
    return false;
  }

  clearTriggeredAlerts(): void {
    const currentAlerts = this.alertsSubject.value;
    const activeAlerts = currentAlerts.filter(alert => !alert.triggered);
    this.alertsSubject.next(activeAlerts);
    this.saveAlerts();
  }

  clearAllAlerts(): void {
    this.alertsSubject.next([]);
    this.saveAlerts();
  }

  getActiveAlerts(): PriceAlert[] {
    return this.alertsSubject.value.filter(alert => alert.active && !alert.triggered);
  }

  getTriggeredAlerts(): PriceAlert[] {
    return this.alertsSubject.value.filter(alert => alert.triggered);
  }

  private startMonitoring(): void {
    // Check alerts every 30 seconds
    this.monitoringInterval = interval(30000).subscribe(() => {
      this.checkAlerts();
    });
  }

  private async checkAlerts(): Promise<void> {
    const activeAlerts = this.getActiveAlerts();
    
    if (activeAlerts.length === 0) {
      return;
    }

    // Get current stock data
    this.commonService.getData.subscribe(async (stocks: any[]) => {
      if (!stocks || stocks.length === 0) {
        return;
      }

      const currentAlerts = this.alertsSubject.value;
      let alertsUpdated = false;

      for (const alert of activeAlerts) {
        const stock = stocks.find(s => 
          s.name && s.name.toUpperCase().includes(alert.symbol)
        );

        if (stock && stock.close) {
          alert.currentPrice = stock.close;

          const shouldTrigger = 
            (alert.condition === 'above' && stock.close >= alert.targetPrice) ||
            (alert.condition === 'below' && stock.close <= alert.targetPrice);

          if (shouldTrigger && !alert.triggered) {
            alert.triggered = true;
            alert.triggeredAt = new Date();
            alertsUpdated = true;

            this.sendNotification(alert);
          }
        }
      }

      if (alertsUpdated) {
        this.alertsSubject.next([...currentAlerts]);
        this.saveAlerts();
      }
    });
  }

  private sendNotification(alert: PriceAlert): void {
    const notification: AlertNotification = {
      alert,
      message: `${alert.symbol} is ${alert.condition} ₹${alert.targetPrice}. Current price: ₹${alert.currentPrice}`,
      timestamp: new Date()
    };

    // Add to notifications list
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...currentNotifications].slice(0, 50)); // Keep last 50

    // Show browser notification
    if ('Notification' in window && (Notification as any).permission === 'granted') {
      new Notification(`Price Alert: ${alert.symbol}`, {
        body: notification.message,
        icon: '/assets/bell-icon.png',
        tag: alert.id
      } as any);
    }

    // Mark notification as sent
    alert.notificationSent = true;
  }

  private async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window && (Notification as any).permission === 'default') {
      try {
        const permission = await (Notification as any).requestPermission();
        console.log('Notification permission:', permission);
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  ngOnDestroy(): void {
    if (this.monitoringInterval) {
      this.monitoringInterval.unsubscribe();
    }
  }
}
