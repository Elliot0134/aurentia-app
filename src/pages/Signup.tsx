import { FormEvent, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { validateInvitationCode, useInvitationCode } from "@/services/invitationService";
import { InvitationValidationResult } from "@/types/userTypes";
import { emailConfirmationService } from "@/services/emailConfirmationService";
import { EmailConfirmationModal } from "@/components/auth/EmailConfirmationModal";
import { useUserRole } from "@/hooks/useUserRole";
import OrganisationFlowWrapper from "@/components/organisation/OrganisationFlowWrapper";
import { AddressAutocompleteInput } from "@/components/ui/address-autocomplete-input";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 0: sélection rôle, 1: code invitation, 2: inscription
  const [invitationCode, setInvitationCode] = useState("");
  const [codeValidation, setCodeValidation] = useState<InvitationValidationResult | null>(null);
  const [selectedRole, setSelectedRole] = useState<'individual' | 'organisation' | null>(null);
  const [showEmailConfirmationModal, setShowEmailConfirmationModal] = useState(false);
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null);
  const [showOrganisationSetup, setShowOrganisationSetup] = useState(false);
  const navigate = useNavigate();
  const { getDefaultDashboard, userProfile, loading: userProfileLoading } = useUserRole();
  
  // Ref to prevent auth state listener from interfering with signup flow
  const isSigningUp = useRef(false);

  useEffect(() => {
    const checkUserAndRole = async () => {
      // Don't interfere if we're in the signup flow or showing the email confirmation modal
      if (isSigningUp.current || showEmailConfirmationModal) {
        console.log('[SIGNUP] Skipping auth check - signup in progress or modal showing');
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session && !userProfileLoading && !userProfile?.user_role) {
        // Si l'utilisateur est connecté via SSO et n'a pas de rôle, passer à l'étape de sélection de rôle
        setStep(1);
      }
    };
    checkUserAndRole();
  }, [userProfile, userProfileLoading, showEmailConfirmationModal]); // Dépendances pour re-vérifier quand le profil est chargé

  const handleCodeValidation = async () => {
    if (!invitationCode.trim()) {
      setCodeValidation(null);
      return;
    }

    setLoading(true);
    try {
      // Extract code from URL if it's a full URL
      let codeToValidate = invitationCode.trim();
      
      // Check if it's a URL and extract the code parameter
      if (codeToValidate.includes('?code=')) {
        const url = new URL(codeToValidate);
        codeToValidate = url.searchParams.get('code') || codeToValidate;
      } else if (codeToValidate.includes('/join/')) {
        // Handle URLs like /join/INV-123
        const parts = codeToValidate.split('/join/');
        if (parts.length > 1) {
          codeToValidate = parts[1].split('?')[0]; // Remove query params if any
        }
      }

      const validation = await validateInvitationCode(codeToValidate);
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
    
    console.log("🚀 [SIGNUP] Form submitted - starting signup process");
    
    setLoading(true);
    isSigningUp.current = true; // Mark that we're signing up

    if (password !== confirmPassword) {
      console.log("❌ [SIGNUP] Password mismatch");
      toast({
        title: "Erreur d'inscription",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      setLoading(false);
      isSigningUp.current = false;
      return;
    }

    console.log("✅ [SIGNUP] Starting user registration process...");
    try {

      console.log("📧 [SIGNUP] Calling supabase.auth.signUp with timeout protection...");
      
      // Add timeout protection to prevent hanging
      const signUpPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone_number: phoneNumber,
            location: location,
          },
          // Bypass Supabase's built-in email confirmation - we use our own system
          emailRedirectTo: `${window.location.origin}/auth/callback?skip=true`,
        },
      });
      
      // Create timeout promise (30 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Signup timeout - please check your internet connection')), 30000);
      });
      
      console.log("⏳ [SIGNUP] Waiting for signUp response...");
      
      let signUpResult;
      try {
        signUpResult = await Promise.race([signUpPromise, timeoutPromise]) as any;
      } catch (timeoutError: any) {
        console.warn("⚠️ [SIGNUP] SignUp timed out, but user might still be created. Checking...");
        
        // Even if signup timed out, the user might have been created
        // Try to sign in to check
        const { data: signInData } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInData.user) {
          console.log("✅ [SIGNUP] User was created despite timeout!");
          signUpResult = { data: signInData, error: null };
        } else {
          throw timeoutError;
        }
      }
      
      const { error, data } = signUpResult;
      console.log("📬 [SIGNUP] signUp response received");

      if (error) {
        console.error("❌ [SIGNUP] Error from supabase.auth.signUp:", error);
        
        // Check if user already exists
        if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
          toast({
            title: "Compte existant",
            description: "Un compte avec cet email existe déjà. Veuillez vous connecter.",
            variant: "destructive",
          });
          setLoading(false);
          isSigningUp.current = false;
          return;
        }
        
        throw error;
      }
      console.log("✅ [SIGNUP] supabase.auth.signUp successful. User ID:", data.user?.id);

      const user = data.user;

      if (user) {
        console.log("handleSubmit: Utilisateur créé. ID:", user.id);
        
        // Sync user metadata to profile using the database function
        // This ensures first_name, last_name, phone, and role are saved to profiles table
        // Determine the initial user role based on invitation code or selected role
        const initialUserRole = (invitationCode && codeValidation?.valid) 
          ? codeValidation.role 
          : (selectedRole || 'individual');
        
        try {
          const { error: syncError } = await (supabase as any).rpc('sync_user_metadata_to_profile', {
            p_user_id: user.id,
            p_email: email,
            p_first_name: firstName,
            p_last_name: lastName,
            p_phone: phoneNumber,
            p_location: location,
            p_user_role: initialUserRole  // Pass the selected role
          });

          if (syncError) {
            console.error("handleSubmit: Erreur lors de la synchronisation du profil:", syncError);
            // Fallback: try direct upsert with correct role
            const { error: profileError } = await supabase
              .from('profiles' as any)
              .upsert({
                id: user.id,
                email: email,
                first_name: firstName,
                last_name: lastName,
                phone: phoneNumber,
                location: location,
                user_role: initialUserRole,  // Use the correct role, not hardcoded 'individual'
                email_confirmation_required: true,
              }, {
                onConflict: 'id',
                ignoreDuplicates: false
              });

            if (profileError) {
              console.error("handleSubmit: Erreur fallback lors de la création du profil:", profileError);
            }
          } else {
            console.log("handleSubmit: Profil synchronisé avec succès via RPC avec le rôle:", initialUserRole);
          }
        } catch (syncException) {
          console.error("handleSubmit: Exception lors de la synchronisation:", syncException);
        }
        
        // Étape 2: Handle invitation code or organization setup flag
        let userRole: string | null = initialUserRole;
        
        if (invitationCode && codeValidation?.valid) {
          console.log("handleSubmit: Gestion du code d'invitation...");
          // Cas avec code d'invitation
          try {
            // Extraire le code de l'URL si nécessaire
            const extractCodeFromUrl = (input: string): string => {
              // Si c'est déjà un code simple (pas d'URL), retourner tel quel
              if (!input.includes('?') && !input.includes('/join/')) {
                return input;
              }
              
              try {
                // Essayer d'extraire depuis les paramètres de requête
                const url = new URL(input);
                const codeFromQuery = url.searchParams.get('code');
                if (codeFromQuery) {
                  return codeFromQuery;
                }
                
                // Essayer d'extraire depuis le chemin /join/{code}
                const pathMatch = url.pathname.match(/\/join\/([^\/]+)/);
                if (pathMatch) {
                  return pathMatch[1];
                }
              } catch (error) {
                // Si ce n'est pas une URL valide, retourner l'input tel quel
                return input;
              }
              
              return input;
            };
            
            const codeToUse = extractCodeFromUrl(invitationCode);
            await useInvitationCode(codeToUse, user.id);
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
        } else if (selectedRole === 'organisation') {
          // For organization role WITHOUT invitation code, set the setup pending flag
          console.log("handleSubmit: Organisation role selected - setting organization_setup_pending flag...");
          try {
            const { error: updateError } = await supabase
              .from('profiles' as any)
              .update({ 
                organization_setup_pending: true  // Flag to redirect to setup after email confirmation
              })
              .eq('id', user.id);

            if (updateError) {
              console.warn("handleSubmit: Erreur lors de la définition du flag organization_setup_pending:", updateError);
            } else {
              console.log("handleSubmit: Flag organization_setup_pending défini avec succès");
            }
            
            toast({
              title: "Inscription réussie",
              description: "Veuillez confirmer votre email, puis vous pourrez configurer votre organisation.",
            });
          } catch (roleError: any) {
            console.warn("handleSubmit: Erreur lors de la définition du flag:", roleError);
            // Ne pas faire échouer l'inscription pour ça
          }
        } else if (selectedRole === 'individual') {
          // For individual role, just show success message
          toast({
            title: "Inscription réussie",
            description: "Bienvenue ! Vous êtes maintenant configuré en tant qu'entrepreneur.",
          });
        }
        
        // Étape 3: Envoyer l'email de confirmation (AVANT de déconnecter pour que la requête soit authentifiée)
        console.log("📧 [SIGNUP] Sending confirmation email to:", email);
        let emailSent = false;
        try {
          const confirmationResult = await emailConfirmationService.sendConfirmationEmail({
            email,
            userId: user.id,
            isResend: false
          });
          console.log("📬 [SIGNUP] Email confirmation result:", confirmationResult);
          emailSent = confirmationResult.success;

          if (confirmationResult.success) {
            console.log("✅ [SIGNUP] Confirmation email sent successfully");
            toast({
              title: "Email de confirmation envoyé !",
              description: "Vérifiez votre boîte de réception pour activer votre compte.",
            });
          } else {
            console.log("❌ [SIGNUP] Email de confirmation non envoyé (success: false).");
            
            // Handle rate limiting specifically
            if (confirmationResult.error?.includes("Trop de tentatives") || confirmationResult.retryAfter) {
              const waitTime = Math.ceil((confirmationResult.retryAfter || 3600) / 60);
              toast({
                title: "Limite de tentatives atteinte",
                description: `Trop de tentatives d'envoi d'email. Veuillez patienter ${waitTime} minute${waitTime > 1 ? 's' : ''} avant de réessayer.`,
                variant: "destructive",
              });
            } else {
              toast({
                title: "Inscription réussie",
                description: confirmationResult.error || "Erreur d'envoi de l'email de confirmation. Veuillez vérifier votre boîte de réception ou demander un nouveau lien.",
                variant: "destructive",
              });
            }
          }
        } catch (emailError: any) {
          console.error("❌ [SIGNUP] Erreur lors de l'envoi de l'email de confirmation:", emailError);
          
          toast({
            title: "Inscription réussie",
            description: emailError.message || "Erreur d'envoi de l'email. Veuillez vérifier votre boîte de réception ou demander un nouveau lien.",
            variant: "destructive",
          });
        }
        
        // Étape 4: Afficher le modal de confirmation d'email
        // Note: On ne déconnecte PAS l'utilisateur car:
        // - Le modal a besoin de la session pour les subscriptions realtime
        // - Le ProtectedRoute bloque déjà l'accès via email_confirmation_required
        // - Les RLS policies protègent les données sensibles
        console.log("🎭 [SIGNUP] Opening email confirmation modal for user:", user.id);
        setRegisteredUserId(user.id);
        setShowEmailConfirmationModal(true);
        console.log("✅ [SIGNUP] Modal state updated - should be visible now");
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
      console.error("❌ [SIGNUP] Global signup error:", error);
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur s'est produite lors de l'inscription",
        variant: "destructive",
      });
    } finally {
      console.log("🏁 [SIGNUP] Signup process completed. Resetting loading state.");
      setLoading(false);
      isSigningUp.current = false; // Clear signup flag
    }
  };

  // Handler pour la confirmation d'email réussie
  const handleEmailConfirmed = () => {
    setShowEmailConfirmationModal(false);
    
    toast({
      title: "Email confirmé !",
      description: "Votre compte est maintenant actif.",
    });
    
    // Si l'utilisateur a choisi "organisation", afficher le formulaire de configuration
    if (selectedRole === 'organisation') {
      setShowOrganisationSetup(true);
    } else {
      // Pour les autres rôles, rediriger directement
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
    }
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

  // Handler pour le succès de la création d'organisation
  const handleOrganisationSetupSuccess = () => {
    setShowOrganisationSetup(false);
  };

  // Handler pour revenir en arrière depuis le formulaire d'organisation
  const handleOrganisationSetupBack = () => {
    setShowOrganisationSetup(false);
    // Rester sur la page de signup, permettre à l'utilisateur de choisir une autre option
    toast({
      title: "Configuration annulée",
      description: "Vous pouvez choisir de configurer votre organisation plus tard depuis votre profil.",
    });
    
    // Rediriger vers le dashboard individual en attendant
    navigate("/individual/dashboard");
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: `${window.location.origin}/auth/callback`, // Rediriger vers la page de callback
        },
      });
      
      if (error) throw error;
      
      // La redirection sera gérée par la page de callback
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
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Modal de confirmation d'email - Rendu en premier pour être visible même si d'autres états changent */}
      {showEmailConfirmationModal && registeredUserId && (
        <EmailConfirmationModal
          isOpen={showEmailConfirmationModal}
          onClose={handleCloseEmailModal}
          email={email}
          userId={registeredUserId}
          onConfirmed={handleEmailConfirmed}
        />
      )}

      {/* Étape de configuration d'organisation */}
      {showOrganisationSetup && registeredUserId && (
        <OrganisationFlowWrapper
          userId={registeredUserId}
          userEmail={email}
          userName={`${firstName} ${lastName}`.trim() || email}
          onComplete={handleOrganisationSetupSuccess}
          onBack={handleOrganisationSetupBack}
        />
      )}

      {!showOrganisationSetup && step === 0 && (
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
                selectedRole === 'organisation'
                ? 'border-aurentia-orange bg-aurentia-orange/5'
                : 'border-gray-200 hover:border-aurentia-orange hover:bg-aurentia-orange/5'
              }`}
              onClick={() => setSelectedRole('organisation')}
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

          <div className="pt-6">
            <button
              type="button"
              className="w-full px-6 py-3 bg-aurentia-pink text-white rounded-lg hover:bg-aurentia-pink/90 transition disabled:opacity-50 flex items-center justify-center gap-2 group"
              onClick={() => setStep(1)}
              disabled={!selectedRole}
            >
              Continuer
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      )}

      {!showOrganisationSetup && step === 1 && (
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-sm animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold mb-2 bg-gradient-to-r from-aurentia-pink to-aurentia-orange bg-clip-text text-transparent">
              Code d'invitation
            </h1>
            <p className="text-gray-600">
              Avez-vous un code d'invitation pour rejoindre une organisation ?
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
                  placeholder="INV-ABC123 ou https://..."
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
                  {codeValidation.role === 'organisation' && 'en tant qu\'administrateur d\'organisation'}
                  {codeValidation.role === 'staff' && 'en tant que membre du staff'}
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

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="text-sm text-gray-500 hover:text-aurentia-pink transition"
            >
              ← Retour
            </button>
            
            <button
              type="button"
              className="px-6 py-3 bg-aurentia-pink text-white rounded-lg hover:bg-aurentia-pink/90 transition flex items-center gap-2 group"
              onClick={() => setStep(2)}
            >
              Continuer l'inscription
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      )}

      {!showOrganisationSetup && step === 2 && (
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
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Ville / Région
              </label>
              <AddressAutocompleteInput
                id="location"
                value={location}
                onChange={(value) => setLocation(value)}
                placeholder="Commencer à taper une ville ou région..."
                disabled={loading}
                addressType="regions"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nous utilisons votre localisation pour vous proposer des organisations proches de vous
              </p>
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
    </div>
  );
};

export default Signup;
