import React from 'react';
import { HealthAlert } from '../../utils/healthScore';

interface AlertsWidgetProps {
  alerts: HealthAlert[];
  onDismiss: (alertId: string) => void;
}

const AlertsWidget: React.FC<AlertsWidgetProps> = ({ alerts, onDismiss }) => {
  const getAlertIcon = (type: string): string => {
    switch (type) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const getAlertColor = (type: string): string => {
    switch (type) {
      case 'critical': return '#f44336';
      case 'warning': return '#ff9800';
      default: return '#2196f3';
    }
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'weight': return '⚖️';
      case 'activity': return '🎾';
      case 'appetite': return '🍽️';
      case 'symptoms': return '🏥';
      default: return '📋';
    }
  };

  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'weight': return '体重管理';
      case 'activity': return '活動レベル';
      case 'appetite': return '食欲状態';
      case 'symptoms': return '症状';
      default: return 'その他';
    }
  };

  if (alerts.length === 0) {
    return null;
  }

  // Sort alerts by severity (highest first)
  const sortedAlerts = [...alerts].sort((a, b) => b.severity - a.severity);

  return (
    <div className="alerts-widget">
      <div className="widget-header">
        <h3>🔔 健康アラート</h3>
        <span className="alert-count">{alerts.length}件</span>
      </div>
      
      <div className="alerts-list">
        {sortedAlerts.map((alert) => (
          <div 
            key={alert.id}
            className={`alert-item ${alert.type}`}
            style={{ borderLeftColor: getAlertColor(alert.type) }}
          >
            <div className="alert-content">
              <div className="alert-header">
                <span className="alert-icon">
                  {getAlertIcon(alert.type)}
                </span>
                <span className="alert-category">
                  {getCategoryIcon(alert.category)} {getCategoryLabel(alert.category)}
                </span>
                <div className="alert-severity">
                  {'★'.repeat(alert.severity)}
                </div>
              </div>
              
              <div className="alert-message">
                {alert.message}
              </div>
              
              <div className="alert-footer">
                <span className="alert-time">
                  {alert.created.toLocaleString('ja-JP', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <button 
                  className="dismiss-btn"
                  onClick={() => onDismiss(alert.id)}
                  title="アラートを非表示"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {alerts.length > 3 && (
        <div className="alerts-summary">
          <p>重要度の高いアラートを優先的に表示しています。</p>
        </div>
      )}
    </div>
  );
};

export default AlertsWidget;