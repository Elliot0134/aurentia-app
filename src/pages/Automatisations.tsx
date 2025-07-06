
import React, { useState, useEffect } from 'react';
import AutomationMarketplace from '@/components/automation/AutomationMarketplace';
import ComingSoonDialog from '@/components/ui/ComingSoonDialog';

const Automatisations = () => {
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);

  useEffect(() => {
    setIsComingSoonOpen(true);
  }, []);

  return (
    <div className="animate-fade-in">
      <AutomationMarketplace />
      <ComingSoonDialog
        isOpen={isComingSoonOpen}
        onClose={() => setIsComingSoonOpen(false)}
        description={
          <>
            Bientôt, laissez Aurentia IA gérer les tâches répétitives de votre entreprise en mode pilote automatique. Nos automatisations vous permettront de :
            <br /><br />
            ✅ <b>Veille stratégique</b> : Analyse de marché hebdomadaire, surveillance concurrentielle automatique
            <br />
            ✅ <b>Relance client</b> : Envoi automatique d'emails de relance, images et contenus personnalisés
            <br />
            ✅ <b>Gestion administrative</b> : Facturation récurrente, rappels d'échéances, suivi des paiements
            <br />
            ✅ <b>Marketing</b> : génération et publication des posts sur les réseaux
            <br />
            ✅ <b>Monitoring business</b> : Rapports de performance automatiques, alertes sur les KPIs critiques
            <br /><br />
            Configurez une fois, profitez à vie ! Chaque automatisation s'adapte à votre rythme et vos besoins spécifiques.
          </>
        }
      />
    </div>
  );
};

export default Automatisations;
