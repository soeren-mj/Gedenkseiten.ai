import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import ProfilePreviewCard from './ProfilePreviewCard';
import MultiPreviewCard from './MultiPreviewCard';
import Image from 'next/image';

const MenschIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
    <mask id="mask0_5280_79955" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
      <rect width="24" height="24" fill={color} />
    </mask>
    <g mask="url(#mask0_5280_79955)">
      <path d="M12 11.682C11.0375 11.682 10.2338 11.3596 9.589 10.7148C8.94417 10.0699 8.62175 9.26628 8.62175 8.30378C8.62175 7.33711 8.94417 6.53245 9.589 5.88978C10.2338 5.24711 11.0375 4.92578 12 4.92578C12.9625 4.92578 13.7662 5.24711 14.411 5.88978C15.0558 6.53245 15.3783 7.33711 15.3783 8.30378C15.3783 9.26628 15.0558 10.0699 14.411 10.7148C13.7662 11.3596 12.9625 11.682 12 11.682ZM4.5 19.3078V17.3013C4.5 16.7799 4.63925 16.3168 4.91775 15.9118C5.19608 15.5069 5.56108 15.1958 6.01275 14.9783C7.04408 14.5048 8.053 14.1486 9.0395 13.9098C10.026 13.6708 11.0128 13.5513 12 13.5513C12.9872 13.5513 13.9723 13.6724 14.9555 13.9148C15.9385 14.1571 16.9457 14.5116 17.977 14.9783C18.4355 15.1958 18.8039 15.5069 19.0822 15.9118C19.3608 16.3168 19.5 16.7799 19.5 17.3013V19.3078H4.5Z" fill={color} />
    </g>
  </svg>
);
const TierIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
    <mask id="mask0_5280_79958" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
      <rect width="24" height="24" fill={color} />
    </mask>
    <g mask="url(#mask0_5280_79958)">
      <path d="M5.35 21.5002V13.856L9.959 18.4552C10.5612 17.753 11.0941 17.0023 11.5578 16.203C12.0214 15.4036 12.2533 14.538 12.2533 13.606C12.2533 12.8205 12.1036 12.0698 11.8043 11.354C11.5048 10.6383 11.08 10.0033 10.53 9.44896L7.62375 6.56821L7.989 6.20271H12.125L15.9718 2.35596L17.764 4.13871C18.3913 4.76604 18.8693 5.48321 19.1978 6.29021C19.5261 7.09737 19.6948 7.94429 19.7038 8.83096C19.6948 9.71779 19.5261 10.5647 19.1978 11.3717C18.8693 12.1787 18.3913 12.8959 17.764 13.5232L15.6 15.6777V21.5002H5.35ZM9.8935 16.6215L4.961 11.6982C4.808 11.5452 4.69292 11.3683 4.61575 11.1675C4.53858 10.9666 4.5 10.7579 4.5 10.5412C4.5 10.3245 4.53858 10.1165 4.61575 9.91721C4.69292 9.71787 4.808 9.54171 4.961 9.38871L6.80325 7.53096L9.6455 10.3387C10.0862 10.7792 10.4215 11.2797 10.6515 11.8402C10.8817 12.4007 10.9968 12.9893 10.9968 13.606C10.9968 14.153 10.9038 14.6873 10.718 15.209C10.532 15.7305 10.2572 16.2013 9.8935 16.6215Z" fill={color} />
    </g>
  </svg>
);
const FamilieIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
    <mask id="mask0_5280_79961" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
      <rect width="24" height="24" fill={color} />
    </mask>
    <g mask="url(#mask0_5280_79961)">
      <path d="M18.0012 5.81939C17.5132 5.81939 17.0974 5.64806 16.7537 5.30539C16.4102 4.96256 16.2385 4.54714 16.2385 4.05914C16.2385 3.57114 16.4098 3.1553 16.7525 2.81164C17.0951 2.46814 17.5105 2.29639 17.9987 2.29639C18.4867 2.29639 18.9025 2.46772 19.2462 2.81039C19.5897 3.15305 19.7615 3.56839 19.7615 4.05639C19.7615 4.54455 19.5901 4.96039 19.2475 5.30389C18.9048 5.64756 18.4894 5.81939 18.0012 5.81939ZM16.6217 21.7501V13.6694C16.6217 13.1262 16.4921 12.6373 16.233 12.2026C15.9738 11.7681 15.5931 11.4355 15.091 11.2046L16.127 8.33664C16.2603 7.94564 16.4997 7.63156 16.8452 7.39439C17.1907 7.15722 17.5756 7.03864 18 7.03864C18.4243 7.03864 18.8092 7.15564 19.1547 7.38964C19.5002 7.62364 19.7396 7.93931 19.873 8.33664L22.5 15.5706H19.8012V21.7501H16.6217ZM12.4412 11.4616C12.0465 11.4616 11.7141 11.3251 11.444 11.0519C11.1736 10.7787 11.0385 10.447 11.0385 10.0566C11.0385 9.66647 11.174 9.33514 11.445 9.06264C11.716 8.79014 12.0488 8.65389 12.4435 8.65389C12.8336 8.65389 13.165 8.79055 13.4375 9.06389C13.71 9.33705 13.8462 9.66872 13.8462 10.0589C13.8462 10.4492 13.7095 10.7806 13.4362 11.0531C13.163 11.3255 12.8314 11.4616 12.4412 11.4616ZM5.5012 5.81939C5.0132 5.81939 4.59737 5.64806 4.2537 5.30539C3.9102 4.96256 3.73845 4.54714 3.73845 4.05914C3.73845 3.57114 3.90979 3.1553 4.25245 2.81164C4.59512 2.46814 5.01054 2.29639 5.4987 2.29639C5.9867 2.29639 6.40254 2.46772 6.7462 2.81039C7.0897 3.15305 7.26145 3.56839 7.26145 4.05639C7.26145 4.54455 7.09012 4.96039 6.74745 5.30389C6.40479 5.64756 5.98937 5.81939 5.5012 5.81939ZM3.7372 21.7501V14.8399H2.03845V8.77589C2.03845 8.34906 2.19245 7.98164 2.50045 7.67364C2.80829 7.36564 3.17562 7.21164 3.60245 7.21164H7.39745C7.82429 7.21164 8.19162 7.36564 8.49945 7.67364C8.80745 7.98164 8.96145 8.34906 8.96145 8.77589V14.8399H7.2627V21.7501H3.7372ZM11.1347 21.7501V17.8784H10.0127V13.6694C10.0127 13.3446 10.1264 13.0685 10.3537 12.8411C10.5812 12.6138 10.8573 12.5001 11.182 12.5001H13.6962C14.0209 12.5001 14.2969 12.6138 14.5242 12.8411C14.7515 13.0685 14.8652 13.3446 14.8652 13.6694V17.8784H13.7435V21.7501H11.1347Z" fill={color} />
    </g>
  </svg>
);
const EreignisIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
    <mask id="mask0_5280_79964" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
      <rect width="24" height="24" fill={color} />
    </mask>
    <g mask="url(#mask0_5280_79964)">
      <path d="M4.1475 13.9699L6.04475 12.0929L4.1475 10.1954L2.2705 12.0929L4.1475 13.9699ZM17.8962 13.6921L19.8718 10.5129L21.8673 13.6921H17.8962ZM12.0035 12.4999C11.2832 12.4999 10.6698 12.2475 10.1635 11.7426C9.65717 11.238 9.404 10.625 9.404 9.90387C9.404 9.1682 9.65633 8.55162 10.161 8.05412C10.6658 7.55645 11.2788 7.30762 12 7.30762C12.7355 7.30762 13.3521 7.55612 13.8498 8.05312C14.3473 8.54995 14.596 9.1657 14.596 9.90037C14.596 10.6205 14.3476 11.2339 13.8508 11.7404C13.3538 12.2467 12.738 12.4999 12.0035 12.4999ZM0.5 17.7884V16.6909C0.5 16.0529 0.837917 15.5335 1.51375 15.1329C2.18942 14.7322 3.06642 14.5319 4.14475 14.5319C4.33908 14.5319 4.52767 14.5377 4.7105 14.5494C4.89333 14.5609 5.06783 14.5818 5.234 14.6121C5.09517 14.881 4.98942 15.1611 4.91675 15.4526C4.84408 15.7443 4.80775 16.0527 4.80775 16.3779V17.7884H0.5ZM6.5 17.7884V16.4134C6.5 15.4582 7.00825 14.6922 8.02475 14.1154C9.04125 13.5384 10.3673 13.2499 12.0028 13.2499C13.6534 13.2499 14.9823 13.5384 15.9895 14.1154C16.9965 14.6922 17.5 15.4582 17.5 16.4134V17.7884H6.5ZM19.8718 14.5319C20.9639 14.5319 21.8417 14.7322 22.505 15.1329C23.1683 15.5335 23.5 16.0529 23.5 16.6909V17.7884H19.1923V16.3779C19.1923 16.0527 19.1601 15.7443 19.0958 15.4526C19.0314 15.1611 18.9294 14.881 18.7898 14.6121C18.9603 14.5818 19.1363 14.5609 19.318 14.5494C19.4998 14.5377 19.6844 14.5319 19.8718 14.5319Z" fill={color} />
    </g>
  </svg>
);

const CONTAINER_MAX_WIDTH = 1320; // 82.5rem
const MIN_GAP = 16; // 1rem
const MAX_GAP = 32; // 2rem
const SLIDER_MAX_WIDTH = 1400; // Maximum width for the slider container
const CARD_MAX_WIDTH = 427; // Maximum width for individual cards

const PreviewCardSlider: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [gap, setGap] = useState(MIN_GAP);
  const [containerWidth, setContainerWidth] = useState(0);
  const [cardWidth, setCardWidth] = useState(CARD_MAX_WIDTH);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [spacerWidth, setSpacerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // For easier logic, create an array with placeholders at start and end
  const tabContent = [
    <ProfilePreviewCard key="mensch" type="human" />,
    <ProfilePreviewCard key="tier" type="animal" />,
    <MultiPreviewCard key="familie" />,
    <MultiPreviewCard key="ereignis" type="event" />,
  ];
  const allCards = [null, ...tabContent, null];
  const adjustedActiveTab = activeTab + 1;

  // Responsive check and dynamic gap calculation
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      
      // Calculate dynamic gap based on viewport width
      const newGap = isMobile ? 0 : Math.min(
        MAX_GAP,
        Math.max(MIN_GAP, Math.floor(width * 0.02)) // 2% of viewport width
      );
      setGap(newGap);

      // Update container width
      if (containerRef.current) {
        const containerWidth = Math.min(containerRef.current.offsetWidth, SLIDER_MAX_WIDTH);
        setContainerWidth(containerWidth);
        
        // Calculate card width
        const newCardWidth = isMobile
          ? containerWidth // 100% width on mobile
          : Math.min(containerWidth * 0.4, CARD_MAX_WIDTH);
        setCardWidth(newCardWidth);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  // Calculate spacer width for perfect centering
  useLayoutEffect(() => {
    if (containerRef.current) {
      const spacer = Math.max(0, (containerWidth - cardWidth) / 2);
      setSpacerWidth(spacer);
    }
  }, [containerWidth, cardWidth]);

  // Custom scroll to center active card with smooth behavior
  useLayoutEffect(() => {
    if (containerRef.current && cardRefs.current[adjustedActiveTab]) {
      const container = containerRef.current;
      const card = cardRefs.current[adjustedActiveTab];
      const scrollLeft =
        card.offsetLeft - container.offsetLeft - container.clientWidth / 2 + card.clientWidth / 2;
      
      container.scrollTo({ 
        left: scrollLeft, 
        behavior: 'smooth' 
      });
    }
  }, [activeTab, adjustedActiveTab, spacerWidth, isMobile, gap]);

  // Update container height based on active card
  useLayoutEffect(() => {
    if (containerRef.current && cardRefs.current[adjustedActiveTab]) {
      const activeCard = cardRefs.current[adjustedActiveTab];
      if (activeCard) {
        const height = activeCard.offsetHeight;
        setContainerHeight(height);
        containerRef.current.style.height = `${height}px`;
      }
    }
  }, [activeTab, adjustedActiveTab, isMobile, gap]);

  // Check if we need to show arrows and scroll active tab into view
  useEffect(() => {
    const checkArrows = () => {
      if (tabsContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
        const hasOverflow = scrollWidth > clientWidth;
        
        // Left arrow: show if we can scroll left
        const canScrollLeft = scrollLeft > 0;
        setShowLeftArrow(canScrollLeft);
        
        // Right arrow: show if we can scroll right
        const canScrollRight = scrollLeft < (scrollWidth - clientWidth);
        setShowRightArrow(hasOverflow && canScrollRight);
      }
    };

    const scrollActiveTabIntoView = () => {
      if (tabsContainerRef.current) {
        const activeTab = tabsContainerRef.current.querySelector('[aria-selected="true"]');
        if (activeTab) {
          const container = tabsContainerRef.current;
          const tabRect = activeTab.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          
          // Calculate the center position
          const scrollLeft = tabRect.left - containerRect.left - (containerRect.width - tabRect.width) / 2;
          
          container.scrollTo({
            left: container.scrollLeft + scrollLeft,
            behavior: 'smooth'
          });
        }
      }
    };

    // Initial check
    checkArrows();
    scrollActiveTabIntoView();

    // Add resize observer
    const resizeObserver = new ResizeObserver(() => {
      checkArrows();
      scrollActiveTabIntoView();
    });
    if (tabsContainerRef.current) {
      resizeObserver.observe(tabsContainerRef.current);
    }

    // Add scroll listener
    const container = tabsContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkArrows);
    }

    return () => {
      resizeObserver.disconnect();
      if (container) {
        container.removeEventListener('scroll', checkArrows);
      }
    };
  }, [activeTab]);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const scrollAmount = tabsContainerRef.current.clientWidth * 0.8; // Scroll 80% of container width
      const newScrollLeft = direction === 'left' 
        ? tabsContainerRef.current.scrollLeft - scrollAmount
        : tabsContainerRef.current.scrollLeft + scrollAmount;
      
      tabsContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // Helper: is neighbor
  const isNeighbor = (idx: number) => Math.abs(idx - adjustedActiveTab) === 1;

  const handleTabClick = (idx: number, e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
    }
    setActiveTab(idx);
    
    // Scroll the active card into view
    if (containerRef.current && cardRefs.current[idx + 1]) {
      const container = containerRef.current;
      const card = cardRefs.current[idx + 1];
      if (card) {
        const containerRect = container.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        
        // Calculate the scroll position to center the card
        const scrollLeft = cardRect.left - containerRect.left - (containerRect.width - cardRect.width) / 2;
        
        container.scrollTo({
          left: container.scrollLeft + scrollLeft,
          behavior: 'smooth'
        });
      }
    }
  };

  const handleContentClick = (index: number) => {
    setActiveTab(index);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTabClick(index, e);
    } else if (e.key === 'ArrowLeft' && activeTab > 0) {
      e.preventDefault();
      handleTabClick(activeTab - 1, e);
    } else if (e.key === 'ArrowRight' && activeTab < tabContent.length - 1) {
      e.preventDefault();
      handleTabClick(activeTab + 1, e);
    }
  };

  // ... tabs and icons definition ...
  const tabIconColors = ['#08CC50', '#E5A417', '#996DE3', '#B9AB11'];
  const tabs = [
    { label: 'Mensch', icon: (color: string) => <MenschIcon color={color} /> },
    { label: 'Tier', icon: (color: string) => <TierIcon color={color} /> },
    { label: 'Familie', icon: (color: string) => <FamilieIcon color={color} /> },
    { label: 'Ereignis', icon: (color: string) => <EreignisIcon color={color} /> },
  ];

  return (
    <div className="w-full max-w-[82.5rem] mx-auto flex flex-col gap-6" role="region" aria-label="Gedenkseiten Kategorien">
      <div className="relative w-full max-w-[685px] mx-auto flex justify-center">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scrollTabs('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-zinc-900 rounded-full p-2 shadow-lg hover:bg-zinc-800 transition-colors"
            aria-label="Scroll tabs left"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        
        {/* Tabs Container */}
        <div 
          ref={tabsContainerRef}
          className="inline-flex justify-center gap-4 bg-zinc-900 rounded-full px-2 py-2 my-4 mx-auto overflow-x-auto scrollbar-hide"
          role="tablist"
          onScroll={() => {
            if (tabsContainerRef.current) {
              const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
              setShowLeftArrow(scrollLeft > 0);
              setShowRightArrow(scrollLeft + clientWidth < scrollWidth);
            }
          }}
        >
          {tabs.map((tab, idx) => (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={idx === activeTab}
              aria-controls={`tab-panel-${idx}`}
              id={`tab-${idx}`}
              className={`px-4 py-2 rounded-full font-inter font-medium text-base transition-colors flex items-center whitespace-nowrap flex-shrink-0 ${
                idx === activeTab
                  ? 'bg-blue-700 text-white shadow'
                  : 'bg-transparent text-foreground-secondary hover:bg-zinc-800'
              }`}
              onClick={e => handleTabClick(idx, e)}
              onKeyDown={e => handleKeyDown(e, idx)}
            >
              {tab.icon(idx === activeTab ? '#fff' : tabIconColors[idx])}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scrollTabs('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-zinc-900 rounded-full p-2 shadow-lg hover:bg-zinc-800 transition-colors"
            aria-label="Scroll tabs right"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
      <div className="w-full flex justify-center">
        <div
          ref={containerRef}
          className="relative w-full overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth snap-x snap-mandatory transition-[height] duration-500 ease-out pointer-events-none"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            maxWidth: `${SLIDER_MAX_WIDTH}px`,
            height: containerHeight ? `${containerHeight}px` : 'auto'
          }}
        >
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: `${gap}px`,
              minWidth: `calc(${tabContent.length} * ${cardWidth}px + ${(tabContent.length - 1)} * ${gap}px + 2 * ${spacerWidth}px)` 
            }}
          >
            {/* Spacer left */}
            <div style={{ minWidth: spacerWidth, pointerEvents: 'none' }} aria-hidden="true" />
            {allCards.slice(1, -1).map((content, idx) => {
              let opacity = 0;
              let pointerEvents: 'auto' | 'none' = 'none';
              let scale = '0.98';
              if (idx + 1 === adjustedActiveTab) {
                opacity = 1;
                pointerEvents = 'auto';
                scale = '1';
              } else if (isNeighbor(idx + 1)) {
                opacity = 0.26;
                pointerEvents = 'auto';
              }
              return (
                <div
                  key={idx}
                  ref={el => { cardRefs.current[idx + 1] = el; }}
                  role="tabpanel"
                  id={`tab-panel-${idx}`}
                  aria-labelledby={`tab-${idx}`}
                  tabIndex={idx + 1 === adjustedActiveTab ? 0 : -1}
                  className="flex-shrink-0 transition-all duration-500 ease-out snap-center focus:outline-none"
                  style={{
                    opacity,
                    width: `${cardWidth}px`,
                    maxWidth: '100%',
                    transform: `scale(${scale})`,
                    pointerEvents,
                  }}
                  onClick={() => {
                    if (pointerEvents === 'auto') handleContentClick(idx);
                  }}
                  onKeyDown={e => handleKeyDown(e, idx)}
                >
                  {content}
                </div>
              );
            })}
            {/* Spacer right */}
            <div style={{ minWidth: spacerWidth, pointerEvents: 'none' }} aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewCardSlider; 