import React, { useState, useEffect } from 'react'
import { collaborationManager } from '@/services/collaborationManager'

const TestCollaboration = () => {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userProjects, setUserProjects] = useState<any[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'reader' | 'editor'>('reader')
  const [collaborators, setCollaborators] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Charger l'utilisateur actuel et ses projets
  useEffect(() => {
    loadCurrentUser()
  }, [])

  const loadCurrentUser = async () => {
    try {
      const user = await collaborationManager.getCurrentUser()
      if (user) {
        setCurrentUser(user)
        const projects = await collaborationManager.getUserProjects(user.id)
        setUserProjects(projects)
        if (projects.length > 0) {
          setSelectedProjectId(projects[0].project_id)
        }
      }
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error)
    }
  }

  const loadCollaborators = async () => {
    if (!selectedProjectId) return
    
    try {
      const collabs = await collaborationManager.getProjectCollaborators(selectedProjectId)
      setCollaborators(collabs)
    } catch (error) {
      console.error('Erreur chargement collaborateurs:', error)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail || !selectedProjectId) return

    setLoading(true)
    setMessage('')

    try {
      const result = await collaborationManager.inviteByEmail(
        selectedProjectId, 
        inviteEmail, 
        inviteRole
      )

      if (result.success) {
        setMessage(`✅ Invitation envoyée à ${inviteEmail}`)
        setInviteEmail('')
        await loadCollaborators()
      } else {
        setMessage(`❌ Erreur: ${result.error}`)
      }
    } catch (error) {
      setMessage(`❌ Erreur lors de l'invitation`)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCollaborator = async (userId: string) => {
    if (!confirm('Supprimer ce collaborateur ?')) return

    try {
      await collaborationManager.removeCollaborator(selectedProjectId, userId)
      setMessage('✅ Collaborateur supprimé')
      await loadCollaborators()
    } catch (error) {
      setMessage('❌ Erreur lors de la suppression')
    }
  }

  // Charger les collaborateurs quand le projet change
  useEffect(() => {
    if (selectedProjectId) {
      loadCollaborators()
    }
  }, [selectedProjectId])

  if (!currentUser) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>🔐 Connexion requise</h2>
        <p>Veuillez vous connecter pour tester la collaboration.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>🧪 Test Collaboration - Aurentia</h1>
      
      <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <strong>👤 Utilisateur:</strong> {currentUser.email}
        <br />
        <strong>📁 Projets:</strong> {userProjects.length}
      </div>

      {userProjects.length === 0 ? (
        <p>❌ Aucun projet trouvé. Créez d'abord un projet.</p>
      ) : (
        <>
          {/* Sélection du projet */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Sélectionner un projet:
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              {userProjects.map((project) => (
                <option key={project.project_id} value={project.project_id}>
                  {project.nom_projet}
                </option>
              ))}
            </select>
          </div>

          {/* Formulaire d'invitation */}
          <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>📧 Inviter un collaborateur</h3>
            <form onSubmit={handleInvite}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'reader' | 'editor')}
                  style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="reader">Lecteur</option>
                  <option value="editor">Éditeur</option>
                </select>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ 
                    padding: '8px 16px', 
                    background: '#007bff', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Envoi...' : 'Inviter'}
                </button>
              </div>
            </form>
          </div>

          {/* Messages */}
          {message && (
            <div style={{ 
              padding: '10px', 
              borderRadius: '4px', 
              marginBottom: '20px',
              background: message.includes('✅') ? '#d4edda' : '#f8d7da',
              color: message.includes('✅') ? '#155724' : '#721c24'
            }}>
              {message}
            </div>
          )}

          {/* Liste des collaborateurs */}
          <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
            <h3>👥 Collaborateurs ({collaborators.length})</h3>
            {collaborators.length === 0 ? (
              <p>Aucun collaborateur pour ce projet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Email</th>
                    <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Rôle</th>
                    <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Statut</th>
                    <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {collaborators.map((collab) => (
                    <tr key={collab.id}>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {collab.profiles?.email || 'N/A'}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '3px',
                          background: collab.role === 'editor' ? '#ffc107' : '#28a745',
                          color: 'white',
                          fontSize: '12px'
                        }}>
                          {collab.role === 'editor' ? 'Éditeur' : 'Lecteur'}
                        </span>
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '3px',
                          background: collab.status === 'accepted' ? '#d4edda' : '#ffeaa7',
                          color: collab.status === 'accepted' ? '#155724' : '#8b4513',
                          fontSize: '12px'
                        }}>
                          {collab.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {collab.user_id !== currentUser.id && (
                          <button
                            onClick={() => handleRemoveCollaborator(collab.user_id)}
                            style={{
                              padding: '4px 8px',
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Supprimer
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default TestCollaboration
