import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { collaborationManager } from '@/services/collaborationManager'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2, LogIn } from 'lucide-react'

const InvitationPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'login-required'>('loading')
  const [message, setMessage] = useState('')
  const [projectName, setProjectName] = useState('')
  const [inviterEmail, setInviterEmail] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('Token d\'invitation manquant')
      return
    }

    handleInvitation(token)
  }, [searchParams])

  const handleInvitation = async (token: string) => {
    try {
      // Vérifier si l'utilisateur est connecté
      const user = await collaborationManager.getCurrentUser()
      
      if (!user) {
        setStatus('login-required')
        setMessage('Vous devez vous connecter pour accepter cette invitation')
        return
      }

      // Récupérer les détails de l'invitation
      const { data: invitation, error: invitationError } = await supabase
        .from('project_invitations')
        .select(`
          *,
          project_summary:project_id (
            nom_projet,
            description_synthetique
          ),
          inviter:invited_by (
            email
          )
        `)
        .eq('token', token)
        .eq('email', user.email)
        .eq('used', false)
        .single()

      if (invitationError || !invitation) {
        setStatus('error')
        setMessage('Invitation invalide, expirée ou déjà utilisée')
        return
      }

      setProjectName(invitation.project_summary?.nom_projet || 'Projet')
      setInviterEmail(invitation.inviter?.email || 'Un collaborateur')

      // Vérifier si l'utilisateur n'est pas déjà collaborateur
      const { data: existingCollab } = await supabase
        .from('project_collaborators')
        .select('id')
        .eq('project_id', invitation.project_id)
        .eq('user_id', user.id)
        .single()

      if (existingCollab) {
        setStatus('error')
        setMessage('Vous êtes déjà collaborateur de ce projet')
        return
      }

      // Accepter automatiquement l'invitation
      // Convertir le rôle de la base (anglais) vers français pour l'affichage
      const displayRole = invitation.role === 'editor' ? 'Éditeur' : 'Lecteur';
      
      const { error: insertError } = await supabase
        .from('project_collaborators')
        .insert({
          project_id: invitation.project_id,
          user_id: user.id,
          role: invitation.role, // Garder le rôle en anglais dans la base
          invited_by: invitation.invited_by,
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Erreur insertion collaborateur:', insertError)
        throw insertError
      }

      // Marquer l'invitation comme utilisée
      await supabase
        .from('project_invitations')
        .update({ used: true })
        .eq('id', invitation.id)

      setStatus('success')
      setMessage(`Félicitations ! Vous êtes maintenant collaborateur du projet "${invitation.project_summary?.nom_projet}" avec le rôle ${displayRole}`)

      // Rediriger vers le dashboard après 3 secondes
      setTimeout(() => {
        navigate('/dashboard')
      }, 3000)

    } catch (error) {
      console.error('Erreur lors de l\'acceptation:', error)
      setStatus('error')
      setMessage('Erreur lors de l\'acceptation de l\'invitation')
    }
  }

  const goToLogin = () => {
    // Sauvegarder le token pour après la connexion
    localStorage.setItem('pending_invitation_token', searchParams.get('token') || '')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">A</span>
          </div>
          <CardTitle className="text-2xl">Invitation Aurentia</CardTitle>
          <CardDescription>
            {projectName && `Rejoindre le projet "${projectName}"`}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <div className="space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
              <p className="text-gray-600">Traitement de votre invitation...</p>
            </div>
          )}

          {status === 'login-required' && (
            <div className="space-y-4">
              <LogIn className="w-12 h-12 mx-auto text-blue-500" />
              <div>
                <p className="text-gray-700 mb-2">{message}</p>
                {projectName && (
                  <p className="text-sm text-gray-500 mb-4">
                    Vous avez été invité par {inviterEmail} à rejoindre le projet "{projectName}"
                  </p>
                )}
              </div>
              <Button onClick={goToLogin} className="w-full">
                Se connecter
              </Button>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
              <div>
                <p className="text-green-700 font-medium mb-2">Invitation acceptée !</p>
                <p className="text-sm text-gray-600">{message}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-700">
                  🚀 Redirection vers le dashboard dans quelques secondes...
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <XCircle className="w-12 h-12 mx-auto text-red-500" />
              <div>
                <p className="text-red-700 font-medium mb-2">Erreur</p>
                <p className="text-sm text-gray-600">{message}</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                className="w-full"
              >
                Retour au dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default InvitationPage