import { useState, useRef, useLayoutEffect } from 'react';

export type CustomTabType = string;

interface UseCustomModalTabsProps {
  tabs: CustomTabType[];
  defaultTab?: CustomTabType;
}

export const useCustomModalTabs = ({
  tabs,
  defaultTab
}: UseCustomModalTabsProps) => {
  const getInitialTab = (): CustomTabType => {
    if (defaultTab && tabs.includes(defaultTab)) return defaultTab;
    return tabs[0] || '';
  };

  const [activeTab, setActiveTab] = useState<CustomTabType>(getInitialTab());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [modalHeight, setModalHeight] = useState<string>('auto');
  
  const contentRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (contentRef.current && modalRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      const headerHeight = modalRef.current.querySelector('.sticky')?.clientHeight || 100;
      const tabsHeight = modalRef.current.querySelector('.border-b')?.clientHeight || 50;
      const paddingHeight = 48;
      
      const totalHeight = contentHeight + headerHeight + tabsHeight + paddingHeight;
      setContentHeight(contentHeight);
      setModalHeight(`${totalHeight}px`);

      const resizeObserver = new ResizeObserver(() => {
        if (contentRef.current && !isTransitioning && modalRef.current) {
          const newContentHeight = contentRef.current.scrollHeight;
          if (newContentHeight !== contentHeight) {
            const newTotalHeight = newContentHeight + headerHeight + tabsHeight + paddingHeight;
            setContentHeight(newContentHeight);
            setModalHeight(`${newTotalHeight}px`);
          }
        }
      });

      resizeObserver.observe(contentRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [activeTab, isTransitioning]);

  const handleTabChange = (newTab: CustomTabType) => {
    if (newTab === activeTab || isTransitioning) return;
    
    setIsTransitioning(true);
    
    setTimeout(() => {
      setActiveTab(newTab);
      
      setTimeout(() => {
        if (contentRef.current && modalRef.current) {
          const newContentHeight = contentRef.current.scrollHeight;
          const headerHeight = modalRef.current.querySelector('.sticky')?.clientHeight || 100;
          const tabsHeight = modalRef.current.querySelector('.border-b')?.clientHeight || 50;
          const paddingHeight = 48;
          
          const newTotalHeight = newContentHeight + headerHeight + tabsHeight + paddingHeight;
          setContentHeight(newContentHeight);
          setModalHeight(`${newTotalHeight}px`);
        }
        
        setTimeout(() => {
          setIsTransitioning(false);
        }, 60);
      }, 30);
    }, 100);
  };

  const resetTab = () => {
    setActiveTab(getInitialTab());
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
