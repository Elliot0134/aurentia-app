import { FormEvent, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { validateInvitationCode, useInvitationCode } from "@/services/invitationService";
import { InvitationValidationResult } from "@/types/userTypes";
import { emailConfirmationService } from "@/services/emailConfirmationService";
import { EmailConfirmationModal } from "@/components/auth/EmailConfirmationModal";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 0: code invitation, 1: sélection rôle, 2: inscription
  const [invitationCode, setInvitationCode] = useState("");
  const [codeValidation, setCodeValidation] = useState<InvitationValidationResult | null>(null);
  const [selectedRole, setSelectedRole] = useState<'individual' | 'admin' | null>(null);
  const [showEmailConfirmationModal, setShowEmailConfirmationModal] = useState(false);
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCodeValidation = async () => {
    if (!invitationCode.trim()) {
      setCodeValidation(null);
      return;
    }

    setLoading(true);
    try {
      const validation = await validateInvitationCode(invitationCode);
      setCodeValidation(validation);
      
      if (validation.valid) {
        toast({
          title: "Code valide !",
          description: `Vous rejoindrez ${validation.organization?.name || 'Aurentia'} !`,
        });
      } else {
        toast({
          title: "Code invalide",
          description: validation.reason,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur de validation",
        description: error.message || "Une erreur s'est produite lors de la validation du code.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast({
        title: "Erreur d'inscription",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    console.log("handleSubmit: Début du processus d'inscription.");
    try {
      if (password !== confirmPassword) {
        console.log("handleSubmit: Mots de passe ne correspondent pas.");
        toast({
          title: "Erreur d'inscription",
          description: "Les mots de passe ne correspondent pas.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      console.log("handleSubmit: Appel à supabase.auth.signUp...");
      // Étape 1: Créer le compte utilisateur
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone_number: phoneNumber,
          },
          // Désactiver la confirmation automatique de Supabase
          emailRedirectTo: undefined,
        },
      });

      if (error) {
        console.error("handleSubmit: Erreur lors de supabase.auth.signUp:", error);
        throw error;
      }
      console.log("handleSubmit: supabase.auth.signUp réussi. Data:", data);

      const user = data.user; // Utiliser directement l'utilisateur retourné par signUp

      if (user) {
        console.log("handleSubmit: Utilisateur créé. ID:", user.id);
        // Étape 2: Configurer le rôle utilisateur
        let userRole: string | null = null;
        
        if (invitationCode && codeValidation?.valid) {
          console.log("handleSubmit: Gestion du code d'invitation...");
          // Cas avec code d'invitation
          try {
            await useInvitationCode(invitationCode, user.id);
            userRole = codeValidation.role;
            
            toast({
              title: "Inscription réussie !",
              description: `Bienvenue dans ${codeValidation.organization?.name || 'Aurentia'} !`,
            });
            console.log("handleSubmit: Code d'invitation utilisé avec succès. Rôle:", userRole);
          } catch (invitationError: any) {
            console.error("handleSubmit: Erreur lors de l'utilisation du code:", invitationError);
            toast({
              title: "Erreur de code",
              description: invitationError.message || "Une erreur s'est produite lors de l'utilisation du code.",
              variant: "destructive",
            });
            // Continuer malgré l'erreur pour permettre la confirmation d'email
          }
        } else if (selectedRole) {
          console.log("handleSubmit: Gestion de la sélection de rôle manuelle...");
          // Cas avec sélection de rôle manuelle
          try {
            const { error: updateError } = await supabase
              .from('profiles' as any)
              .update({ user_role: selectedRole })
              .eq('id', user.id);

            if (updateError) {
              console.warn("handleSubmit: Erreur lors de l'attribution du rôle:", updateError);
              // Ne pas faire échouer l'inscription pour ça
            } else {
              userRole = selectedRole;
            }
            
            toast({
              title: "Inscription réussie !",
              description: `Bienvenue ! Vous êtes maintenant configuré en tant que ${selectedRole === 'individual' ? 'entrepreneur' : 'structure d\'accompagnement'}.`,
            });
            console.log("handleSubmit: Rôle attribué avec succès. Rôle:", userRole);
          } catch (roleError: any) {
            console.warn("handleSubmit: Erreur lors de l'attribution du rôle:", roleError);
            // Ne pas faire échouer l'inscription pour ça
          }
        }

        console.log("handleSubmit: Appel à emailConfirmationService.sendConfirmationEmail...");
        // Étape 3: Envoyer l'email de confirmation
        try {
          const confirmationResult = await emailConfirmationService.sendConfirmationEmail({
            email,
            userId: user.id,
            isResend: false
          });
          console.log("handleSubmit: Résultat de sendConfirmationEmail:", confirmationResult);

          // Toujours afficher le modal après l'inscription, que l'email ait été envoyé avec succès ou non
          setRegisteredUserId(user.id);
          setShowEmailConfirmationModal(true);

          if (confirmationResult.success) {
            console.log("handleSubmit: Email de confirmation envoyé avec succès. Affichage du modal.");
            toast({
              title: "Email de confirmation envoyé !",
              description: "Vérifiez votre boîte de réception pour activer votre compte.",
            });
          } else {
            console.log("handleSubmit: Email de confirmation non envoyé (success: false). Affichage du modal.");
            toast({
              title: "Inscription réussie",
              description: confirmationResult.error || "Erreur d'envoi de l'email de confirmation. Veuillez vérifier votre boîte de réception ou demander un nouveau lien.",
              variant: "destructive",
            });
          }
        } catch (emailError: any) {
          console.error("handleSubmit: Erreur lors de l'envoi de l'email de confirmation:", emailError);
          
          // Inscription réussie mais email échoué, afficher le modal
          setRegisteredUserId(user.id);
          setShowEmailConfirmationModal(true);

          toast({
            title: "Inscription réussie",
            description: emailError.message || "Erreur d'envoi de l'email. Veuillez vérifier votre boîte de réception ou demander un nouveau lien.",
            variant: "destructive",
          });
        }
      } else {
        console.error("handleSubmit: data.user est null après supabase.auth.signUp réussi. Ceci est inattendu.");
        // Si data.user est null, c'est une erreur inattendue après un signUp réussi.
        // On affiche un toast d'erreur et on ne tente pas d'afficher le modal car il n'y a pas d'ID utilisateur valide.
        toast({
          title: "Erreur d'inscription",
          description: "Un problème inattendu est survenu. Veuillez réessayer.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("handleSubmit: Erreur globale d'inscription:", error);
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur s'est produite lors de l'inscription",
        variant: "destructive",
      });
    } finally {
      console.log("handleSubmit: Fin du processus d'inscription. Loading:", false);
      setLoading(false);
    }
  };

  // Handler pour la confirmation d'email réussie
  const handleEmailConfirmed = () => {
    setShowEmailConfirmationModal(false);
    
    toast({
      title: "Email confirmé !",
      description: "Votre compte est maintenant actif. Redirection vers votre dashboard...",
    });
    
    // Déterminer la redirection selon le rôle
    let roleBasePath = "/individual/dashboard";
    
    if (invitationCode && codeValidation?.valid) {
      roleBasePath = `/${codeValidation.role}/dashboard`;
    } else if (selectedRole) {
      roleBasePath = `/${selectedRole}/dashboard`;
    }
    
    // Redirection avec un délai pour laisser le temps au toast
    setTimeout(() => {
      navigate(roleBasePath);
    }, 1500);
  };

  // Handler pour fermer le modal (manuel)
  const handleCloseEmailModal = () => {
    setShowEmailConfirmationModal(false);
    
    // Proposer à l'utilisateur de continuer sans confirmation ou attendre
    toast({
      title: "Email de confirmation en attente",
      description: "Veuillez confirmer votre email pour accéder à votre tableau de bord.",
    });
    // Ne pas rediriger, l'utilisateur reste sur la page d'inscription avec le modal fermé.
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "http://app.aurentia.fr/role-selection"
        }
      });
      
      if (error) throw error;
      
      // Redirect is handled by Supabase
    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur s'est produite lors de l'inscription avec Google",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4">
      {step === 0 && (
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-sm animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold mb-2 bg-gradient-to-r from-aurentia-pink to-aurentia-orange bg-clip-text text-transparent">
              Rejoindre Aurentia
            </h1>
            <p className="text-gray-600">
              Avez-vous un code d'invitation ?
            </p>
          </div>
          
          {/* Section code d'invitation */}
          <div className="mb-6">
            <div className="space-y-2">
              <label htmlFor="invitation-code" className="block text-sm font-medium text-gray-700">
                Code d'invitation (optionnel)
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="invitation-code"
                  type="text"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value)}
                  onBlur={handleCodeValidation}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurentia-pink/30 focus:border-aurentia-pink transition"
                  placeholder="Votre code d'invitation"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="p-2 rounded-lg bg-orange-100 hover:bg-aurentia-orange transition-all duration-200"
                  onClick={handleCodeValidation}
                  disabled={loading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-aurentia-pink hover:text-white transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Feedback visuel */}
            {codeValidation?.valid && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span className="text-green-800 font-medium">
                    Vous rejoindrez : <strong>{codeValidation.organization?.name || 'Aurentia'}</strong>
                  </span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  {codeValidation.role === 'admin' && 'en tant qu\'administrateur'}
                  {codeValidation.role === 'member' && 'en tant qu\'entrepreneur'}
                  {codeValidation.role === 'super_admin' && 'en tant que super administrateur'}
                </p>
              </div>
            )}
            
            {codeValidation?.valid === false && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <span className="text-red-600">❌ {codeValidation.reason}</span>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="button"
              className="w-full py-3 flex items-center justify-center gap-2 bg-aurentia-pink text-white rounded-lg hover:bg-aurentia-pink/90 transition group"
              onClick={() => {
                if (codeValidation?.valid) {
                  // Avec code d'invitation, aller directement à l'inscription
                  setStep(2);
                } else {
                  // Sans code, aller à la sélection de rôle
                  setStep(1);
                }
              }}
            >
              {codeValidation?.valid ? 'Continuer l\'inscription' : 'S\'inscrire sans code'}
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-sm animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold mb-2 bg-gradient-to-r from-aurentia-pink to-aurentia-orange bg-clip-text text-transparent">
              Choisissez votre profil
            </h1>
            <p className="text-gray-600">
              Sélectionnez le type de compte qui correspond le mieux à votre situation
            </p>
          </div>

          <div className="space-y-4">
            {/* Carte Entrepreneur */}
            <div
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                selectedRole === 'individual'
                ? 'border-aurentia-pink bg-aurentia-pink/5'
                : 'border-gray-200 hover:border-aurentia-pink hover:bg-aurentia-pink/5'
              }`}
              onClick={() => setSelectedRole('individual')}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-aurentia-pink to-aurentia-orange rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Entrepreneur
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Je porte un projet entrepreneurial
                  </p>
                </div>
              </div>
            </div>

            {/* Carte Structure d'accompagnement */}
            <div
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                selectedRole === 'admin'
                ? 'border-aurentia-orange bg-aurentia-orange/5'
                : 'border-gray-200 hover:border-aurentia-orange hover:bg-aurentia-orange/5'
              }`}
              onClick={() => setSelectedRole('admin')}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-aurentia-orange to-yellow-500 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Structure d'accompagnement
                  </h3>
                  <p className="text-gray-600 text-sm">
                    J'accompagne des entrepreneurs
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-8">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="text-sm text-gray-500 hover:text-aurentia-pink transition"
            >
              ← Retour
            </button>
            
            <button
              type="button"
              className="px-6 py-2 bg-aurentia-pink text-white rounded-lg hover:bg-aurentia-pink/90 transition disabled:opacity-50"
              onClick={() => setStep(2)}
              disabled={!selectedRole}
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-sm animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold mb-2 bg-gradient-to-r from-aurentia-pink to-aurentia-orange bg-clip-text text-transparent">
              Créer un compte Aurentia
            </h1>
            {codeValidation?.valid && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-green-600 text-base font-medium">
                  🎉 Inscription pour {codeValidation.organization?.name || 'Aurentia'}
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mx-auto">
            <div className="flex space-x-4">
              <div className="space-y-2 w-1/2">
                <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <input
                  id="last-name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurentia-pink/30 focus:border-aurentia-pink transition"
                  placeholder="Votre nom"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2 w-1/2">
                <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <input
                  id="first-name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurentia-pink/30 focus:border-aurentia-pink transition"
                  placeholder="Votre prénom"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <input
                id="phone-number"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurentia-pink/30 focus:border-aurentia-pink transition"
                placeholder="Votre numéro de téléphone"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurentia-pink/30 focus:border-aurentia-pink transition"
                placeholder="votre@email.com"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurentia-pink/30 focus:border-aurentia-pink transition"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurentia-pink/30 focus:border-aurentia-pink transition"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full btn-primary py-3"
                disabled={loading}
              >
                {loading ? "Inscription..." : "S'inscrire"}
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400">ou</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              disabled={loading}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.1716 8.36791H17.5001V8.33333H10.0001V11.6667H14.7097C14.0221 13.6071 12.1801 15 10.0001 15C7.23866 15 5.00008 12.7614 5.00008 10C5.00008 7.23858 7.23866 5 10.0001 5C11.2959 5 12.4784 5.48098 13.3618 6.26625L15.8001 3.82791C14.2918 2.46425 12.2584 1.66667 10.0001 1.66667C5.39758 1.66667 1.66675 5.3975 1.66675 10C1.66675 14.6025 5.39758 18.3333 10.0001 18.3333C14.6026 18.3333 18.3334 14.6025 18.3334 10C18.3334 9.44125 18.2726 8.89625 18.1716 8.36791Z" fill="#FFC107"/>
                <path d="M2.62744 6.12425L5.36494 8.1485C6.10119 6.30508 7.90036 5 10.0001 5C11.2959 5 12.4784 5.48098 13.3618 6.26625L15.8001 3.82791C14.2918 2.46425 12.2584 1.66667 10.0001 1.66667C6.87911 1.66667 4.21619 3.47633 2.62744 6.12425Z" fill="#FF3D00"/>
                <path d="M10.0001 18.3333C12.2126 18.3333 14.2084 17.5646 15.7068 16.2481L13.0326 13.9888C12.1352 14.6441 11.0468 15 10.0001 15C7.83019 15 5.99769 13.6221 5.30185 11.6975L2.48352 13.8695C4.05185 16.5783 6.74269 18.3333 10.0001 18.3333Z" fill="#4CAF50"/>
                <path d="M18.1716 8.36791H17.5001V8.33333H10.0001V11.6667H14.7097C14.3809 12.6051 13.7889 13.4221 13.0309 13.9896L13.0326 13.9879L15.7068 16.2471C15.5068 16.4279 18.3334 14.1667 18.3334 10C18.3334 9.44125 18.2726 8.89625 18.1716 8.36791Z" fill="#1976D2"/>
              </svg>
              <span>Continuer avec Google</span>
            </button>

            <div className="flex items-center justify-between mt-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-gray-500 hover:text-aurentia-pink transition"
              >
                ← Retour
              </button>
              <div className="text-center text-sm">
                Déjà un compte ?{" "}
                <a href="/login" className="text-aurentia-pink hover:text-aurentia-orange transition">
                  Connectez-vous
                </a>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Modal de confirmation d'email */}
      {showEmailConfirmationModal && registeredUserId && (
        <EmailConfirmationModal
          isOpen={showEmailConfirmationModal}
          onClose={handleCloseEmailModal}
          email={email}
          userId={registeredUserId}
          onConfirmed={handleEmailConfirmed}
        />
      )}
    </div>
  );
};

export default Signup;
