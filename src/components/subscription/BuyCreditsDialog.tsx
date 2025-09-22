import { useCreditsDialogTabs, TabType } from "@/hooks/useCreditsDialogTabs";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import logoAurentia from "/logo-aurentia-sidebar.svg";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const creditOptions = [
  {
    credits: "1 000",
    price: "10€",
    image: "/credits-image/1000-credits.png",
    description: { base: "1000" },
  },
  {
    credits: "3 000",
    price: "25€",
    image: "/credits-image/3000-credits.png",
    description: { base: "2 500", bonus: "500" },
  },
  {
    credits: "7 000",
    price: "50€",
    image: "/credits-image/7000-credits.png",
    description: { base: "5 000", bonus: "2 000" },
  },
];

interface BuyCreditsDialogProps {
  children: React.ReactNode;
}

const BuyCreditsDialog = ({ children }: BuyCreditsDialogProps) => {
  const {
    activeTab,
    isTransitioning,
    modalHeight,
    contentRef,
    modalRef,
    handleTabChange,
    resetTab
  } = useCreditsDialogTabs({ defaultTab: "credits" });
  const isMobile = useIsMobile();

  return (
    <Dialog onOpenChange={(isOpen) => !isOpen && resetTab()}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        ref={modalRef}
        className="bg-gray-50 w-[90vw] md:w-[70vw] max-w-none overflow-y-auto rounded-lg"
        style={{
          height: modalHeight,
          maxHeight: 'calc(100vh - 100px)',
          transition: 'height 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        <DialogHeader className="flex flex-row items-center justify-start p-4 border-b">
          <img src={logoAurentia} alt="Aurentia Logo" className="h-6 w-auto mr-3" />
          <DialogTitle className="text-lg font-medium text-slate-800">
            Acheter des crédits
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col flex-grow overflow-hidden pt-4">
          <div className="flex justify-center my-4">
            <ToggleGroup
              type="single"
              value={activeTab}
              onValueChange={(value) => handleTabChange(value as TabType)}
              className="mb-6"
            >
              <ToggleGroupItem value="subscription">Abonnements</ToggleGroupItem>
              <ToggleGroupItem value="credits">Crédits</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div
            ref={contentRef}
            className={`flex-grow flex justify-center items-start transition-all duration-300 ${
              isTransitioning ? 'opacity-0 blur-sm transform translate-y-2' : 'opacity-100 blur-0 transform translate-y-0'
            }`}
          >
            {activeTab === "credits" ? (
              isMobile ? (
                <CreditsSlider />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                  {creditOptions.map((option) => (
                    <Card
                      key={option.price}
                      className={`group relative rounded-xl flex flex-col aspect-square w-full bg-white border border-gray-200 shadow-lg`}
                    >
                      <CardHeader className="text-center pt-8 flex-grow flex flex-col justify-center items-center transition-all duration-300 group-hover:blur-sm">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="bg-gray-100 rounded-md p-2 flex items-center space-x-1">
                            <img src="/credit-3D.png" alt="crédits" className="w-4 h-4" />
                            <p className="text-base text-slate-600">{option.description.base}</p>
                          </div>
                          {option.description.bonus && (
                            <>
                              <span className="text-slate-600 font-bold">+</span>
                              <div className="bg-gray-100 rounded-md p-2 flex items-center space-x-1">
                                <img src="/credit-3D.png" alt="crédits bonus" className="w-4 h-4" />
                                <p className="text-base text-slate-600">{option.description.bonus}</p>
                              </div>
                            </>
                          )}
                        </div>
                        <img
                          src={option.image}
                          alt={`${option.credits} credits`}
                          className="w-44 h-44 object-contain transition-transform group-hover:scale-105"
                        />
                        <div className="border-t border-gray-200 w-full mt-12 mb-4"></div>
                        <div className="bg-gray-100 rounded-lg px-4 py-2">
                          <p className="text-4xl font-bold text-aurentia-orange-aurentia flex items-baseline">
                            €{option.price.replace('€', '')}
                            <span className="text-sm font-normal ml-1">EUR</span>
                          </p>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow flex-col justify-end p-6 md:hidden">
                        <Button className="w-full bg-aurentia-orange-aurentia hover:bg-aurentia-orange-dark text-white font-semibold py-3 rounded-lg shadow-sm">
                          Obtenir
                        </Button>
                      </CardContent>
                      <div className="absolute inset-0 hidden justify-center items-center group-hover:flex">
                        <Button className="bg-aurentia-orange-aurentia hover:bg-aurentia-orange-dark text-white font-semibold py-3 px-6 rounded-lg shadow-sm">
                          Obtenir
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )
            ) : (
              <div className="flex justify-center items-center">
                <Card className="rounded-xl shadow-lg w-full max-w-sm">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-slate-800 font-bold">
                      Abonnement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-slate-600">
                      Passez à un abonnement pour des avantages exclusifs.
                    </p>
                    <Button className="w-full mt-6 bg-aurentia-orange-aurentia hover:bg-aurentia-orange-dark text-white font-bold">
                      Découvrir les abonnements
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    };
  },
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

const CreditsSlider = () => {
  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection: number) => {
    setPage([(page + newDirection + creditOptions.length) % creditOptions.length, newDirection]);
  };

  const option = creditOptions[page];

  return (
    <div className="relative flex items-center justify-center w-full p-6 overflow-hidden h-[450px]">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => paginate(-1)}
        className="absolute left-0 md:left-4 z-20 bg-gray-100 rounded-full shadow"
      >
        <ChevronLeft className="h-8 w-8 text-aurentia-orange-aurentia" />
      </Button>

      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);

            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
          className="absolute w-full max-w-sm"
        >
          <Card
            className={`relative rounded-xl flex flex-col aspect-square w-full bg-white border border-gray-200 shadow-lg`}
          >
            <CardHeader className="text-center pt-8 flex-grow flex flex-col justify-center items-center">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gray-100 rounded-md p-2 flex items-center space-x-1">
                  <img src="/credit-3D.png" alt="crédits" className="w-4 h-4" />
                  <p className="text-base text-slate-600">{option.description.base}</p>
                </div>
                {option.description.bonus && (
                  <>
                    <span className="text-slate-600 font-bold">+</span>
                    <div className="bg-gray-100 rounded-md p-2 flex items-center space-x-1">
                      <img src="/credit-3D.png" alt="crédits bonus" className="w-4 h-4" />
                      <p className="text-base text-slate-600">{option.description.bonus}</p>
                    </div>
                  </>
                )}
              </div>
              <img
                src={option.image}
                alt={`${option.credits} credits`}
                className="w-44 h-44 object-contain"
              />
              <div className="border-t border-gray-200 w-full mt-12 mb-4"></div>
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <p className="text-4xl font-bold text-aurentia-orange-aurentia flex items-baseline">
                  €{option.price.replace('€', '')}
                  <span className="text-sm font-normal ml-1">EUR</span>
                </p>
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex-col justify-end p-6">
              <Button className="w-full bg-aurentia-orange-aurentia hover:bg-aurentia-orange-dark text-white font-semibold py-3 rounded-lg shadow-sm">
                Obtenir
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => paginate(1)}
        className="absolute right-0 md:right-4 z-20 bg-aurentia-orange-aurentia rounded-full shadow"
      >
        <ChevronRight className="h-8 w-8 text-white" />
      </Button>
    </div>
  );
};

export default BuyCreditsDialog;
