import React, { useState } from 'react';
import { CollaboratorsService } from '../services/collaborators.service';
import { EmailService } from '../services/email.service';

export const CollaborationTester: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testInvitationFlow = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      addTestResult('🧪 Début du test de collaboration...');

      // Test 1: Invitation d'un collaborateur
      addTestResult('📧 Test d\'invitation...');
      const inviteResult = await CollaboratorsService.inviteCollaborator(
        '01939e8c-0416-7fd0-a56f-a6c6a5e9ee05', // Project ID d'exemple
        'test-collaboration@example.com',
        'editor'
      );

      if (inviteResult.success) {
        addTestResult(`✅ Invitation créée avec succès! Token: ${inviteResult.token?.substring(0, 8)}...`);
        
        // Test 2: Test du service email
        addTestResult('📮 Test du service email...');
        const emailResult = await EmailService.sendCollaborationInvitation(
          'test-collaboration@example.com',
          inviteResult.token!,
          '01939e8c-0416-7fd0-a56f-a6c6a5e9ee05',
          'testeur@example.com'
        );

        if (emailResult.success) {
          addTestResult('✅ Email d\'invitation envoyé avec succès!');
        } else {
          addTestResult(`❌ Erreur email: ${emailResult.error}`);
        }

        // Test 3: Récupération des collaborateurs
        addTestResult('👥 Test de récupération des collaborateurs...');
        const collaborators = await CollaboratorsService.getUserCollaborators();
        addTestResult(`📊 ${collaborators.length} collaborateur(s) trouvé(s)`);

        // Test 4: Simulation d'acceptation (nous ne pouvons pas vraiment tester sans un autre utilisateur)
        addTestResult('⏳ Pour tester l\'acceptation, utilisez le token dans l\'URL: /accept-invitation?token=' + inviteResult.token);

      } else {
        addTestResult(`❌ Erreur d'invitation: ${inviteResult.error}`);
      }

    } catch (error: any) {
      addTestResult(`💥 Erreur critique: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testEmailService = async () => {
    setIsLoading(true);
    try {
      addTestResult('📧 Test isolé du service email...');
      
      const result = await EmailService.sendCollaborationInvitation(
        'recipient@example.com',
        'test-token-123',
        'test-project-id',
        'sender@example.com'
      );
      
      if (result.success) {
        addTestResult('✅ Service email fonctionne!');
      } else {
        addTestResult(`❌ Service email: ${result.error}`);
      }
    } catch (error: any) {
      addTestResult(`💥 Erreur service email: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🧪 Testeur de Collaboration</h2>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={testInvitationFlow}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? '⏳ Test en cours...' : '🚀 Tester le flux complet'}
        </button>
        
        <button
          onClick={testEmailService}
          disabled={isLoading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          📧 Tester uniquement l'email
        </button>
        
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          🗑️ Effacer
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg min-h-96">
        <h3 className="font-bold mb-2">📋 Résultats des tests:</h3>
        {testResults.length === 0 ? (
          <p className="text-gray-500">Aucun test lancé. Cliquez sur un bouton pour commencer.</p>
        ) : (
          <div className="space-y-1">
            {testResults.map((result, index) => (
              <div key={index} className="font-mono text-sm">
                {result}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-bold mb-2">ℹ️ Informations de test:</h3>
        <ul className="text-sm space-y-1">
          <li>• Ce testeur utilise les vrais services de collaboration</li>
          <li>• Les emails sont envoyés via le service MCP Resend</li>
          <li>• Les données sont stockées dans la vraie base Supabase</li>
          <li>• Vous devez être connecté pour que les tests fonctionnent</li>
        </ul>
      </div>
    </div>
  );
};