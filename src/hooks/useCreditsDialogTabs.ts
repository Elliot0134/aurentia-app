import { useState, useRef, useLayoutEffect } from 'react';

export type TabType = 'credits' | 'subscription';

interface UseModalTabsProps {
  defaultTab?: TabType;
}

export const useCreditsDialogTabs = ({
  defaultTab = 'credits'
}: UseModalTabsProps) => {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [modalHeight, setModalHeight] = useState<string>('auto');
  
  const contentRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (contentRef.current && modalRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      const headerHeight = modalRef.current.querySelector('header')?.clientHeight || 80;
      const tabsHeight = modalRef.current.querySelector('.flex.justify-center.my-4')?.clientHeight || 80;
      const paddingHeight = 96; // Augmenté pour donner plus d'espace
      
      const totalHeight = contentHeight + headerHeight + tabsHeight + paddingHeight;
      setModalHeight(`${totalHeight}px`);

      const resizeObserver = new ResizeObserver(() => {
        if (contentRef.current && !isTransitioning && modalRef.current) {
          const newContentHeight = contentRef.current.scrollHeight;
          const newTotalHeight = newContentHeight + headerHeight + tabsHeight + paddingHeight;
          setModalHeight(`${newTotalHeight}px`);
        }
      });

      resizeObserver.observe(contentRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [activeTab, isTransitioning]);

  const handleTabChange = (newTab: TabType) => {
    if (newTab === activeTab || isTransitioning) return;
    
    setIsTransitioning(true);
    
    setTimeout(() => {
      setActiveTab(newTab);
      
      setTimeout(() => {
        if (contentRef.current && modalRef.current) {
          const newContentHeight = contentRef.current.scrollHeight;
          const headerHeight = modalRef.current.querySelector('header')?.clientHeight || 80;
          const tabsHeight = modalRef.current.querySelector('.flex.justify-center.my-4')?.clientHeight || 80;
          const paddingHeight = 96; // Augmenté pour donner plus d'espace
          
          const newTotalHeight = newContentHeight + headerHeight + tabsHeight + paddingHeight;
          setModalHeight(`${newTotalHeight}px`);
        }
        
        setTimeout(() => {
          setIsTransitioning(false);
        }, 60);
      }, 30);
    }, 100);
  };

  const resetTab = () => {
    setActiveTab(defaultTab);
    setIsTransitioning(false);
    setModalHeight('auto');
  };

  return {
    activeTab,
    isTransitioning,
    modalHeight,
    contentRef,
    modalRef,
    handleTabChange,
    resetTab
  };
};
