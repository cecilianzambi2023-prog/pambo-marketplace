/**
 * HubSwitcherNav.tsx
 * ===================
 * Hub Navigation Switcher Component
 *
 * Provides:
 * - Hub selection with visual feedback
 * - Keyboard shortcuts for hub navigation
 * - Hub search/filtering
 * - Mobile-responsive design
 */

import React, { useState, useRef, useEffect } from 'react';
import { useHubSwitch, useAllHubs, useHub, useHubBranding } from '../contexts/HubContext';
import { Search, X, ChevronRight, Zap } from 'lucide-react';

// ===================================
// HUB SWITCHER NAV (Main Top Bar)
// ===================================

export const HubSwitcherNav: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { switchHub, availableHubs } = useHubSwitch();
  const { hubId } = useHub();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showMore, setShowMore] = useState(false);

  // Keyboard navigation (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIndex = (selectedIndex + 1) % availableHubs.length;
        setSelectedIndex(nextIndex);
        switchHub(availableHubs[nextIndex].id);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIndex = (selectedIndex - 1 + availableHubs.length) % availableHubs.length;
        setSelectedIndex(prevIndex);
        switchHub(availableHubs[prevIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, availableHubs, switchHub]);

  // Show max 4 hubs, rest in dropdown
  const visibleHubs = availableHubs.slice(0, 4);
  const hiddenHubs = availableHubs.slice(4);

  return (
    <nav className={`flex items-center gap-2 overflow-x-auto pb-2 ${className}`}>
      {visibleHubs.map((hub) => (
        <HubNavButton
          key={hub.id}
          hub={hub}
          isActive={hub.id === hubId}
          onClick={() => switchHub(hub.id)}
        />
      ))}

      {hiddenHubs.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setShowMore(!showMore)}
            className="px-3 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition whitespace-nowrap"
          >
            +{hiddenHubs.length} more
          </button>

          {showMore && (
            <div className="absolute top-full mt-2 left-0 w-56 bg-white rounded-lg shadow-xl border-2 border-gray-200 z-50">
              {hiddenHubs.map((hub) => (
                <button
                  key={hub.id}
                  onClick={() => {
                    switchHub(hub.id);
                    setShowMore(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition border-b last:border-b-0"
                >
                  <p className="font-semibold text-gray-900">{hub.displayName}</p>
                  <p className="text-xs text-gray-600">{hub.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

// ===================================
// HUB NAV BUTTON
// ===================================

interface HubNavButtonProps {
  hub: any;
  isActive: boolean;
  onClick: () => void;
}

const HubNavButton: React.FC<HubNavButtonProps> = ({ hub, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap flex items-center gap-2 ${
        isActive
          ? 'text-white shadow-lg'
          : 'text-gray-700 bg-white border-2 border-gray-200 hover:border-gray-300'
      }`}
      style={isActive ? { backgroundColor: hub.color.primary } : {}}
    >
      <span className="text-lg">{hub.icon}</span>
      <span className="hidden sm:inline">{hub.displayName}</span>
    </button>
  );
};

// ===================================
// HUB SEARCH SWITCHER
// ===================================

export const HubSearchSwitcher: React.FC = () => {
  const { availableHubs } = useHubSwitch();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter hubs based on search
  const filteredHubs = availableHubs.filter(
    (hub) =>
      hub.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hub.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open dialog with Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!open);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition text-sm"
      >
        <Search size={16} />
        <span>Find hub...</span>
        <kbd className="ml-auto text-xs text-gray-500">⌘K</kbd>
      </button>

      {/* Modal Dialog */}
      {open && (
        <HubSearchDialog
          filteredHubs={filteredHubs}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          onClose={() => setOpen(false)}
          inputRef={inputRef}
        />
      )}
    </>
  );
};

interface HubSearchDialogProps {
  filteredHubs: any[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  onClose: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

const HubSearchDialog: React.FC<HubSearchDialogProps> = ({
  filteredHubs,
  searchTerm,
  setSearchTerm,
  selectedIndex,
  setSelectedIndex,
  onClose,
  inputRef
}) => {
  const { switchHub } = useHubSwitch();

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredHubs.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredHubs.length) % filteredHubs.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredHubs[selectedIndex]) {
          switchHub(filteredHubs[selectedIndex].id);
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/20">
      <div className="w-96 bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="p-4 border-b">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search hubs..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Results */}
        {filteredHubs.length > 0 ? (
          <div className="max-h-72 overflow-y-auto">
            {filteredHubs.map((hub, index) => (
              <button
                key={hub.id}
                onClick={() => {
                  switchHub(hub.id);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition border-b last:border-b-0 ${
                  index === selectedIndex ? 'bg-blue-50 border-l-4' : ''
                }`}
                style={index === selectedIndex ? { borderLeftColor: hub.color.primary } : {}}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{hub.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{hub.displayName}</p>
                    <p className="text-xs text-gray-600">{hub.description}</p>
                  </div>
                  {index === selectedIndex && <ChevronRight size={18} className="text-blue-600" />}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">No hubs found</p>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between text-xs text-gray-500">
          <div className="flex gap-4">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ===================================
// HUB SIDEBAR SWITCHER
// ===================================

interface HubSidebarSwitcherProps {
  isCollapsed?: boolean;
}

export const HubSidebarSwitcher: React.FC<HubSidebarSwitcherProps> = ({ isCollapsed = false }) => {
  const { availableHubs, switchHub } = useHubSwitch();
  const { hubId } = useHub();

  return (
    <div className={`flex flex-col gap-2 ${isCollapsed ? 'items-center' : ''}`}>
      {isCollapsed && <p className="text-xs font-semibold text-gray-500 mb-2">HUBS</p>}

      {availableHubs.map((hub) => (
        <button
          key={hub.id}
          onClick={() => switchHub(hub.id)}
          className={`relative rounded-lg transition ${
            hubId === hub.id ? 'text-white' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
          } ${isCollapsed ? 'p-3' : 'px-4 py-3 w-full text-left flex items-center gap-2'}`}
          style={hubId === hub.id ? { backgroundColor: hub.color.primary } : {}}
          title={isCollapsed ? hub.displayName : undefined}
        >
          <span className="text-lg flexshrink-0">{hub.icon}</span>
          {!isCollapsed && (
            <>
              <div className="flex-1">
                <p className="font-semibold">{hub.displayName}</p>
                <p className="text-xs opacity-75">{hub.description}</p>
              </div>
              {hubId === hub.id && <Zap size={16} />}
            </>
          )}
        </button>
      ))}
    </div>
  );
};

// ===================================
// HUB SWITCHER BADGES
// ===================================

export const HubSwitcherBadges: React.FC = () => {
  const { availableHubs, switchHub } = useHubSwitch();
  const { hubId } = useHub();

  return (
    <div className="flex flex-wrap gap-2">
      {availableHubs.map((hub) => (
        <button
          key={hub.id}
          onClick={() => switchHub(hub.id)}
          className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
            hubId === hub.id
              ? 'text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          style={hubId === hub.id ? { backgroundColor: hub.color.primary } : {}}
        >
          {hub.icon} {hub.displayName}
        </button>
      ))}
    </div>
  );
};

// ===================================
// HUB INFO CARD (For Hub Comparison)
// ===================================

interface HubInfoCardProps {
  hubId: string;
}

export const HubInfoCard: React.FC<HubInfoCardProps> = ({ hubId }) => {
  const { switchHub } = useHubSwitch();
  const { availableHubs } = useHubSwitch();

  const hub = availableHubs.find((h) => h.id === hubId);

  if (!hub) return null;

  return (
    <div
      className="p-4 rounded-lg border-l-4 bg-white hover:shadow-lg transition cursor-pointer"
      style={{ borderLeftColor: hub.color.primary }}
      onClick={() => switchHub(hub.id)}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">{hub.icon}</span>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900">{hub.displayName}</h3>
          <p className="text-sm text-gray-600 mt-1">{hub.description}</p>
          <div className="mt-3 flex gap-2 flex-wrap">
            {Object.entries(hub.features)
              .filter(([, feature]: any) => feature.enabled)
              .slice(0, 3)
              .map(([key]) => (
                <span
                  key={key}
                  className="text-xs px-2 py-1 rounded-full text-white"
                  style={{ backgroundColor: hub.color.primary }}
                >
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
