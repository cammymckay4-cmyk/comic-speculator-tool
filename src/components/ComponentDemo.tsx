import React, { useState } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  DollarSign, 
  Star, 
  Award, 
  Check, 
  BookOpen, 
  Filter,
  Calendar
} from 'lucide-react';

// Import our reusable components
import { 
  SearchBar, 
  FilterDropdown, 
  Pagination, 
  ComicCard, 
  ComicButton, 
  Modal 
} from './core';
import { 
  QuickFilter, 
  FilterTag, 
  LoadMoreButton 
} from './features';

const ComponentDemo = () => {
  const [currentSection, setCurrentSection] = useState('buttons');
  const [showModal, setShowModal] = useState(false);

  const sections = [
    { id: 'buttons', label: 'Buttons' },
    { id: 'search', label: 'Search & Filters' },
    { id: 'cards', label: 'Comic Cards' },
    { id: 'pagination', label: 'Pagination' },
    { id: 'modals', label: 'Modals' },
  ];

  const renderButtonSection = () => (
    <div style={{
      background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
      border: '3px solid rgb(28, 28, 28)',
      boxShadow: '6px 6px 0px rgb(28, 28, 28)',
      padding: '32px'
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
        Button Components
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Comic Buttons */}
        <div>
          <h3 style={{ marginBottom: '16px' }}>Comic Buttons</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <ComicButton variant="primary" size="sm">Primary Small</ComicButton>
            <ComicButton variant="secondary" size="md">Secondary Medium</ComicButton>
            <ComicButton variant="success" size="lg" icon={Check}>Success Large</ComicButton>
            <ComicButton variant="warning">Warning</ComicButton>
            <ComicButton variant="danger" disabled>Disabled</ComicButton>
          </div>
        </div>

        {/* Quick Filters */}
        <div>
          <h3 style={{ marginBottom: '16px' }}>Quick Filter Buttons</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <QuickFilter label="Hot This Week" icon={TrendingUp} active={true} color="hot" />
            <QuickFilter label="New Arrivals" icon={Sparkles} active={false} color="new" />
            <QuickFilter label="Under $50" icon={DollarSign} active={false} color="value" />
            <QuickFilter label="Key Issues" icon={Star} active={false} color="premium" />
            <QuickFilter label="First Appearances" icon={Award} active={false} color="default" />
            <QuickFilter label="Graded Only" icon={Check} active={false} color="condition" />
          </div>
        </div>

        {/* Load More Button */}
        <div>
          <h3 style={{ marginBottom: '16px' }}>Load More Buttons</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
            <LoadMoreButton hasMore={true} loading={false} />
            <LoadMoreButton hasMore={true} loading={true} />
            <LoadMoreButton hasMore={false} loading={false} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSearchSection = () => (
    <div style={{
      background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
      border: '3px solid rgb(28, 28, 28)',
      boxShadow: '6px 6px 0px rgb(28, 28, 28)',
      padding: '32px'
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
        Search & Filter Components
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Search Bars */}
        <div>
          <h3 style={{ marginBottom: '16px' }}>Search Bars</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <SearchBar size="sm" placeholder="Small search bar..." />
            <SearchBar size="md" placeholder="Medium search bar with filters..." showFilters={true} />
            <SearchBar size="lg" placeholder="Large search bar..." showFilters={false} />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div>
          <h3 style={{ marginBottom: '16px' }}>Filter Dropdowns</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <FilterDropdown
              title="Publisher"
              icon={BookOpen}
              color="publisher"
              options={[
                { value: 'marvel', label: 'Marvel Comics' },
                { value: 'dc', label: 'DC Comics' },
                { value: 'image', label: 'Image Comics' }
              ]}
              multiple={true}
            />
            <FilterDropdown
              title="Condition"
              icon={Star}
              color="condition"
              options={[
                { value: 'mint', label: 'Mint (10.0)' },
                { value: 'near-mint', label: 'Near Mint (9.0+)' },
                { value: 'very-fine', label: 'Very Fine (8.0+)' }
              ]}
              multiple={true}
            />
            <FilterDropdown
              title="Price Range"
              icon={DollarSign}
              color="price"
              options={[
                { value: 'under50', label: 'Under $50' },
                { value: '50-200', label: '$50 - $200' },
                { value: 'over500', label: 'Over $500' }
              ]}
              multiple={false}
            />
          </div>
        </div>

        {/* Filter Tags */}
        <div>
          <h3 style={{ marginBottom: '16px' }}>Active Filter Tags</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <FilterTag label="Marvel" variant="default" onRemove={() => console.log('Remove Marvel')} />
            <FilterTag label="Near Mint" variant="success" onRemove={() => console.log('Remove Near Mint')} />
            <FilterTag label="$50-$200" variant="warning" onRemove={() => console.log('Remove Price Range')} />
            <FilterTag label="Key Issues" variant="danger" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderCardSection = () => (
    <div style={{
      background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
      border: '3px solid rgb(28, 28, 28)',
      boxShadow: '6px 6px 0px rgb(28, 28, 28)',
      padding: '32px'
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
        Comic Card Components
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px'
      }}>
        <ComicCard
          title="Amazing Spider-Man"
          issue="#1"
          publisher="Marvel"
          year="1963"
          condition="VF"
          value="£850"
          variant="collection"
          onClick={() => console.log('Card clicked')}
        />
        <ComicCard
          title="Batman"
          issue="#497"
          publisher="DC"
          year="1993"
          condition="NM"
          value="£320"
          variant="marketplace"
          onClick={() => console.log('Card clicked')}
        />
        <ComicCard
          title="X-Men"
          issue="#94"
          publisher="Marvel"
          year="1975"
          condition="FN"
          value="£1,250"
          variant="collection"
        />
        <ComicCard
          title="The Walking Dead"
          issue="#1"
          publisher="Image"
          year="2003"
          condition="VF+"
          value="£450"
          showDetails={false}
        />
      </div>
    </div>
  );

  const renderPaginationSection = () => (
    <div style={{
      background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
      border: '3px solid rgb(28, 28, 28)',
      boxShadow: '6px 6px 0px rgb(28, 28, 28)',
      padding: '32px'
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
        Pagination Components
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center' }}>
        <div>
          <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>Classic Pagination</h3>
          <Pagination 
            current={5} 
            total={42} 
            variant="classic"
            onPageChange={(page) => console.log('Page:', page)} 
          />
        </div>

        <div>
          <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>Compact Pagination</h3>
          <Pagination 
            current={15} 
            total={42} 
            variant="compact"
            onPageChange={(page) => console.log('Page:', page)} 
          />
        </div>
      </div>
    </div>
  );

  const renderModalSection = () => (
    <div style={{
      background: 'linear-gradient(to bottom, rgb(253, 246, 227), rgb(251, 242, 215))',
      border: '3px solid rgb(28, 28, 28)',
      boxShadow: '6px 6px 0px rgb(28, 28, 28)',
      padding: '32px'
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
        Modal Components
      </h2>

      <div style={{ textAlign: 'center' }}>
        <ComicButton 
          variant="primary" 
          onClick={() => setShowModal(true)}
        >
          Open Demo Modal
        </ComicButton>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Demo Modal"
          size="md"
        >
          <div>
            <p style={{ marginBottom: '16px' }}>
              This is a demo modal showing how the Modal component works. 
              It includes the header with close button and scrollable content area.
            </p>
            <p style={{ marginBottom: '16px' }}>
              Modals are perfect for displaying detailed information, forms, 
              or confirmation dialogs without navigating away from the current page.
            </p>
            <ComicButton 
              variant="secondary" 
              onClick={() => setShowModal(false)}
            >
              Close Modal
            </ComicButton>
          </div>
        </Modal>
      </div>
    </div>
  );

  const renderCurrentSection = () => {
    switch(currentSection) {
      case 'buttons': return renderButtonSection();
      case 'search': return renderSearchSection();
      case 'cards': return renderCardSection();
      case 'pagination': return renderPaginationSection();
      case 'modals': return renderModalSection();
      default: return renderButtonSection();
    }
  };

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
          ComicScoutUK Components
        </h1>
        <p style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '18px',
          color: 'rgb(28, 28, 28)',
          opacity: 0.7,
          margin: 0
        }}>
          Interactive showcase of all available UI components
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

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {renderCurrentSection()}
      </div>
    </div>
  );
};

export default ComponentDemo;