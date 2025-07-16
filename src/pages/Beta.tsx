import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const Beta = () => {
  const [betaCode, setBetaCode] = useState("");
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showInvalidCodeMessage, setShowInvalidCodeMessage] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(true); // State to control popup visibility

  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const betaCodeValidated = localStorage.getItem('betaCodeValidated') === 'true';

      if (session) {
        // User is logged in, always go to dashboard
        setIsPopupOpen(false);
        navigate('/dashboard');
      } else if (betaCodeValidated) {
        // User has validated beta code but is not logged in, go to login page
        setIsPopupOpen(false);
        navigate('/login');
      }
      // If neither, stay on beta page to allow code entry
    };

    checkAccess();
  }, [navigate]);

  useEffect(() => {
    if (showWaitlistForm) {
      // Ensure Tally.loadEmbeds() is called only when the form is visible
      // and the Tally script has loaded.
      if (window.Tally) {
        window.Tally.loadEmbeds();
      } else {
        // If Tally script is not yet loaded, wait for it
        const script = document.querySelector('script[src="https://tally.so/widgets/embed.js"]');
        script?.addEventListener('load', () => {
          window.Tally.loadEmbeds();
        });
      }
    }
  }, [showWaitlistForm]);

  console.log("Beta component rendered");

  const handleJoinWaitlist = () => {
    setShowWaitlistForm(true);
    setShowSuccessMessage(false); // Hide success message if trying again
    setShowInvalidCodeMessage(false); // Hide invalid code message if trying again
    console.log("Joining waitlist with code:", betaCode);
  };

  const handleValidateCode = async () => {
    try {
      const response = await fetch("https://n8n.srv906204.hstgr.cloud/webhook/code-beta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ betaCode }),
      });
      const result = await response.json(); // Assuming the webhook returns JSON
      console.log("Webhook response:", result); // Log the response

      if (result.success === "success") {
        console.log("Beta code validated successfully!");
        localStorage.setItem('betaCodeValidated', 'true'); // Set the flag
        navigate('/login'); // Redirect to login page
      } else {
        console.log("Invalid beta code.");
        setShowInvalidCodeMessage(true);
      }
    } catch (error) {
      console.error("Error validating beta code:", error);
      // Optionally, show an error message
    }
  };

  return (
    <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
      <DialogContent
        className="w-[90vw] sm:max-w-md p-8 bg-white rounded-xl shadow-sm animate-fade-in border border-aurentia-orange max-h-[90vh] overflow-y-auto" // Adjusted width for mobile, added max-height and overflow for scrolling
        onPointerDownOutside={(e) => e.preventDefault()} // Prevent closing on outside click
      >
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-semibold mb-2 bg-gradient-to-r from-aurentia-pink to-aurentia-orange bg-clip-text text-transparent">
            Rejoindre la bêta
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 mb-4">
            Aurentia est actuellement en bêta. Vous aurez donc accès aux livrables premium.
          </DialogDescription>
        </DialogHeader>
        {!showSuccessMessage && !showInvalidCodeMessage ? (
          <>
            <div className="grid gap-4 py-4 flex justify-center">
              <Input
                id="beta-code"
                placeholder="saisir le code Bêta"
                value={betaCode}
                onChange={(e) => setBetaCode(e.target.value)}
              />
            </div>
            {betaCode && (
              <div className="flex justify-center mt-4">
                <Button onClick={handleValidateCode}>Valider</Button>
              </div>
            )}
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-xs uppercase bg-white px-2">
                ou
              </span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            <div className="flex justify-center">
              <Button onClick={handleJoinWaitlist}>Rejoindre la liste d'attente</Button>
            </div>
            {showWaitlistForm && (
              <iframe data-tally-src="https://tally.so/embed/3Xd5Jj?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1" loading="lazy" width="100%" height="510" frameBorder={0} marginHeight={0} marginWidth={0} title="Liste d'attente Aurentia bêta"></iframe>
            )}
          </>
        ) : showSuccessMessage ? (
          <div className="text-center py-8">
            <h2 className="text-2xl font-semibold mb-4">Inscription à la bêta réussit !</h2>
            <p className="text-gray-600">Nous reviendrons vers vous très prochainement avec un code Bêta pour que vous puissez accéder à la plateforme.</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <h2 className="text-2xl font-semibold mb-4">Code Bêta invalide ou inexistant.</h2>
            <p className="text-gray-600 mb-4">Veuillez vérifier votre code ou rejoindre la liste d'attente pour être notifié du lancement.</p>
            <Button onClick={handleJoinWaitlist}>Rejoindre la liste d'attente</Button>
            <p className="text-gray-600 mt-4">Vous pouvez également nous contacter à <a href="mailto:office.aurentia@gmail.com" className="text-blue-600 hover:underline">office.aurentia@gmail.com</a></p>
          </div>
        )}
        <p className="text-center text-sm text-gray-500 mt-4">Les places sont limitées, rejoignez la liste d'attente dès maintenant !</p>
      </DialogContent>
    </Dialog>
  );
};

export default Beta;
