import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Partenaires = () => {
  const [showPopup, setShowPopup] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [domain, setDomain] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const handleSubmit = async () => {
    if (!user || !firstName.trim() || !lastName.trim() || !portfolio.trim() || !domain.trim()) {
      console.error("User not logged in, or first name, last name, portfolio, or domain is empty.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('https://n8n.eec-technologies.fr/webhook/partenaires-freelances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          firstName: firstName,
          lastName: lastName,
          portfolio: portfolio,
          domain: domain,
        }),
      });

      if (response.ok) {
        console.log("Data sent successfully!");
        setShowPopup(false); // Close popup on success
      } else {
        console.error("Failed to send data:", response.statusText);
        // Optionally, show an error message to the user
      }
    } catch (error) {
      console.error("Error sending data:", error);
      // Optionally, show an error message to the user
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Partenaires</h1>

      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="w-[90vw] rounded-lg">
          <DialogHeader>
            <DialogTitle className="bg-gradient-primary text-transparent bg-clip-text text-3xl">Fonctionnalité à venir</DialogTitle>
            <Separator className="my-4" />
            <DialogDescription className="text-black">
              Cette page servira à mettre en relation les porteurs de projets avec des freelanceurs partenaires d'Aurentia spécialisés dans des domaines bien précis : SEO, marketing, logo, charte graphique, développement web, etc.
              <br /><br />
              Imaginez un système où vous pouvez trouver le partenaire idéal pour chaque besoin de votre projet, un peu comme Fiverr, mais avec des experts triés sur le volet et intégrés à l'écosystème Aurentia.
            </DialogDescription>
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <div className="text-black text-center mb-4">
                <p className="font-semibold">Devenir partenaire Aurentia pourrait vous intéresser ?</p>
                <p>N'hésitez pas à nous le faire savoir !</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Prénom"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="text"
                    placeholder="Nom"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="flex-1"
                  />
              </div>
              <Input
                type="text"
                placeholder="Votre site / Portfolio"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                className="flex-1"
              />
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Votre domaine d'activité"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="flex-1"
                />
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !firstName.trim() || !lastName.trim() || !portfolio.trim() || !domain.trim()}
                    className="rounded-xl w-10 h-10 p-0 bg-gradient-primary hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex-shrink-0"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    ) : (
                      <ArrowUp size={18} className="text-white" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Content for the Partenaires page will go here */}
      <div className="text-gray-700">
        <p>Bienvenue sur la page Partenaires d'Aurentia. Nous travaillons à vous offrir une plateforme où vous pourrez facilement trouver des freelanceurs qualifiés pour tous vos besoins en développement de projet.</p>
        <p className="mt-4">Restez connecté pour plus de mises à jour !</p>
      </div>
    </div>
  );
};

export default Partenaires;
