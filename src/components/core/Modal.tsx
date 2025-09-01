import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md' 
}) => {
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
      zIndex: 1000
    }}>
      <div style={{
        ...sizeStyles[size],
        width: '100%',
        backgroundColor: 'rgb(253, 246, 227)',
        border: '3px solid rgb(28, 28, 28)',
        boxShadow: '8px 8px 0px rgb(28, 28, 28)',
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
            <X size={20} color="rgb(253, 246, 227)" />
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
    </div>
  );
};

export default Modal;