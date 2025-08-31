// ========================================
// COMICSCOUTUK MASTER CODE STANDARDS
// Everything confirmed and approved for handover
// ========================================

// ========================================
// 1. TAILWIND CONFIG (EXACT CONFIRMED VERSION)
// ========================================

// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ComicScoutUK CONFIRMED Color Palette
        'parchment': '#FDF6E3',
        'ink-black': '#1C1C1C',
        'stan-lee-blue': '#003049',
        'kirby-red': '#D62828',
        'golden-age-yellow': '#F7B538',
      },
      fontFamily: {
        // CONFIRMED: Bangers for headings, Inter for body
        'bangers': ['Bangers', 'cursive'],
        'inter': ['Inter', 'sans-serif'],
      },
      boxShadow: {
        // CONFIRMED: Comic-style shadows
        'comic': '6px 6px 0px #1C1C1C',
        'comic-sm': '3px 3px 0px #1C1C1C',
        'comic-lg': '8px 8px 0px #1C1C1C',
        'comic-hover': '4px 4px 0px #1C1C1C', // CONFIRMED: Subtle hover
      },
      borderWidth: {
        'comic': '3px',
      },
    },
  },
  plugins: [
    // CONFIRMED: Global comic utilities
    function({ addUtilities }: { addUtilities: any }) {
      const newUtilities = {
        '.comic-border': {
          border: '3px solid #1C1C1C',
          boxShadow: '6px 6px 0px #1C1C1C',
        },
        '.comic-button': {
          backgroundColor: '#D62828',
          color: '#FDF6E3',
          border: '3px solid #1C1C1C',
          boxShadow: '6px 6px 0px #1C1C1C',
          fontFamily: 'system-ui, sans-serif', // CONFIRMED: Readable font
          fontWeight: '600',
          padding: '12px 24px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          '&:hover': {
            transform: 'translate(-2px, -2px)', // CONFIRMED: Subtle movement
            boxShadow: '4px 4px 0px #1C1C1C',
          },
          '&:active': {
            transform: 'translate(1px, 1px)',
            boxShadow: '2px 2px 0px #1C1C1C',
          },
          '&:disabled': {
            backgroundColor: '#9CA3AF',
            cursor: 'not-allowed',
            opacity: '0.6',
            transform: 'none',
            boxShadow: '6px 6px 0px #1C1C1C',
          },
        },
        '.comic-heading': {
          fontFamily: 'Bangers, cursive',
          textTransform: 'uppercase',
          color: '#1C1C1C',
          letterSpacing: '1px',
        },
        '.comic-text': {
          fontFamily: 'system-ui, sans-serif', // CONFIRMED: Changed from Inter
          color: '#1C1C1C',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}

export default config

// ========================================
// 2. CONFIRMED COMPONENT PATTERNS
// ========================================

// BADGE TEXT STYLING (CONFIRMED FIX)
const CONFIRMED_BADGE_STYLES = {
  fontFamily: 'system-ui, sans-serif', // NOT Impact - too bold
  fontWeight: '600', // NOT 900 - illegible
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

// LIVE DOT STYLING (CONFIRMED)
const CONFIRMED_LIVE_DOT = {
  width: '8px',
  height: '8px',
  backgroundColor: 'white',
  borderRadius: '50%',
  border: '1px solid rgba(0, 0, 0, 0.3)', // CONFIRMED: Subtle black circle
  animation: 'modernPulse 2s infinite ease-in-out'
}

// MODERN PULSE ANIMATION (CONFIRMED)
const CONFIRMED_ANIMATIONS = `
@keyframes modernPulse {
  0%, 100% { 
    opacity: 1; 
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.8);
  }
  50% { 
    opacity: 0.8; 
    transform: scale(1.1);
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.2);
  }
}
`

// SPINE IMAGE PROPORTIONS (CONFIRMED FIX)
const CONFIRMED_IMAGE_SIZES = {
  front: { md: { width: '120px', height: '180px' } },
  back: { md: { width: '120px', height: '180px' } },
  spine: { md: { width: '60px', height: '180px' } }, // CONFIRMED: Thinner
  detail: { md: { width: '120px', height: '180px' } }
}

// CONFIRMED BID BADGE DIMENSIONS
const CONFIRMED_BID_BADGE = {
  minWidth: '140px', // CONFIRMED: More rectangular
  padding: '6px 12px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px'
}

// ========================================
// 3. CONFIRMED COLOR USAGE PATTERNS
// ========================================

const CONFIRMED_COLOR_USAGE = {
  // Status Colors
  success: 'rgb(34, 197, 94)',
  warning: 'rgb(247, 181, 56)',
  error: 'rgb(214, 40, 40)',
  info: 'rgb(0, 119, 181)',
  
  // Live Badge Colors (CONFIRMED)
  live: {
    bg: 'rgb(34, 197, 94)', // CONFIRMED: Green for live
    border: 'rgb(22, 163, 74)',
    text: 'rgb(255, 255, 255)'
  },
  
  // Image Type Colors (CONFIRMED)
  imageTypes: {
    front: 'rgb(34, 197, 94)',
    back: 'rgb(0, 119, 181)',
    spine: 'rgb(147, 51, 234)',
    detail: 'rgb(249, 115, 22)'
  }
}

// ========================================
// 4. CONFIRMED CHART STYLING
// ========================================

const CONFIRMED_CHART_STYLE = {
  // CONFIRMED: Clean financial line chart
  lineChart: {
    fill: 'none',
    stroke: 'rgb(214, 40, 40)',
    strokeWidth: '2', // CONFIRMED: Thin line
    // NO area fill, NO scatter points
  },
  
  // CONFIRMED: Collection breakdown bars
  progressBar: {
    height: '28px', // CONFIRMED: Bigger bars
    backgroundColor: 'rgb(243, 244, 246)',
    border: '2px solid rgb(28, 28, 28)',
    // Full width layout, no white space
  }
}

// ========================================
// 5. RESPONSIVE NAVBAR BREAKPOINT (CONFIRMED)
// ========================================

const CONFIRMED_NAVBAR_BREAKPOINT = 768; // Tailwind md breakpoint
// Desktop: Option 3 (Compact dropdown)
// Mobile: Option 4 (Hamburger menu)

// ========================================
// 6. DROP ZONE PREFERENCE (CONFIRMED)
// ========================================

const CONFIRMED_DROPZONE_PREFERENCE = 'compact'; // NOT default version

// ========================================
// 7. ANIMATION STANDARDS (CONFIRMED)
// ========================================

const CONFIRMED_ANIMATION_STANDARDS = {
  // Hover effects - SUBTLE
  hover: {
    transform: 'translate(-2px, -2px)', // CONFIRMED: Not too much
    duration: '0.2s',
    ease: 'ease'
  },
  
  // Button press
  active: {
    transform: 'translate(1px, 1px)',
    duration: '0.1s'
  },
  
  // Live pulse - MODERN
  livePulse: {
    duration: '2s',
    timing: 'ease-in-out',
    infinite: true
  },
  
  // Urgent pulse - FASTER
  urgentPulse: {
    duration: '1s',
    timing: 'ease-in-out',
    infinite: true
  }
}

// ========================================
// 8. CONFIRMED LAYOUT PATTERNS
// ========================================

const CONFIRMED_LAYOUT_PATTERNS = {
  // Collection breakdown - NO WHITE SPACE
  collectionBreakdown: {
    display: 'grid',
    gridTemplateColumns: '120px 1fr 140px', // CONFIRMED layout
    gap: '16px',
    alignItems: 'center'
  },
  
  // Card grid - RESPONSIVE
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px'
  }
}

// ========================================
// 9. TYPESCRIPT INTERFACES (CONFIRMED)
// ========================================

interface ConfirmedUser {
  name: string;
  email: string;
  avatar?: string;
  subscriptionTier: 'free' | 'pro' | 'premium';
}

interface ConfirmedBadgeProps {
  status: 'active' | 'triggered' | 'expired' | 'pending';
  count?: number;
  animated?: boolean;
}

interface ConfirmedImageProps {
  type: 'front' | 'back' | 'spine' | 'detail';
  url: string;
  size: 'sm' | 'md' | 'lg';
}

interface ConfirmedChartData {
  month: string;
  value: number;
  change: number;
}

// ========================================
// 10. CONFIRMED UTILITY FUNCTIONS
// ========================================

// Format currency (UK pounds)
export const formatCurrency = (amount: number): string => {
  return `£${amount.toLocaleString()}`;
};

// Get image size based on type
export const getImageSize = (type: string, size: string) => {
  if (type === 'spine') {
    return CONFIRMED_IMAGE_SIZES.spine[size as keyof typeof CONFIRMED_IMAGE_SIZES.spine];
  }
  return CONFIRMED_IMAGE_SIZES.front[size as keyof typeof CONFIRMED_IMAGE_SIZES.front];
};

// Get status color
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'success': return CONFIRMED_COLOR_USAGE.success;
    case 'warning': return CONFIRMED_COLOR_USAGE.warning;
    case 'error': return CONFIRMED_COLOR_USAGE.error;
    case 'info': return CONFIRMED_COLOR_USAGE.info;
    default: return CONFIRMED_COLOR_USAGE.info;
  }
};

// ========================================
// 11. CONFIRMED COMPONENT REQUIREMENTS
// ========================================

/*
TROPHY SYSTEM - REJECTED
- User tried multiple times, not satisfied
- Do NOT implement trophy system
- Focus on other components instead

CONFIRMED PREFERENCES:
✅ Subtle animations (2px movement, not 8px)
✅ Readable fonts (system-ui, not Impact for small text)
✅ Efficient layouts (no excessive white space)
✅ Realistic proportions (spine images thinner)
✅ Financial-style charts (clean lines, no decorative fills)
✅ Compact drop zones
✅ Modern pulsing effects with contrast borders

TYPOGRAPHY STANDARDS:
- Headings: Bangers font, ALL CAPS, Impact as fallback
- Body text: system-ui (NOT Inter in code - use system fonts)
- Small text: NEVER Impact font (illegible)
- Badge text: system-ui, 600 weight, 12px

ANIMATION STANDARDS:
- Hover: translate(-2px, -2px) - SUBTLE
- Live dots: Modern pulse with scale + shadow ring
- Urgent items: Faster 1s pulse
- All transitions: 0.2s ease
*/

// ========================================
// 12. NEXT STEPS FOR NEW CHAT
// ========================================

/*
REMAINING COMPONENTS TO BUILD:
1. Interactive Elements (search filters, sorting, pagination, modals)
2. Final typography confirmation and implementation
3. Component assembly and integration

IMPORTANT CONTEXT:
- All completed components (badges, eBay, photos, charts) are in project knowledge
- User prefers efficiency over decoration
- User values realistic proportions and clean design
- User wants financial-grade data visualization
- User confirmed all current components are approved

DEVELOPMENT APPROACH:
- Use system-ui fonts for readability
- Keep animations subtle (2px movements)
- Minimize white space
- Use confirmed color palette
- Follow comic book aesthetic with practical usability
*/