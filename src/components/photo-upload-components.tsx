import React, { useState } from 'react';
import { Upload, Camera, Image, RotateCw, Crop, Sun, X, Plus, Eye, Download } from 'lucide-react';

const PhotoUploadShowcase = () => {
  const [currentSection, setCurrentSection] = useState('dropzone');
  const [uploadedImages, setUploadedImages] = useState([
    { id: 1, name: 'front-cover.jpg', type: 'front', url: '/api/placeholder/200/300', size: '2.4 MB' },
    { id: 2, name: 'back-cover.jpg', type: 'back', url: '/api/placeholder/200/300', size: '1.8 MB' },
    { id: 3, name: 'spine.jpg', type: 'spine', url: '/api/placeholder/100/300', size: '1.2 MB' }
  ]);

  // Drag and Drop Zone
  const DropZone = ({ variant = 'default', size = 'md', multiple = true }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const sizeConfigs = {
      sm: { minHeight: '120px', padding: '16px' },
      md: { minHeight: '200px', padding: '32px' },
      lg: { minHeight: '300px', padding: '48px' }
    };

    const variantConfigs = {
      default: {
        bg: 'rgb(253, 246, 227)',
        border: 'rgb(28, 28, 28)',
        hoverBg: 'rgba(247, 181, 56, 0.1)'
      },
      compact: {
        bg: 'rgba(247, 181, 56, 0.05)',
        border: 'rgb(247, 181, 56)',
        hoverBg: 'rgba(247, 181, 56, 0.2)'
      }
    };

    const config = variantConfigs[variant];
    const sizeConfig = sizeConfigs[size];

    const handleFileSelect = () => {
      setIsUploading(true);
      setTimeout(() => setIsUploading(false), 2000);
    };

    return (
      <div
        style={{
          ...sizeConfig,
          backgroundColor: isDragOver ? config.hoverBg : config.bg,
          border: `3px dashed ${config.border}`,
          boxShadow: isDragOver ? `6px 6px 0px ${config.border}` : `3px 3px 0px ${config.border}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          position: 'relative'
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFileSelect();
        }}
        onClick={handleFileSelect}
      >
        {isUploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '4px solid rgb(247, 181, 56)',
              borderTop: '4px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '14px',
              fontWeight: '600',
              color: 'rgb(28, 28, 28)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              UPLOADING...
            </span>
          </div>
        ) : (
          <>
            <Upload size={48} color={isDragOver ? 'rgb(247, 181, 56)' : 'rgb(107, 114, 128)'} />
            <h3 style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '18px',
              fontWeight: '600',
              color: 'rgb(28, 28, 28)',
              margin: '16px 0 8px 0'
            }}>
              {isDragOver ? 'Drop files here' : 'Upload Comic Photos'}
            </h3>
            <p style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '14px',
              color: 'rgb(107, 114, 128)',
              margin: '0 0 16px 0'
            }}>
              Drag and drop images here, or click to select files
            </p>
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <span style={{
                backgroundColor: 'rgb(247, 181, 56)',
                color: 'rgb(28, 28, 28)',
                padding: '4px 8px',
                border: '2px solid rgb(217, 119, 6)',
                boxShadow: '2px 2px 0px rgb(217, 119, 6)',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '11px',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                JPG
              </span>
              <span style={{
                backgroundColor: 'rgb(247, 181, 56)',
                color: 'rgb(28, 28, 28)',
                padding: '4px 8px',
                border: '2px solid rgb(217, 119, 6)',
                boxShadow: '2px 2px 0px rgb(217, 119, 6)',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '11px',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                PNG
              </span>
              <span style={{
                backgroundColor: 'rgb(247, 181, 56)',
                color: 'rgb(28, 28, 28)',
                padding: '4px 8px',
                border: '2px solid rgb(217, 119, 6)',
                boxShadow: '2px 2px 0px rgb(217, 119, 6)',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '11px',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                HEIC
              </span>
            </div>
            {multiple && (
              <p style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '12px',
                color: 'rgb(107, 114, 128)',
                margin: '12px 0 0 0'
              }}>
                Multiple files supported • Max 10MB each
              </p>
            )}
          </>
        )}

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  };

  // Image Preview Thumbnail
  const ImageThumbnail = ({ image, onRemove, onEdit, size = 'md' }) => {
    const [isHovered, setIsHovered] = useState(false);

    const sizeConfigs = {
      sm: { width: '80px', height: '120px' },
      md: image.type === 'spine' ? { width: '60px', height: '180px' } : { width: '120px', height: '180px' },
      lg: image.type === 'spine' ? { width: '80px', height: '240px' } : { width: '160px', height: '240px' }
    };

    const typeLabels = {
      front: { label: 'FRONT', color: 'rgb(34, 197, 94)' },
      back: { label: 'BACK', color: 'rgb(0, 119, 181)' },
      spine: { label: 'SPINE', color: 'rgb(147, 51, 234)' },
      detail: { label: 'DETAIL', color: 'rgb(249, 115, 22)' }
    };

    const config = sizeConfigs[size];
    const typeConfig = typeLabels[image.type] || typeLabels.detail;

    return (
      <div
        style={{
          position: 'relative',
          ...config,
          backgroundColor: 'rgb(253, 246, 227)',
          border: '2px solid rgb(28, 28, 28)',
          boxShadow: isHovered ? '4px 4px 0px rgb(28, 28, 28)' : '3px 3px 0px rgb(28, 28, 28)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          transform: isHovered ? 'translate(-1px, -1px)' : 'none'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image */}
        <img
          src={image.url}
          alt={image.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        {/* Type Badge */}
        <div style={{
          position: 'absolute',
          top: '4px',
          left: '4px',
          backgroundColor: typeConfig.color,
          color: 'rgb(255, 255, 255)',
          padding: '2px 6px',
          border: '1px solid rgb(28, 28, 28)',
          boxShadow: '1px 1px 0px rgb(28, 28, 28)',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '9px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {typeConfig.label}
        </div>

        {/* Hover Overlay */}
        {isHovered && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(image);
              }}
              style={{
                backgroundColor: 'rgb(247, 181, 56)',
                color: 'rgb(28, 28, 28)',
                border: '2px solid rgb(217, 119, 6)',
                boxShadow: '2px 2px 0px rgb(217, 119, 6)',
                padding: '6px',
                cursor: 'pointer'
              }}
            >
              <Crop size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove?.(image.id);
              }}
              style={{
                backgroundColor: 'rgb(214, 40, 40)',
                color: 'rgb(255, 255, 255)',
                border: '2px solid rgb(185, 28, 28)',
                boxShadow: '2px 2px 0px rgb(185, 28, 28)',
                padding: '6px',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* File Info */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'rgb(255, 255, 255)',
          padding: '4px',
          fontSize: '10px',
          textAlign: 'center'
        }}>
          {image.size}
        </div>
      </div>
    );
  };

  // Multi-Image Gallery
  const ImageGallery = ({ images, onReorder }) => {
    return (
      <div style={{
        backgroundColor: 'rgb(253, 246, 227)',
        border: '3px solid rgb(28, 28, 28)',
        boxShadow: '6px 6px 0px rgb(28, 28, 28)',
        padding: '16px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '2px solid rgb(28, 28, 28)'
        }}>
          <h3 style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            fontWeight: '600',
            color: 'rgb(28, 28, 28)',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Comic Images ({images.length})
          </h3>
          <button style={{
            backgroundColor: 'rgb(247, 181, 56)',
            color: 'rgb(28, 28, 28)',
            border: '2px solid rgb(217, 119, 6)',
            boxShadow: '2px 2px 0px rgb(217, 119, 6)',
            padding: '4px 8px',
            cursor: 'pointer',
            fontFamily: 'system-ui, sans-serif',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Plus size={14} />
            Add More
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '12px'
        }}>
          {images.map((image) => (
            <ImageThumbnail
              key={image.id}
              image={image}
              onRemove={(id) => {
                setUploadedImages(prev => prev.filter(img => img.id !== id));
              }}
              onEdit={(image) => console.log('Edit image:', image)}
            />
          ))}
        </div>
      </div>
    );
  };

  // Photo Editing Tools
  const PhotoEditingTools = ({ image }) => {
    const [brightness, setBrightness] = useState(100);
    const [rotation, setRotation] = useState(0);

    const tools = [
      { icon: RotateCw, label: 'Rotate', action: () => setRotation(prev => (prev + 90) % 360) },
      { icon: Crop, label: 'Crop', action: () => console.log('Crop') },
      { icon: Sun, label: 'Brightness', action: () => {} },
    ];

    return (
      <div style={{
        backgroundColor: 'rgb(253, 246, 227)',
        border: '3px solid rgb(28, 28, 28)',
        boxShadow: '6px 6px 0px rgb(28, 28, 28)',
        padding: '16px'
      }}>
        <h3 style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '16px',
          fontWeight: '600',
          color: 'rgb(28, 28, 28)',
          margin: '0 0 16px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Photo Editing Tools
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 250px', gap: '16px' }}>
          {/* Image Preview */}
          <div style={{
            backgroundColor: 'rgb(243, 244, 246)',
            border: '2px solid rgb(28, 28, 28)',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px'
          }}>
            <div style={{
              transform: `rotate(${rotation}deg)`,
              filter: `brightness(${brightness}%)`,
              transition: 'all 0.3s ease'
            }}>
              <img
                src="/api/placeholder/200/300"
                alt="Edit preview"
                style={{
                  maxWidth: '200px',
                  maxHeight: '300px',
                  objectFit: 'contain',
                  border: '2px solid rgb(28, 28, 28)'
                }}
              />
            </div>
          </div>

          {/* Tools Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Tool Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tools.map((tool, index) => (
                <button
                  key={index}
                  onClick={tool.action}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'rgb(253, 246, 227)',
                    color: 'rgb(28, 28, 28)',
                    border: '2px solid rgb(28, 28, 28)',
                    boxShadow: '3px 3px 0px rgb(28, 28, 28)',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '14px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translate(-1px, -1px)';
                    e.target.style.boxShadow = '4px 4px 0px rgb(28, 28, 28)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translate(0, 0)';
                    e.target.style.boxShadow = '3px 3px 0px rgb(28, 28, 28)';
                  }}
                >
                  <tool.icon size={16} />
                  {tool.label}
                </button>
              ))}
            </div>

            {/* Brightness Slider */}
            <div>
              <label style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '12px',
                fontWeight: '600',
                color: 'rgb(28, 28, 28)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'block',
                marginBottom: '8px'
              }}>
                Brightness: {brightness}%
              </label>
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(e.target.value)}
                style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'rgb(243, 244, 246)',
                  border: '2px solid rgb(28, 28, 28)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button style={{
                flex: 1,
                backgroundColor: 'rgb(34, 197, 94)',
                color: 'rgb(255, 255, 255)',
                border: '2px solid rgb(22, 163, 74)',
                boxShadow: '3px 3px 0px rgb(22, 163, 74)',
                padding: '8px',
                cursor: 'pointer',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                Save
              </button>
              <button style={{
                flex: 1,
                backgroundColor: 'rgb(107, 114, 128)',
                color: 'rgb(255, 255, 255)',
                border: '2px solid rgb(75, 85, 99)',
                boxShadow: '3px 3px 0px rgb(75, 85, 99)',
                padding: '8px',
                cursor: 'pointer',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Camera Capture Component
  const CameraCapture = () => {
    const [isCameraActive, setIsCameraActive] = useState(false);

    return (
      <div style={{
        backgroundColor: 'rgb(253, 246, 227)',
        border: '3px solid rgb(28, 28, 28)',
        boxShadow: '6px 6px 0px rgb(28, 28, 28)',
        padding: '24px',
        textAlign: 'center'
      }}>
        <h3 style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '18px',
          fontWeight: '600',
          color: 'rgb(28, 28, 28)',
          margin: '0 0 16px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Camera Capture
        </h3>

        {!isCameraActive ? (
          <div style={{
            backgroundColor: 'rgb(243, 244, 246)',
            border: '2px solid rgb(28, 28, 28)',
            minHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px'
          }}>
            <Camera size={64} color="rgb(107, 114, 128)" />
            <p style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '16px',
              color: 'rgb(107, 114, 128)',
              margin: 0
            }}>
              Take photos directly with your device camera
            </p>
            <button
              onClick={() => setIsCameraActive(true)}
              style={{
                backgroundColor: 'rgb(34, 197, 94)',
                color: 'rgb(255, 255, 255)',
                border: '2px solid rgb(22, 163, 74)',
                boxShadow: '3px 3px 0px rgb(22, 163, 74)',
                padding: '12px 24px',
                cursor: 'pointer',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Camera size={16} />
              Start Camera
            </button>
          </div>
        ) : (
          <div style={{
            backgroundColor: 'rgb(0, 0, 0)',
            border: '2px solid rgb(28, 28, 28)',
            minHeight: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <div style={{
              color: 'rgb(255, 255, 255)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                border: '3px solid rgb(255, 255, 255)',
                borderRadius: '50%',
                margin: '0 auto 16px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Camera size={24} />
              </div>
              <p>Camera preview would appear here</p>
            </div>
            
            {/* Camera Controls */}
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '12px'
            }}>
              <button style={{
                width: '60px',
                height: '60px',
                backgroundColor: 'rgb(255, 255, 255)',
                border: '3px solid rgb(28, 28, 28)',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: 'rgb(214, 40, 40)',
                  borderRadius: '50%'
                }} />
              </button>
              <button
                onClick={() => setIsCameraActive(false)}
                style={{
                  backgroundColor: 'rgb(107, 114, 128)',
                  color: 'rgb(255, 255, 255)',
                  border: '2px solid rgb(75, 85, 99)',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const sections = [
    { id: 'dropzone', label: 'Drop Zones' },
    { id: 'thumbnails', label: 'Image Preview' },
    { id: 'gallery', label: 'Multi-Image Gallery' },
    { id: 'editing', label: 'Photo Editing' },
    { id: 'camera', label: 'Camera Capture' },
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
          Photo Upload Components
        </h1>
        <p style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '18px',
          color: 'rgb(28, 28, 28)',
          opacity: 0.7,
          margin: 0
        }}>
          Comic condition documentation and image management
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

        {/* Drop Zones */}
        {currentSection === 'dropzone' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div>
              <h3 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>
                Default Drop Zone
              </h3>
              <DropZone variant="default" size="md" />
            </div>
            
            <div>
              <h3 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>
                Compact Version
              </h3>
              <DropZone variant="compact" size="sm" />
            </div>
          </div>
        )}

        {/* Image Preview */}
        {currentSection === 'thumbnails' && (
          <div>
            <h2 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '18px', fontWeight: '600', marginBottom: '24px', textAlign: 'center' }}>
              Image Preview Thumbnails
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              {uploadedImages.map((image) => (
                <ImageThumbnail
                  key={image.id}
                  image={image}
                  onRemove={(id) => console.log('Remove:', id)}
                  onEdit={(image) => console.log('Edit:', image)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Multi-Image Gallery */}
        {currentSection === 'gallery' && (
          <ImageGallery images={uploadedImages} />
        )}

        {/* Photo Editing */}
        {currentSection === 'editing' && (
          <PhotoEditingTools />
        )}

        {/* Camera Capture */}
        {currentSection === 'camera' && (
          <CameraCapture />
        )}

      </div>
    </div>
  );
};

export default PhotoUploadShowcase;