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

const Beta = () => {
  const [betaCode, setBetaCode] = useState("");
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showInvalidCodeMessage, setShowInvalidCodeMessage] = useState(false);
  const [name, setName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(true); // State to control popup visibility

  const navigate = useNavigate();

  const handleJoinWaitlist = () => {
    setShowWaitlistForm(true);
    setShowSuccessMessage(false); // Hide success message if trying again
    setShowInvalidCodeMessage(false); // Hide invalid code message if trying again
    // TODO: Implement waitlist logic
    console.log("Joining waitlist with code:", betaCode);
  };

  const handleValidateCode = async () => {
    try {
      const response = await fetch("https://n8n.eec-technologies.fr/webhook/code-beta", {
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
        className="w-[90vw] sm:max-w-md p-8 bg-white rounded-xl shadow-sm animate-fade-in border border-aurentia-orange" // Adjusted width for mobile
        onPointerDownOutside={(e) => e.preventDefault()} // Prevent closing on outside click
      >
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-semibold mb-2 bg-gradient-to-r from-aurentia-pink to-aurentia-orange bg-clip-text text-transparent">
            Rejoindre la bêta
          </DialogTitle>
        </DialogHeader>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="why-beta">
            <AccordionTrigger>Pourquoi rejoindre la bêta ?</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4">
                <div>
                  <p className="font-semibold">✨ Accès VIP aux contenus premium</p>
                  <p className="text-sm text-gray-600">Études concurrence, business models gagnants, analyses de marché avancées... tout le contenu payant en avant-première</p>
                </div>
                <div>
                  <p className="font-semibold">✨ Première ligne des innovations</p>
                  <p className="text-sm text-gray-600">Teste les nouvelles fonctionnalités IA avant tout le monde et influence leur développement</p>
                </div>
                <div>
                  <p className="font-semibold">✨ Économies garanties</p>
                  <p className="text-sm text-gray-600">Accès gratuit pendant la Beta à du contenu qui sera payant après le lancement</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

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
              <div className="grid gap-4 py-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <Input
                    id="name"
                    placeholder="Nom"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    id="firstName"
                    placeholder="Prénom"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <Input
                  id="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  id="comment"
                  placeholder="Commentaire"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Button onClick={async () => {
                  try {
                    const response = await fetch("https://n8n.eec-technologies.fr/webhook/inscription-beta", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ name, firstName, email, comment }),
                    });
                    if (response.ok) {
                      console.log("Waitlist form submitted successfully!");
                      setName("");
                      setFirstName("");
                      setEmail("");
                      setComment("");
                      setShowWaitlistForm(false);
                      setShowSuccessMessage(true);
                    } else {
                      console.error("Failed to submit waitlist form:", response.statusText);
                      // Optionally, show an error message
                    }
                  } catch (error) {
                    console.error("Error submitting waitlist form:", error);
                    // Optionally, show an error message
                  }
                }}>Valider</Button>
              </div>
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
