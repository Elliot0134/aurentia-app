import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShareCodeService } from '@/services/shareCode.service';
import { ProjectShareCode } from '@/types/collaboration';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
  Clock,
  Shield,
  Link2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const JoinProject: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code');

  const [shareCode, setShareCode] = useState<ProjectShareCode | null>(null);
  const [validating, setValidating] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndValidateCode();
  }, [code]);

  const checkAuthAndValidateCode = async () => {
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    setUserId(session?.user?.id || null);

    if (!code) {
      setError('Code d\'invitation manquant');
      setValidating(false);
      return;
    }

    // Validate code
    setValidating(true);
    try {
      const result = await ShareCodeService.validateShareCode(code);
      if (result.valid && result.shareCode) {
        setShareCode(result.shareCode);
        setError(null);
      } else {
        setError(result.error || 'Code invalide');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la validation du code');
    } finally {
      setValidating(false);
    }
  };

  const handleJoinProject = async () => {
    if (!userId || !code) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour rejoindre un projet',
        variant: 'destructive'
      });
      return;
    }

    setJoining(true);
    try {
      const result = await ShareCodeService.useShareCode(code, userId);
      if (result.success && result.projectId) {
        toast({
          title: 'Projet rejoint !',
          description: 'Vous avez rejoint le projet avec succès',
        });
        // Redirect to project
        navigate(`/individual/project-business/${result.projectId}`);
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Impossible de rejoindre le projet',
          variant: 'destructive'
        });
      }
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setJoining(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'viewer': 'Lecteur',
      'editor': 'Éditeur',
      'admin': 'Administrateur'
    };
    return labels[role] || role;
  };

  const getRoleDescription = (role: string) => {
    const descriptions: Record<string, string> = {
      'viewer': 'Vous pourrez consulter les projets et livrables en lecture seule',
      'editor': 'Vous pourrez modifier les projets et créer des livrables',
      'admin': 'Vous aurez accès complet pour gérer le projet et inviter d\'autres membres'
    };
    return descriptions[role] || '';
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 size={48} className="mx-auto animate-spin text-blue-600" />
              <p className="text-gray-600">Validation du code d'invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !shareCode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle size={24} />
              Code invalide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error || 'Ce code d\'invitation n\'est pas valide ou a expiré.'}
              </AlertDescription>
            </Alert>

            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Raisons possibles :</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Le code a expiré</li>
                <li>Le nombre maximum d'utilisations a été atteint</li>
                <li>Le code a été désactivé par le propriétaire du projet</li>
                <li>Le code est incorrect</li>
              </ul>
            </div>

            <Button
              onClick={() => navigate('/individual/dashboard')}
              variant="outline"
              className="w-full"
            >
              Retour au tableau de bord
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 size={24} className="text-blue-600" />
              Invitation à rejoindre un projet
            </CardTitle>
            <CardDescription>
              Vous avez été invité à collaborer sur un projet Aurentia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700">
                Vous devez être connecté pour rejoindre le projet
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button
                onClick={() => navigate(`/login?redirect=/join-project?code=${code}`)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Se connecter
              </Button>
              <Button
                onClick={() => navigate(`/signup?redirect=/join-project?code=${code}`)}
                variant="outline"
                className="w-full"
              >
                Créer un compte
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={24} className="text-blue-600" />
            Invitation à rejoindre un projet
          </CardTitle>
          <CardDescription>
            {shareCode.project?.nom_projet || 'Un projet'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Success info */}
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Code d'invitation valide !
            </AlertDescription>
          </Alert>

          {/* Project and role info */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Shield size={20} className="text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Rôle attribué</p>
                <p className="text-gray-700 font-semibold">
                  {getRoleLabel(shareCode.role)}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {getRoleDescription(shareCode.role)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Users size={20} className="text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Utilisations du code</p>
                <p className="text-gray-700">
                  {shareCode.current_uses} / {shareCode.max_uses} utilisations
                </p>
              </div>
            </div>

            {shareCode.expires_at && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock size={20} className="text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Expiration</p>
                  <p className="text-gray-700">
                    {new Date(shareCode.expires_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-2">
            <Button
              onClick={handleJoinProject}
              disabled={joining}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {joining ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Rejoindre en cours...
                </>
              ) : (
                'Rejoindre le projet'
              )}
            </Button>
            <Button
              onClick={() => navigate('/individual/dashboard')}
              variant="outline"
              className="w-full"
              disabled={joining}
            >
              Annuler
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinProject;
