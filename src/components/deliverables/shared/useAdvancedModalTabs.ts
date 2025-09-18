import { useState, useRef, useLayoutEffect } from 'react';

export type TabType = 'structure' | 'definition' | 'recommendations' | 'chat';

interface UseModalTabsProps {
  hasContent?: boolean;
  hasDefinition?: boolean;
  hasRecommendations?: boolean;
  hasChat?: boolean;
  defaultTab?: TabType;
}

export const useAdvancedModalTabs = ({
  hasContent = true,
  hasDefinition = false,
  hasRecommendations = false,
  hasChat = false,
  defaultTab
}: UseModalTabsProps) => {
  // Détermine l'onglet initial
  const getInitialTab = (): TabType => {
    if (defaultTab) return defaultTab;
    if (hasContent) return 'structure';
    if (hasRecommendations) return 'recommendations';
    if (hasDefinition) return 'definition';
    if (hasChat) return 'chat';
    return 'structure';
  };

  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [modalHeight, setModalHeight] = useState<string>('auto');
  
  const contentRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // UseLayoutEffect pour mesurer la hauteur initiale et surveiller les changements
  useLayoutEffect(() => {
    if (contentRef.current && modalRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      const headerHeight = modalRef.current.querySelector('.sticky')?.clientHeight || 100;
      const tabsHeight = modalRef.current.querySelector('.border-b')?.clientHeight || 50;
      const paddingHeight = 48; // p-6 pt-4 = 24+16 = 40px + petit margin
      
      const totalHeight = contentHeight + headerHeight + tabsHeight + paddingHeight;
      setContentHeight(contentHeight);
      setModalHeight(`${totalHeight}px`);

      // Observer les changements de taille du contenu
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

  const handleTabChange = (newTab: TabType) => {
    if (newTab === activeTab || isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Phase 1: Flou du contenu actuel
    setTimeout(() => {
      // Change le contenu
      setActiveTab(newTab);
      
      // Phase 2: Mesure la nouvelle hauteur et anime vers celle-ci
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
        
        // Phase 3: Retire le flou
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
    setActiveTab,
    isTransitioning,
    contentHeight,
    modalHeight,
    contentRef,
    modalRef,
    handleTabChange,
    resetTab
  };
};