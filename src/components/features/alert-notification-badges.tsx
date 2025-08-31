import React, { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, Clock, Zap, TrendingUp, TrendingDown, Eye, Star } from 'lucide-react';

const AlertBadgeShowcase = () => {
  const [currentSection, setCurrentSection] = useState('status');

  // Alert Status Badges
  const StatusBadge = ({ status, count, className = '' }) => {
    const configs = {
      active: {
        bg: 'rgb(34, 197, 94)',
        border: 'rgb(22, 163, 74)',
        text: 'rgb(253, 246, 227)',
        icon: CheckCircle,
        label: 'ACTIVE'
      },
      triggered: {
        bg: 'rgb(214, 40, 40)',
        border: 'rgb(185, 28, 28)',
        text: 'rgb(253, 246, 227)',
        icon: Zap,
        label: 'TRIGGERED'
      },
      expired: {
        bg: 'rgb(156, 163, 175)',
        border: 'rgb(107, 114, 128)',
        text: 'rgb(75, 85, 99)',
        icon: Clock,
        label: 'EXPIRED'
      },
      pending: {
        bg: 'rgb(247, 181, 56)',
        border: 'rgb(217, 119, 6)',
        text: 'rgb(28, 28, 28)',
        icon: AlertTriangle,
        label: 'PENDING'
      }
    };

    const config = configs[status];
    const Icon = config.icon;

    return (
      <div 
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: config.bg,
          color: config.text,
          padding: '4px 12px',
          border: `2px solid ${config.border}`,
          boxShadow: `3px 3px 0px ${config.border}`,
          fontFamily: 'system-ui, sans-serif',
          fontSize: '12px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          animation: status === 'triggered' ? 'pulse 2s infinite' : 'none'
        }}
      >
        <Icon size={14} />
        <span>{config.label}</span>
        {count > 0 && (
          <span style={{
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            padding: '2px 6px',
            borderRadius: '10px',
            fontSize: '10px',
            fontWeight: 'bold'
          }}>
            {count}
          </span>
        )}
      </div>
    );
  };

  // Notification Count Badges
  const NotificationBadge = ({ count, type = 'default', size = 'md' }) => {
    const sizeConfigs = {
      sm: { width: '18px', height: '18px', fontSize: '10px' },
      md: { width: '24px', height: '24px', fontSize: '12px' },
      lg: { width: '32px', height: '32px', fontSize: '14px' }
    };

    const typeConfigs = {
      default: { bg: 'rgb(214, 40, 40)', border: 'rgb(185, 28, 28)' },
      warning: { bg: 'rgb(247, 181, 56)', border: 'rgb(217, 119, 6)' },
      success: { bg: 'rgb(34, 197, 94)', border: 'rgb(22, 163, 74)' },
      info: { bg: 'rgb(0, 48, 73)', border: 'rgb(30, 64, 175)' }
    };

    const sizeConfig = sizeConfigs[size];
    const typeConfig = typeConfigs[type];

    return (
      <div style={{
        ...sizeConfig,
        backgroundColor: typeConfig.bg,
        border: `2px solid ${typeConfig.border}`,
        boxShadow: `2px 2px 0px ${typeConfig.border}`,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgb(253, 246, 227)',
        fontFamily: 'system-ui, sans-serif',
        fontWeight: '700',
        position: 'relative'
      }}>
        {count > 99 ? '99+' : count}
      </div>
    );
  };

  // Priority Level Badges
  const PriorityBadge = ({ level }) => {
    const configs = {
      low: {
        bg: 'rgb(34, 197, 94)',
        border: 'rgb(22, 163, 74)',
        text: 'rgb(253, 246, 227)',
        label: 'LOW',
        icon: '●'
      },
      medium: {
        bg: 'rgb(247, 181, 56)',
        border: 'rgb(217, 119, 6)',
        text: 'rgb(28, 28, 28)',
        label: 'MEDIUM',
        icon: '●●'
      },
      high: {
        bg: 'rgb(249, 115, 22)',
        border: 'rgb(194, 65, 12)',
        text: 'rgb(253, 246, 227)',
        label: 'HIGH',
        icon: '●●●'
      },
      urgent: {
        bg: 'rgb(214, 40, 40)',
        border: 'rgb(185, 28, 28)',
        text: 'rgb(253, 246, 227)',
        label: 'URGENT',
        icon: '⚡',
        pulse: true
      }
    };

    const config = configs[level];

    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: config.bg,
        color: config.text,
        padding: '6px 12px',
        border: `2px solid ${config.border}`,
        boxShadow: `3px 3px 0px ${config.border}`,
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        animation: config.pulse ? 'pulse 1.5s infinite' : 'none'
      }}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </div>
    );
  };

  // Live Status Badges
  const LiveBadge = ({ status, animated = true }) => {
    const configs = {
      online: {
        bg: 'rgb(34, 197, 94)',
        border: 'rgb(22, 163, 74)',
        text: 'rgb(253, 246, 227)',
        label: 'ONLINE',
        dot: true
      },
      updating: {
        bg: 'rgb(0, 48, 73)',
        border: 'rgb(30, 64, 175)',
        text: 'rgb(253, 246, 227)',
        label: 'UPDATING',
        spin: true
      },
      syncing: {
        bg: 'rgb(147, 51, 234)',
        border: 'rgb(126, 34, 206)',
        text: 'rgb(253, 246, 227)',
        label: 'SYNCING',
        pulse: true
      },
      offline: {
        bg: 'rgb(156, 163, 175)',
        border: 'rgb(107, 114, 128)',
        text: 'rgb(75, 85, 99)',
        label: 'OFFLINE'
      }
    };

    const config = configs[status];

    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: config.bg,
        color: config.text,
        padding: '4px 12px',
        border: `2px solid ${config.border}`,
        boxShadow: `2px 2px 0px ${config.border}`,
        fontFamily: 'system-ui, sans-serif',
        fontSize: '11px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {config.dot && (
          <div style={{
            width: '8px',
            height: '8px',
            backgroundColor: config.text,
            borderRadius: '50%',
            animation: animated && config.pulse ? 'pulse 2s infinite' : 'none'
          }} />
        )}
        {config.spin && (
          <div style={{
            width: '12px',
            height: '12px',
            border: `2px solid ${config.text}`,
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: animated ? 'spin 1s linear infinite' : 'none'
          }} />
        )}
        <span>{config.label}</span>
      </div>
    );
  };

  const sections = [
    { id: 'status', label: 'Alert Status' },
    { id: 'notifications', label: 'Notification Counts' },
    { id: 'priority', label: 'Priority Levels' },
    { id: 'live', label: 'Live Status' },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'rgb(253, 246, 227)',
      fontFamily: 'system-ui, sans-serif',
      padding: '32px 16px'
    }}>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{
          fontFamily: 'Impact, "Arial Black", sans-serif',
          fontSize: '48px',
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          color: 'rgb(214, 40, 40)',
          margin: '0 0 16px 0',
          textShadow: '3px 3px 0px rgb(28, 28, 28)'
        }}>
          Alert & Notification Badges
        </h1>
        <p style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '18px',
          color: 'rgb(28, 28, 28)',
          opacity: 0.7,
          margin: 0
        }}>
          Status indicators, counts, and priority levels
        </p>
      </div>

      {/* Section Navigation */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setCurrentSection(section.id)}
              style={{
                fontFamily: 'Impact, "Arial Black", sans-serif',
                fontSize: '12px',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                border: '3px solid rgb(28, 28, 28)',
                padding: '8px 16px',
                cursor: 'pointer',
                backgroundColor: currentSection === section.id ? 'rgb(214, 40, 40)' : 'rgb(253, 246, 227)',
                color: currentSection === section.id ? 'rgb(253, 246, 227)' : 'rgb(28, 28, 28)',
                boxShadow: currentSection === section.id ? '6px 6px 0px rgb(28, 28, 28)' : '3px 3px 0px rgb(28, 28, 28)',
                transform: currentSection === section.id ? 'translate(-2px, -2px)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Alert Status Badges */}
        {currentSection === 'status' && (
          <div style={{
            backgroundColor: 'rgb(253, 246, 227)',
            border: '3px solid rgb(28, 28, 28)',
            boxShadow: '6px 6px 0px rgb(28, 28, 28)',
            padding: '32px',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontFamily: 'Impact, "Arial Black", sans-serif',
              fontSize: '24px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'rgb(28, 28, 28)',
              margin: '0 0 24px 0',
              textAlign: 'center'
            }}>
              Alert Status Badges
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Active Alerts
                </h4>
                <StatusBadge status="active" count={5} />
                <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
                  Currently monitoring for changes
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Triggered Alerts
                </h4>
                <StatusBadge status="triggered" count={3} />
                <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
                  Conditions met, requires attention
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Expired Alerts
                </h4>
                <StatusBadge status="expired" count={2} />
                <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
                  Past expiration date
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Pending Setup
                </h4>
                <StatusBadge status="pending" count={1} />
                <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
                  Waiting for configuration
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notification Count Badges */}
        {currentSection === 'notifications' && (
          <div style={{
            backgroundColor: 'rgb(253, 246, 227)',
            border: '3px solid rgb(28, 28, 28)',
            boxShadow: '6px 6px 0px rgb(28, 28, 28)',
            padding: '32px',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontFamily: 'Impact, "Arial Black", sans-serif',
              fontSize: '24px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'rgb(28, 28, 28)',
              margin: '0 0 24px 0',
              textAlign: 'center'
            }}>
              Notification Count Badges
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
              <div>
                <h4 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                  Sizes
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  <span style={{ minWidth: '60px', fontSize: '14px' }}>Small:</span>
                  <NotificationBadge count={5} size="sm" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  <span style={{ minWidth: '60px', fontSize: '14px' }}>Medium:</span>
                  <NotificationBadge count={12} size="md" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ minWidth: '60px', fontSize: '14px' }}>Large:</span>
                  <NotificationBadge count={99} size="lg" />
                </div>
              </div>

              <div>
                <h4 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                  Types
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  <span style={{ minWidth: '70px', fontSize: '14px' }}>Default:</span>
                  <NotificationBadge count={8} type="default" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  <span style={{ minWidth: '70px', fontSize: '14px' }}>Warning:</span>
                  <NotificationBadge count={3} type="warning" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  <span style={{ minWidth: '70px', fontSize: '14px' }}>Success:</span>
                  <NotificationBadge count={15} type="success" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ minWidth: '70px', fontSize: '14px' }}>Info:</span>
                  <NotificationBadge count={42} type="info" />
                </div>
              </div>

              <div>
                <h4 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                  Usage Examples
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '12px', backgroundColor: 'rgb(0, 48, 73)', color: 'rgb(253, 246, 227)' }}>
                  <Bell size={20} />
                  <span>Notifications</span>
                  <div style={{ marginLeft: 'auto', position: 'relative' }}>
                    <NotificationBadge count={7} size="sm" />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'rgba(0, 48, 73, 0.1)', border: '2px solid rgb(0, 48, 73)' }}>
                  <Star size={20} color="rgb(0, 48, 73)" />
                  <span style={{ color: 'rgb(28, 28, 28)' }}>Wishlist Items</span>
                  <div style={{ marginLeft: 'auto', position: 'relative' }}>
                    <NotificationBadge count={23} type="warning" size="sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Priority Level Badges */}
        {currentSection === 'priority' && (
          <div style={{
            backgroundColor: 'rgb(253, 246, 227)',
            border: '3px solid rgb(28, 28, 28)',
            boxShadow: '6px 6px 0px rgb(28, 28, 28)',
            padding: '32px',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontFamily: 'Impact, "Arial Black", sans-serif',
              fontSize: '24px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'rgb(28, 28, 28)',
              margin: '0 0 24px 0',
              textAlign: 'center'
            }}>
              Priority Level Badges
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Low Priority
                </h4>
                <PriorityBadge level="low" />
                <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
                  Non-critical alerts
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Medium Priority
                </h4>
                <PriorityBadge level="medium" />
                <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
                  Standard importance
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  High Priority
                </h4>
                <PriorityBadge level="high" />
                <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
                  Important alerts
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Urgent Priority
                </h4>
                <PriorityBadge level="urgent" />
                <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
                  Immediate attention required
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Live Status Badges */}
        {currentSection === 'live' && (
          <div style={{
            backgroundColor: 'rgb(253, 246, 227)',
            border: '3px solid rgb(28, 28, 28)',
            boxShadow: '6px 6px 0px rgb(28, 28, 28)',
            padding: '32px',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontFamily: 'Impact, "Arial Black", sans-serif',
              fontSize: '24px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'rgb(28, 28, 28)',
              margin: '0 0 24px 0',
              textAlign: 'center'
            }}>
              Live Status Badges
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Online Status
                </h4>
                <LiveBadge status="online" />
                <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
                  System operational
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Updating Data
                </h4>
                <LiveBadge status="updating" />
                <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
                  Fetching latest prices
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Syncing eBay
                </h4>
                <LiveBadge status="syncing" />
                <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
                  Synchronizing with eBay
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Offline Mode
                </h4>
                <LiveBadge status="offline" animated={false} />
                <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
                  Connection unavailable
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AlertBadgeShowcase;