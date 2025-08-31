import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  AlertCircle,
  Trash2,
  Save,
  Eye,
  Star,
  DollarSign,
  Calendar,
  User,
  Mail,
  Bell
} from 'lucide-react';

const ModalDialogShowcase = () => {
  const [currentSection, setCurrentSection] = useState('basic');
  const [activeModal, setActiveModal] = useState(null);

  // Basic Modal Component
  const BasicModal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeStyles = {
      sm: { maxWidth: '400px' },
      md: { maxWidth: '600px' },
      lg: { maxWidth: '800px' },
      xl: { maxWidth: '1000px' }
    };

    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 1000,
        animation: 'fadeIn 0.2s ease'
      }}>
        <div style={{
          ...sizeStyles[size],
          width: '100%',
          backgroundColor: 'rgb(253, 246, 227)',
          border: '3px solid rgb(28, 28, 28)',
          boxShadow: '8px 8px 0px rgb(28, 28, 28)',
          animation: 'slideUp 0.3s ease',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{
            padding: '20px',
            borderBottom: '3px solid rgb(28, 28, 28)',
            background: 'linear-gradient(to right, rgba(247, 181, 56, 0.2), transparent)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{
              fontFamily: 'Impact, "Arial Black", sans-serif',
              fontSize: '24px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'rgb(28, 28, 28)',
              margin: 0
            }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                backgroundColor: 'rgb(214, 40, 40)',
                border: '2px solid rgb(28, 28, 28)',
                boxShadow: '2px 2px 0px rgb(28, 28, 28)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-1px, -1px)';
                e.currentTarget.style.boxShadow = '3px 3px 0px rgb(28, 28, 28)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '2px 2px 0px rgb(28, 28, 28)';
              }}
            >
              <X size={20} color="white" />
            </button>
          </div>

          {/* Content */}
          <div style={{
            padding: '24px',
            overflowY: 'auto',
            flex: 1
          }}>
            {children}
          </div>
        </div>

        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { 
                opacity: 0;
                transform: translateY(20px);
              }
              to { 
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}
        </style>
      </div>
    );
  };

  // Confirmation Dialog
  const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, type = 'warning' }) => {
    if (!isOpen) return null;

    const typeConfigs = {
      warning: {
        icon: AlertTriangle,
        color: 'rgb(247, 181, 56)',
        bgColor: 'rgba(247, 181, 56, 0.1)'
      },
      danger: {
        icon: AlertCircle,
        color: 'rgb(214, 40, 40)',
        bgColor: 'rgba(214, 40, 40, 0.1)'
      },
      success: {
        icon: CheckCircle,
        color: 'rgb(34, 197, 94)',
        bgColor: 'rgba(34, 197, 94, 0.1)'
      },
      info: {
        icon: Info,
        color: 'rgb(59, 130, 246)',
        bgColor: 'rgba(59, 130, 246, 0.1)'
      }
    };

    const config = typeConfigs[type];
    const Icon = config.icon;

    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 1000
      }}>
        <div style={{
          maxWidth: '400px',
          width: '100%',
          backgroundColor: 'rgb(253, 246, 227)',
          border: '3px solid rgb(28, 28, 28)',
          boxShadow: '8px 8px 0px rgb(28, 28, 28)',
          animation: 'slideUp 0.3s ease'
        }}>
          {/* Icon & Title */}
          <div style={{
            padding: '24px',
            borderBottom: '2px solid rgb(28, 28, 28)',
            background: config.bgColor
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: config.color,
                border: '3px solid rgb(28, 28, 28)',
                boxShadow: '3px 3px 0px rgb(28, 28, 28)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon size={24} color="white" />
              </div>
              <h3 style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '18px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'rgb(28, 28, 28)',
                margin: 0
              }}>
                {title}
              </h3>
            </div>
          </div>

          {/* Message */}
          <div style={{
            padding: '24px',
            fontFamily: 'system-ui, sans-serif',
            fontSize: '14px',
            lineHeight: '1.6',
            color: 'rgb(28, 28, 28)'
          }}>
            {message}
          </div>

          {/* Actions */}
          <div style={{
            padding: '20px',
            borderTop: '2px solid rgb(28, 28, 28)',
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(to bottom, rgb(245, 245, 245), rgb(230, 230, 230))',
                color: 'rgb(28, 28, 28)',
                border: '3px solid rgb(28, 28, 28)',
                boxShadow: '3px 3px 0px rgb(28, 28, 28)',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-1px, -1px)';
                e.currentTarget.style.boxShadow = '4px 4px 0px rgb(28, 28, 28)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '3px 3px 0px rgb(28, 28, 28)';
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              style={{
                padding: '10px 20px',
                background: type === 'danger' 
                  ? 'linear-gradient(135deg, rgb(214, 40, 40), rgb(185, 28, 28))'
                  : `linear-gradient(135deg, ${config.color}, ${config.color}dd)`,
                color: 'rgb(255, 255, 255)',
                border: '3px solid rgb(28, 28, 28)',
                boxShadow: '3px 3px 0px rgb(28, 28, 28)',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-1px, -1px)';
                e.currentTarget.style.boxShadow = '4px 4px 0px rgb(28, 28, 28)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '3px 3px 0px rgb(28, 28, 28)';
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Comic Detail Modal
  const ComicDetailModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <BasicModal
        isOpen={isOpen}
        onClose={onClose}
        title="Amazing Spider-Man #1"
        size="lg"
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          {/* Comic Cover */}
          <div>
            <div style={{
              backgroundColor: 'rgb(229, 231, 235)',
              border: '3px solid rgb(28, 28, 28)',
              boxShadow: '4px 4px 0px rgb(28, 28, 28)',
              height: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: 'rgb(107, 114, 128)'
            }}>
              Comic Cover Image
            </div>
            
            {/* Quick Actions */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              marginTop: '16px'
            }}>
              <button style={{
                padding: '8px',
                background: 'linear-gradient(135deg, rgb(247, 181, 56), rgb(245, 158, 11))',
                color: 'rgb(28, 28, 28)',
                border: '2px solid rgb(28, 28, 28)',
                boxShadow: '2px 2px 0px rgb(28, 28, 28)',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}>
                <Star size={14} />
                Wishlist
              </button>
              <button style={{
                padding: '8px',
                background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))',
                color: 'rgb(255, 255, 255)',
                border: '2px solid rgb(28, 28, 28)',
                boxShadow: '2px 2px 0px rgb(28, 28, 28)',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}>
                <Bell size={14} />
                Alert
              </button>
            </div>
          </div>

          {/* Comic Details */}
          <div>
            {/* Key Info */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                padding: '12px',
                background: 'linear-gradient(to bottom, rgb(240, 253, 244), rgb(220, 252, 231))',
                border: '2px solid rgb(28, 28, 28)',
                boxShadow: '2px 2px 0px rgb(28, 28, 28)'
              }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  color: 'rgb(107, 114, 128)',
                  marginBottom: '4px'
                }}>
                  Market Value
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: 'rgb(34, 197, 94)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <DollarSign size={20} />
                  850.00
                </div>
              </div>

              <div style={{
                padding: '12px',
                background: 'linear-gradient(to bottom, rgb(240, 249, 255), rgb(224, 242, 254))',
                border: '2px solid rgb(28, 28, 28)',
                boxShadow: '2px 2px 0px rgb(28, 28, 28)'
              }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  color: 'rgb(107, 114, 128)',
                  marginBottom: '4px'
                }}>
                  Published
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: 'rgb(59, 130, 246)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Calendar size={16} />
                  March 1963
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{
              marginBottom: '24px'
            }}>
              <h4 style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'rgb(28, 28, 28)',
                marginBottom: '8px'
              }}>
                Description
              </h4>
              <p style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                lineHeight: '1.6',
                color: 'rgb(75, 85, 99)'
              }}>
                The first appearance of Spider-Man! Follow Peter Parker as he gains his amazing spider powers 
                and learns that with great power comes great responsibility. This key issue marks the beginning 
                of Marvel's most iconic superhero.
              </p>
            </div>

            {/* Details Table */}
            <div style={{
              border: '2px solid rgb(28, 28, 28)',
              boxShadow: '2px 2px 0px rgb(28, 28, 28)'
            }}>
              <div style={{
                padding: '8px 12px',
                backgroundColor: 'rgb(0, 48, 73)',
                color: 'rgb(253, 246, 227)',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Issue Details
              </div>
              {[
                { label: 'Publisher', value: 'Marvel Comics' },
                { label: 'Writer', value: 'Stan Lee' },
                { label: 'Artist', value: 'Steve Ditko' },
                { label: 'Pages', value: '36' },
                { label: 'Key Issue', value: 'Yes - First Appearance' }
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderBottom: index < 4 ? '1px solid rgba(28, 28, 28, 0.1)' : 'none',
                    backgroundColor: index % 2 === 0 ? 'rgba(247, 181, 56, 0.05)' : 'transparent'
                  }}
                >
                  <span style={{
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: 'rgb(107, 114, 128)'
                  }}>
                    {item.label}:
                  </span>
                  <span style={{
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: 'rgb(28, 28, 28)'
                  }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '2px solid rgb(28, 28, 28)'
        }}>
          <button style={{
            flex: 1,
            padding: '12px',
            background: 'linear-gradient(135deg, rgb(214, 40, 40), rgb(185, 28, 28))',
            color: 'rgb(253, 246, 227)',
            border: '3px solid rgb(28, 28, 28)',
            boxShadow: '3px 3px 0px rgb(28, 28, 28)',
            fontFamily: 'system-ui, sans-serif',
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <Eye size={16} />
            View on eBay
          </button>
          <button style={{
            flex: 1,
            padding: '12px',
            background: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235))',
            color: 'rgb(253, 246, 227)',
            border: '3px solid rgb(28, 28, 28)',
            boxShadow: '3px 3px 0px rgb(28, 28, 28)',
            fontFamily: 'system-ui, sans-serif',
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <Save size={16} />
            Add to Collection
          </button>
        </div>
      </BasicModal>
    );
  };

  // Toast Notification
  const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, duration);

      return () => clearTimeout(timer);
    }, [duration, onClose]);

    const typeConfigs = {
      success: {
        icon: CheckCircle,
        bg: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))',
        border: 'rgb(22, 163, 74)'
      },
      error: {
        icon: AlertCircle,
        bg: 'linear-gradient(135deg, rgb(214, 40, 40), rgb(185, 28, 28))',
        border: 'rgb(185, 28, 28)'
      },
      warning: {
        icon: AlertTriangle,
        bg: 'linear-gradient(135deg, rgb(247, 181, 56), rgb(245, 158, 11))',
        border: 'rgb(245, 158, 11)'
      },
      info: {
        icon: Info,
        bg: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235))',
        border: 'rgb(37, 99, 235)'
      }
    };

    const config = typeConfigs[type];
    const Icon = config.icon;

    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        minWidth: '300px',
        maxWidth: '400px',
        background: config.bg,
        border: `3px solid ${config.border}`,
        boxShadow: '4px 4px 0px rgb(28, 28, 28)',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: 'white',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        fontWeight: '600',
        zIndex: 2000,
        animation: isVisible ? 'slideInRight 0.3s ease' : 'slideOutRight 0.3s ease'
      }}>
        <Icon size={20} />
        <span style={{ flex: 1 }}>{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.5)',
            padding: '4px',
            cursor: 'pointer',
            display: 'flex'
          }}
        >
          <X size={14} />
        </button>

        <style>
          {`
            @keyframes slideInRight {
              from { 
                opacity: 0;
                transform: translateX(100%);
              }
              to { 
                opacity: 1;
                transform: translateX(0);
              }
            }
            @keyframes slideOutRight {
              from { 
                opacity: 1;
                transform: translateX(0);
              }
              to { 
                opacity: 0;
                transform: translateX(100%);
              }
            }
          `}
        </style>
      </div>
    );
  };

  const sections = [
    { id: 'basic', label: 'Basic Modal' },
    { id: 'confirm', label: 'Confirm Dialog' },
    { id: 'detail', label: 'Comic Detail' },
    { id: 'toast', label: 'Toast Alerts' },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'rgb(253, 246, 227)',
      fontFamily: 'system-ui, sans-serif',
      padding: '32px 16px'
    }}>
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
          Modal & Dialog Components
        </h1>
        <p style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '18px',
          color: 'rgb(28, 28, 28)',
          opacity: 0.7,
          margin: 0
        }}>
          Popups, confirmations, details, and notifications
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
                fontFamily: 'system-ui, sans-serif',
                fontSize: '12px',
                fontWeight: '600',
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

        {/* Basic Modal */}
        {currentSection === 'basic' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center' }}>
            <button
              onClick={() => setActiveModal('basic')}
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, rgb(214, 40, 40), rgb(185, 28, 28))',
                color: 'rgb(253, 246, 227)',
                border: '3px solid rgb(28, 28, 28)',
                boxShadow: '3px 3px 0px rgb(28, 28, 28)',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                cursor: 'pointer'
              }}
            >
              Open Basic Modal
            </button>

            <BasicModal
              isOpen={activeModal === 'basic'}
              onClose={() => setActiveModal(null)}
              title="Basic Modal Example"
              size="md"
            >
              <p style={{ marginBottom: '16px' }}>
                This is a basic modal component with a header, content area, and close button. 
                It can be used for forms, information display, or any content that needs focus.
              </p>
              <div style={{
                padding: '16px',
                background: 'linear-gradient(to bottom, rgba(247, 181, 56, 0.1), rgba(247, 181, 56, 0.05))',
                border: '2px solid rgb(247, 181, 56)',
                marginBottom: '16px'
              }}>
                <h4 style={{ margin: '0 0 8px 0' }}>Features:</h4>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>Multiple size options (sm, md, lg, xl)</li>
                  <li>Scrollable content area</li>
                  <li>Backdrop click to close</li>
                  <li>Fade in/slide up animation</li>
                </ul>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))',
                  color: 'white',
                  border: '3px solid rgb(28, 28, 28)',
                  boxShadow: '3px 3px 0px rgb(28, 28, 28)',
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: '14px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  cursor: 'pointer'
                }}>
                  Save Changes
                </button>
              </div>
            </BasicModal>
          </div>
        )}

        {/* Confirm Dialog */}
        {currentSection === 'confirm' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            <button
              onClick={() => setActiveModal('confirm-warning')}
              style={{
                padding: '16px',
                background: 'linear-gradient(135deg, rgb(247, 181, 56), rgb(245, 158, 11))',
                color: 'rgb(28, 28, 28)',
                border: '3px solid rgb(28, 28, 28)',
                boxShadow: '3px 3px 0px rgb(28, 28, 28)',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              Warning Dialog
            </button>

            <button
              onClick={() => setActiveModal('confirm-danger')}
              style={{
                padding: '16px',
                background: 'linear-gradient(135deg, rgb(214, 40, 40), rgb(185, 28, 28))',
                color: 'white',
                border: '3px solid rgb(28, 28, 28)',
                boxShadow: '3px 3px 0px rgb(28, 28, 28)',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              Danger Dialog
            </button>

            <button
              onClick={() => setActiveModal('confirm-success')}
              style={{
                padding: '16px',
                background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))',
                color: 'white',
                border: '3px solid rgb(28, 28, 28)',
                boxShadow: '3px 3px 0px rgb(28, 28, 28)',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              Success Dialog
            </button>

            <button
              onClick={() => setActiveModal('confirm-info')}
              style={{
                padding: '16px',
                background: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235))',
                color: 'white',
                border: '3px solid rgb(28, 28, 28)',
                boxShadow: '3px 3px 0px rgb(28, 28, 28)',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              Info Dialog
            </button>

            <ConfirmDialog
              isOpen={activeModal === 'confirm-warning'}
              onClose={() => setActiveModal(null)}
              onConfirm={() => console.log('Confirmed!')}
              title="Warning"
              message="This action may affect your collection tracking. Are you sure you want to proceed?"
              type="warning"
            />

            <ConfirmDialog
              isOpen={activeModal === 'confirm-danger'}
              onClose={() => setActiveModal(null)}
              onConfirm={() => console.log('Deleted!')}
              title="Delete Comic"
              message="Are you sure you want to remove this comic from your collection? This action cannot be undone."
              type="danger"
            />

            <ConfirmDialog
              isOpen={activeModal === 'confirm-success'}
              onClose={() => setActiveModal(null)}
              onConfirm={() => console.log('Success!')}
              title="Success!"
              message="Your comic has been successfully added to the collection. Would you like to add another?"
              type="success"
            />

            <ConfirmDialog
              isOpen={activeModal === 'confirm-info'}
              onClose={() => setActiveModal(null)}
              onConfirm={() => console.log('Info acknowledged')}
              title="Information"
              message="New price alerts are available for comics in your wishlist. Would you like to review them now?"
              type="info"
            />
          </div>
        )}

        {/* Comic Detail Modal */}
        {currentSection === 'detail' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center' }}>
            <button
              onClick={() => setActiveModal('detail')}
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235))',
                color: 'rgb(253, 246, 227)',
                border: '3px solid rgb(28, 28, 28)',
                boxShadow: '3px 3px 0px rgb(28, 28, 28)',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '16px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                cursor: 'pointer'
              }}
            >
              View Comic Details
            </button>

            <ComicDetailModal
              isOpen={activeModal === 'detail'}
              onClose={() => setActiveModal(null)}
            />

            <div style={{
              padding: '24px',
              background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
              border: '3px solid rgb(28, 28, 28)',
              boxShadow: '6px 6px 0px rgb(28, 28, 28)',
              maxWidth: '600px',
              width: '100%'
            }}>
              <h4 style={{ marginBottom: '16px' }}>Comic Detail Features:</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Large cover image display</li>
                <li>Key information cards (value, date)</li>
                <li>Detailed issue information table</li>
                <li>Quick action buttons (wishlist, alert)</li>
                <li>External links (eBay, add to collection)</li>
              </ul>
            </div>
          </div>
        )}

        {/* Toast Notifications */}
        {currentSection === 'toast' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            <button
              onClick={() => {
                setActiveModal('toast-success');
                setTimeout(() => setActiveModal(null), 3000);
              }}
              style={{
                padding: '16px',
                background: 'linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74))',
                color: 'white',
                border: '3px solid rgb(28, 28, 28)',
                boxShadow: '3px 3px 0px rgb(28, 28, 28)',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              Success Toast
            </button>

            <button
              onClick={() => {
                setActiveModal('toast-error');
                setTimeout(() => setActiveModal(null), 3000);
              }}
              style={{
                padding: '16px',
                background: 'linear-gradient(135deg, rgb(214, 40, 40), rgb(185, 28, 28))',
                color: 'white',
                border: '3px solid rgb(28, 28, 28)',
                boxShadow: '3px 3px 0px rgb(28, 28, 28)',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              Error Toast
            </button>

            <button
              onClick={() => {
                setActiveModal('toast-warning');
                setTimeout(() => setActiveModal(null), 3000);
              }}
              style={{
                padding: '16px',
                background: 'linear-gradient(135deg, rgb(247, 181, 56), rgb(245, 158, 11))',
                color: 'rgb(28, 28, 28)',
                border: '3px solid rgb(28, 28, 28)',
                boxShadow: '3px 3px 0px rgb(28, 28, 28)',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              Warning Toast
            </button>

            <button
              onClick={() => {
                setActiveModal('toast-info');
                setTimeout(() => setActiveModal(null), 3000);
              }}
              style={{
                padding: '16px',
                background: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235))',
                color: 'white',
                border: '3px solid rgb(28, 28, 28)',
                boxShadow: '3px 3px 0px rgb(28, 28, 28)',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              Info Toast
            </button>

            {activeModal === 'toast-success' && (
              <Toast
                message="Comic successfully added to your collection!"
                type="success"
                onClose={() => setActiveModal(null)}
              />
            )}

            {activeModal === 'toast-error' && (
              <Toast
                message="Failed to update comic. Please try again."
                type="error"
                onClose={() => setActiveModal(null)}
              />
            )}

            {activeModal === 'toast-warning' && (
              <Toast
                message="Price alert triggered for Amazing Spider-Man #1"
                type="warning"
                onClose={() => setActiveModal(null)}
              />
            )}

            {activeModal === 'toast-info' && (
              <Toast
                message="New comics matching your interests are available"
                type="info"
                onClose={() => setActiveModal(null)}
              />
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ModalDialogShowcase;