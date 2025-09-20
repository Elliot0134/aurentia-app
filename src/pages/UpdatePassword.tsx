import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

const UpdatePassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setStatus('error');
      setMessage('Token de réinitialisation manquant ou invalide.');
      return;
    }
    
    setToken(tokenFromUrl);
    setStatus('ready');
  }, [searchParams]);

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?\":{}|<>]/.test(password);
    
    return {
      minLength,
      hasLetter,
      hasNumber,
      hasSpecial,
      isValid: minLength && hasLetter && hasNumber && hasSpecial
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      toast({
        title: "Mot de passe invalide",
        description: "Le mot de passe doit contenir au moins 8 caractères, des lettres, des chiffres et des caractères spéciaux.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('confirm-password-reset', {
        body: { 
          token, 
          new_password: newPassword 
        },
      });

      if (error) throw error;

      setStatus('success');
      setMessage(data.message);
      
      toast({
        title: "Succès !",
        description: "Votre mot de passe a été mis à jour.",
      });

      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error: any) {
      console.error('Error resetting password:', error);
      setStatus('error');
      setMessage(error.message || 'Une erreur est survenue lors de la réinitialisation.');
      
      toast({
        title: "Erreur",
        description: error.message || 'Impossible de réinitialiser le mot de passe.',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-16 w-16 text-aurentia-orange-aurentia animate-spin mb-4" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500 mb-4" />;
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500 mb-4" />;
      default:
        return null;
    }
  };

  const passwordValidation = validatePassword(newPassword);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <Loader2 className="h-16 w-16 text-aurentia-orange-aurentia animate-spin mb-4 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Vérification...
          </h1>
          <p className="text-gray-600">
            Validation du lien de réinitialisation
          </p>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mb-4 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Lien invalide
          </h1>
          <p className="text-gray-600 mb-4">
            {message}
          </p>
          <Button 
            onClick={() => navigate('/login')}
            className="w-full"
            variant="outline"
          >
            Retourner à la connexion
          </Button>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Mot de passe mis à jour !
          </h1>
          <p className="text-gray-600 mb-4">
            {message}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Vous serez redirigé automatiquement vers la page de connexion.
          </p>
          <Button 
            onClick={() => navigate('/login')}
            className="w-full"
          >
            Se connecter maintenant
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-2 bg-gradient-to-r from-aurentia-pink to-aurentia-orange bg-clip-text text-transparent">
            Nouveau mot de passe
          </h1>
          <p className="text-gray-600">
            Saisissez votre nouveau mot de passe
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {newPassword && (
              <div className="mt-2 space-y-1 text-xs">
                <div className={`flex items-center gap-2 ${passwordValidation.minLength ? 'text-green-600' : 'text-red-600'}`}>
                  <span>{passwordValidation.minLength ? '✓' : '✗'}</span>
                  <span>Au moins 8 caractères</span>
                </div>
                <div className={`flex items-center gap-2 ${passwordValidation.hasLetter ? 'text-green-600' : 'text-red-600'}`}>
                  <span>{passwordValidation.hasLetter ? '✓' : '✗'}</span>
                  <span>Au moins une lettre</span>
                </div>
                <div className={`flex items-center gap-2 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                  <span>{passwordValidation.hasNumber ? '✓' : '✗'}</span>
                  <span>Au moins un chiffre</span>
                </div>
                <div className={`flex items-center gap-2 ${passwordValidation.hasSpecial ? 'text-green-600' : 'text-red-600'}`}>
                  <span>{passwordValidation.hasSpecial ? '✓' : '✗'}</span>
                  <span>Au moins un caractère spécial</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {confirmPassword && (
              <div className={`mt-1 text-xs ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                {newPassword === confirmPassword ? '✓ Les mots de passe correspondent' : '✗ Les mots de passe ne correspondent pas'}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !passwordValidation.isValid || newPassword !== confirmPassword}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mise à jour...
              </>
            ) : (
              "Mettre à jour le mot de passe"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <a href="/login" className="text-aurentia-pink hover:text-aurentia-orange transition">
            Retourner à la connexion
          </a>
        </div>
      </Card>
    </div>
  );
};

export default UpdatePassword;
