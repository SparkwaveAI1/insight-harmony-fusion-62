/**
 * Security logging utility for monitoring security events
 */

export interface SecurityEvent {
  type: 'auth_failure' | 'unauthorized_access' | 'api_key_usage' | 'suspicious_activity';
  userId?: string;
  details: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  source?: string;
}

class SecurityLogger {
  private events: SecurityEvent[] = [];
  private maxEvents = 1000; // Keep last 1000 events in memory

  logEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };

    this.events.push(securityEvent);
    
    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[SECURITY] ${event.type}:`, event.details);
    }

    // In production, you might want to send to external monitoring service
    if (event.severity === 'high') {
      this.handleHighSeverityEvent(securityEvent);
    }
  }

  private handleHighSeverityEvent(event: SecurityEvent): void {
    // In a real app, you would send this to your monitoring service
    console.error('[HIGH SEVERITY SECURITY EVENT]', event);
  }

  getRecentEvents(count = 50): SecurityEvent[] {
    return this.events.slice(-count);
  }

  getEventsByType(type: SecurityEvent['type']): SecurityEvent[] {
    return this.events.filter(event => event.type === type);
  }

  clearEvents(): void {
    this.events = [];
  }
}

export const securityLogger = new SecurityLogger();

// Helper functions for common security events
export const logAuthFailure = (details: string, userId?: string) => {
  securityLogger.logEvent({
    type: 'auth_failure',
    userId,
    details,
    severity: 'medium'
  });
};

export const logUnauthorizedAccess = (details: string, userId?: string) => {
  securityLogger.logEvent({
    type: 'unauthorized_access',
    userId,
    details,
    severity: 'high'
  });
};

export const logApiKeyUsage = (service: string, userId?: string) => {
  securityLogger.logEvent({
    type: 'api_key_usage',
    userId,
    details: `API key used for service: ${service}`,
    severity: 'low',
    source: service
  });
};

export const logSuspiciousActivity = (details: string, userId?: string) => {
  securityLogger.logEvent({
    type: 'suspicious_activity',
    userId,
    details,
    severity: 'high'
  });
};
