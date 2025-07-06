import React, { useState, useEffect } from 'react';
import ToolsMarketplace from '../components/tools/ToolsMarketplace';
import ComingSoonDialog from '@/components/ui/ComingSoonDialog';

const Outils = () => {
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);

  useEffect(() => {
    setIsComingSoonOpen(true);
  }, []);

  return (
    <div className="animate-fade-in">
      <ToolsMarketplace />
      <ComingSoonDialog
        isOpen={isComingSoonOpen}
        onClose={() => setIsComingSoonOpen(false)}
        description={
          <>
            Prochainement, accédez à une boîte à outils IA complète pour tous vos besoins entrepreneuriaux. Outil.IA regroupera des dizaines d'outils spécialisés pour vous faire gagner du temps :
            <br /><br />
            ✅ <b>Juridique</b> : Générateur de politiques de confidentialité, mentions légales, CGV
            <br />
            ✅ <b>Marketing</b> : Créateur de contenu SEO, analyseur de mots-clés, générateur de newsletters
            <br />
            ✅ <b>Communication</b> : Rédaction de posts réseaux sociaux, emails commerciaux, communiqués
            <br />
            ✅ <b>Gestion</b> : Créateur de factures, générateur de contrats, outils RH
            <br /><br />
            Chaque outil sera optimisé pour votre secteur d'activité et générera du contenu professionnel prêt à l'emploi.
          </>
        }
      />
    </div>
  );
};

export default Outils;
