import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertService } from '../alert.service';
import { PriceAlert, AlertNotification } from '../shared/models/alert.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.css']
})
export class AlertsComponent implements OnInit, OnDestroy {
  alerts: PriceAlert[] = [];
  notifications: AlertNotification[] = [];
  
  // Form fields
  newSymbol: string = '';
  newTargetPrice: number;
  newCondition: 'above' | 'below' = 'above';
  
  successMessage: string = '';
  errorMessage: string = '';
  
  private alertsSubscription: Subscription;
  private notificationsSubscription: Subscription;

  // AG-Grid configuration
  columnDefs = [
    {
      headerName: 'Status',
      field: 'triggered',
      sortable: true,
      filter: true,
      width: 100,
      cellRenderer: params => {
        if (params.value) {
          return '<span class="badge badge-success">Triggered</span>';
        }
        return params.data.active 
          ? '<span class="badge badge-primary">Active</span>'
          : '<span class="badge badge-secondary">Paused</span>';
      }
    },
    {
      headerName: 'Symbol',
      field: 'symbol',
      sortable: true,
      filter: true,
      width: 120,
      cellStyle: { fontWeight: 'bold' }
    },
    {
      headerName: 'Condition',
      field: 'condition',
      sortable: true,
      filter: true,
      width: 100,
      valueFormatter: params => params.value.charAt(0).toUpperCase() + params.value.slice(1)
    },
    {
      headerName: 'Target Price',
      field: 'targetPrice',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 120,
      valueFormatter: params => '₹' + params.value.toFixed(2)
    },
    {
      headerName: 'Current Price',
      field: 'currentPrice',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 130,
      valueFormatter: params => params.value ? '₹' + params.value.toFixed(2) : '-'
    },
    {
      headerName: 'Created',
      field: 'createdAt',
      sortable: true,
      width: 150,
      valueFormatter: params => new Date(params.value).toLocaleString()
    },
    {
      headerName: 'Triggered At',
      field: 'triggeredAt',
      sortable: true,
      width: 150,
      valueFormatter: params => params.value ? new Date(params.value).toLocaleString() : '-'
    },
    {
      headerName: 'Actions',
      width: 150,
      cellRenderer: params => {
        const toggleBtn = params.data.triggered 
          ? '' 
          : `<button class="btn btn-sm ${params.data.active ? 'btn-warning' : 'btn-success'} mr-1" 
               data-action="toggle" data-id="${params.data.id}">
              ${params.data.active ? 'Pause' : 'Resume'}
            </button>`;
        
        return `${toggleBtn}
                <button class="btn btn-sm btn-danger" data-action="delete" data-id="${params.data.id}">
                  Delete
                </button>`;
      }
    }
  ];

  gridOptions = {
    pagination: true,
    paginationPageSize: 20,
    domLayout: 'autoHeight',
    enableCellTextSelection: true,
    onCellClicked: this.onCellClicked.bind(this)
  };

  constructor(private alertService: AlertService) {}

  ngOnInit() {
    this.alertsSubscription = this.alertService.alerts$.subscribe(
      alerts => {
        this.alerts = alerts.sort((a, b) => {
          // Sort: Active first, then by created date
          if (a.triggered !== b.triggered) return a.triggered ? 1 : -1;
          return b.createdAt.getTime() - a.createdAt.getTime();
        });
      }
    );

    this.notificationsSubscription = this.alertService.notifications$.subscribe(
      notifications => {
        this.notifications = notifications;
      }
    );
  }

  ngOnDestroy() {
    if (this.alertsSubscription) {
      this.alertsSubscription.unsubscribe();
    }
    if (this.notificationsSubscription) {
      this.notificationsSubscription.unsubscribe();
    }
  }

  createAlert() {
    if (!this.newSymbol.trim()) {
      this.showError('Please enter a symbol');
      return;
    }

    if (!this.newTargetPrice || this.newTargetPrice <= 0) {
      this.showError('Please enter a valid target price');
      return;
    }

    const alertId = this.alertService.createAlert(
      this.newSymbol,
      this.newTargetPrice,
      this.newCondition
    );

    this.showSuccess(`Alert created for ${this.newSymbol.toUpperCase()}`);
    
    // Reset form
    this.newSymbol = '';
    this.newTargetPrice = null;
    this.newCondition = 'above';
  }

  deleteAlert(alertId: string) {
    if (confirm('Are you sure you want to delete this alert?')) {
      const success = this.alertService.deleteAlert(alertId);
      if (success) {
        this.showSuccess('Alert deleted');
      }
    }
  }

  toggleAlert(alertId: string) {
    this.alertService.toggleAlertActive(alertId);
  }

  clearTriggeredAlerts() {
    if (confirm('Are you sure you want to clear all triggered alerts?')) {
      this.alertService.clearTriggeredAlerts();
      this.showSuccess('Triggered alerts cleared');
    }
  }

  clearAllAlerts() {
    if (confirm('Are you sure you want to delete all alerts?')) {
      this.alertService.clearAllAlerts();
      this.showSuccess('All alerts cleared');
    }
  }

  onCellClicked(event: any) {
    const action = event.event.target.dataset.action;
    const id = event.event.target.dataset.id;

    if (action === 'delete') {
      this.deleteAlert(id);
    } else if (action === 'toggle') {
      this.toggleAlert(id);
    }
  }

  getActiveAlertsCount(): number {
    return this.alerts.filter(a => a.active && !a.triggered).length;
  }

  getTriggeredAlertsCount(): number {
    return this.alerts.filter(a => a.triggered).length;
  }

  private showSuccess(message: string) {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 3000);
  }

  private showError(message: string) {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => this.errorMessage = '', 3000);
  }
}
