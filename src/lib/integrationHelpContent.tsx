/**
 * Detailed setup instructions for integrations
 * Displayed in the help modal
 */

import { ExternalLink } from 'lucide-react';

export interface HelpStep {
  title: string;
  content: React.ReactNode;
}

export interface IntegrationHelp {
  title: string;
  description: string;
  steps: HelpStep[];
}

// Helper component for clickable links
const Link = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-primary hover:underline inline-flex items-center gap-1"
  >
    {children}
    <ExternalLink className="w-3 h-3" />
  </a>
);

export const INTEGRATION_HELP: Record<string, IntegrationHelp> = {
  slack: {
    title: 'Configuration Slack',
    description: 'Suivez ces étapes pour connecter Slack à Aurentia et recevoir des notifications dans votre workspace.',
    steps: [
      {
        title: 'Étape 1 : Accédez à l\'API Slack',
        content: (
          <div className="space-y-2">
            <p>Ouvrez le lien suivant dans un nouvel onglet :</p>
            <div className="bg-gray-50 p-3 rounded border">
              <Link href="https://api.slack.com/apps">https://api.slack.com/apps</Link>
            </div>
          </div>
        ),
      },
      {
        title: 'Étape 2 : Créez une nouvelle application',
        content: (
          <div className="space-y-2">
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Cliquez sur <strong>"Create New App"</strong></li>
              <li>Choisissez <strong>"From scratch"</strong></li>
              <li>Remplissez les informations :
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li><strong>App Name :</strong> Aurentia Notifications (ou un nom de votre choix)</li>
                  <li><strong>Pick a workspace :</strong> Sélectionnez votre workspace Slack</li>
                </ul>
              </li>
              <li>Cliquez sur <strong>"Create App"</strong></li>
            </ol>
          </div>
        ),
      },
      {
        title: 'Étape 3 : Activez les Incoming Webhooks',
        content: (
          <div className="space-y-2">
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Dans la barre latérale gauche, cliquez sur <strong>"Incoming Webhooks"</strong></li>
              <li>Activez le toggle <strong>"Activate Incoming Webhooks"</strong></li>
              <li>Faites défiler vers le bas et cliquez sur <strong>"Add New Webhook to Workspace"</strong></li>
              <li>Sélectionnez le <strong>channel</strong> où vous souhaitez recevoir les notifications (ex: #general, #aurentia-notifications)</li>
              <li>Cliquez sur <strong>"Allow"</strong></li>
            </ol>
          </div>
        ),
      },
      {
        title: 'Étape 4 : Copiez l\'URL du Webhook',
        content: (
          <div className="space-y-2">
            <p>Vous verrez une URL qui ressemble à ceci :</p>
            <div className="bg-gray-50 p-3 rounded border font-mono text-sm">
              https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
            </div>
            <p className="text-sm text-gray-600 mt-2">
              <strong>Important :</strong> Copiez cette URL complète - vous en aurez besoin pour l'étape suivante.
            </p>
          </div>
        ),
      },
      {
        title: 'Étape 5 : Configurez dans Aurentia',
        content: (
          <div className="space-y-2">
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Collez l'URL du webhook dans le champ ci-dessus</li>
              <li>Sélectionnez les événements pour lesquels vous souhaitez recevoir des notifications</li>
              <li>Cliquez sur <strong>"Enregistrer"</strong></li>
              <li>Cliquez sur <strong>"Tester la connexion"</strong> pour vérifier que tout fonctionne</li>
            </ol>
            <div className="bg-green-50 border border-green-200 p-3 rounded mt-3">
              <p className="text-green-800 text-sm font-medium">
                ✅ C'est terminé ! Vous recevrez maintenant des notifications Slack pour les événements sélectionnés.
              </p>
            </div>
          </div>
        ),
      },
    ],
  },

  discord: {
    title: 'Configuration Discord',
    description: 'Suivez ces étapes pour connecter Discord à Aurentia et recevoir des notifications dans votre serveur.',
    steps: [
      {
        title: 'Étape 1 : Accédez aux paramètres du channel',
        content: (
          <div className="space-y-2">
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Ouvrez <strong>Discord</strong></li>
              <li>Faites un <strong>clic droit</strong> sur le channel où vous souhaitez recevoir les notifications</li>
              <li>Cliquez sur <strong>"Modifier le salon"</strong> (ou "Edit Channel")</li>
            </ol>
          </div>
        ),
      },
      {
        title: 'Étape 2 : Créez un Webhook',
        content: (
          <div className="space-y-2">
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Cliquez sur l'onglet <strong>"Intégrations"</strong></li>
              <li>Cliquez sur <strong>"Webhooks"</strong> puis <strong>"Nouveau Webhook"</strong></li>
              <li>Donnez-lui un nom : <strong>"Aurentia"</strong> (ou un nom de votre choix)</li>
              <li>Cliquez sur <strong>"Copier l'URL du Webhook"</strong></li>
            </ol>
            <p className="text-sm text-gray-600 mt-2">
              L'URL ressemble à ceci :
            </p>
            <div className="bg-gray-50 p-3 rounded border font-mono text-sm">
              https://discord.com/api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN
            </div>
          </div>
        ),
      },
      {
        title: 'Étape 3 : Configurez dans Aurentia',
        content: (
          <div className="space-y-2">
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Collez l'URL du webhook dans le champ ci-dessus</li>
              <li>Sélectionnez les événements pour lesquels vous souhaitez recevoir des notifications</li>
              <li>Cliquez sur <strong>"Enregistrer"</strong></li>
              <li>Cliquez sur <strong>"Tester la connexion"</strong> pour vérifier que tout fonctionne</li>
            </ol>
            <div className="bg-green-50 border border-green-200 p-3 rounded mt-3">
              <p className="text-green-800 text-sm font-medium">
                ✅ C'est terminé ! Vous recevrez maintenant des notifications Discord pour les événements sélectionnés.
              </p>
            </div>
          </div>
        ),
      },
    ],
  },

  teams: {
    title: 'Configuration Microsoft Teams',
    description: 'Suivez ces étapes pour connecter Microsoft Teams à Aurentia et recevoir des notifications dans votre channel.',
    steps: [
      {
        title: 'Étape 1 : Accédez aux connecteurs',
        content: (
          <div className="space-y-2">
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Ouvrez <strong>Microsoft Teams</strong></li>
              <li>Naviguez vers le channel où vous souhaitez recevoir les notifications</li>
              <li>Cliquez sur les <strong>"..."</strong> (Plus d'options) à côté du nom du channel</li>
              <li>Cliquez sur <strong>"Connecteurs"</strong> (ou "Connectors")</li>
            </ol>
          </div>
        ),
      },
      {
        title: 'Étape 2 : Ajoutez un Incoming Webhook',
        content: (
          <div className="space-y-2">
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Recherchez <strong>"Incoming Webhook"</strong></li>
              <li>Cliquez sur <strong>"Configurer"</strong></li>
              <li>Donnez-lui un nom : <strong>"Aurentia"</strong></li>
              <li>(Optionnel) Téléchargez une image pour personnaliser le webhook</li>
              <li>Cliquez sur <strong>"Créer"</strong></li>
              <li>Copiez l'URL du webhook qui apparaît</li>
            </ol>
            <p className="text-sm text-gray-600 mt-2">
              L'URL commence par :
            </p>
            <div className="bg-gray-50 p-3 rounded border font-mono text-sm">
              https://outlook.office.com/webhook/...
            </div>
          </div>
        ),
      },
      {
        title: 'Étape 3 : Configurez dans Aurentia',
        content: (
          <div className="space-y-2">
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Collez l'URL du webhook dans le champ ci-dessus</li>
              <li>Sélectionnez les événements pour lesquels vous souhaitez recevoir des notifications</li>
              <li>Cliquez sur <strong>"Enregistrer"</strong></li>
              <li>Cliquez sur <strong>"Tester la connexion"</strong> pour vérifier que tout fonctionne</li>
            </ol>
            <div className="bg-green-50 border border-green-200 p-3 rounded mt-3">
              <p className="text-green-800 text-sm font-medium">
                ✅ C'est terminé ! Vous recevrez maintenant des notifications Teams pour les événements sélectionnés.
              </p>
            </div>
          </div>
        ),
      },
    ],
  },

  trello: {
    title: 'Configuration Trello',
    description: 'Suivez ces étapes pour connecter Trello à Aurentia. Trello utilise OAuth pour l\'authentification.',
    steps: [
      {
        title: 'Étape 1 : Accédez à l\'API Trello',
        content: (
          <div className="space-y-2">
            <p>Ouvrez le lien suivant pour obtenir vos clés API :</p>
            <div className="bg-gray-50 p-3 rounded border">
              <Link href="https://trello.com/app-key">https://trello.com/app-key</Link>
            </div>
          </div>
        ),
      },
      {
        title: 'Étape 2 : Récupérez votre clé API et votre secret',
        content: (
          <div className="space-y-2">
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Copiez votre <strong>API Key</strong> (affichée en haut de la page)</li>
              <li>Cliquez sur le lien <strong>"show"</strong> à côté de "Secret" pour révéler votre API Secret</li>
              <li>Copiez également l'<strong>API Secret</strong></li>
            </ol>
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded mt-3">
              <p className="text-yellow-800 text-sm font-medium">
                ⚠️ Important : Conservez ces clés en sécurité. Ne les partagez jamais publiquement.
              </p>
            </div>
          </div>
        ),
      },
      {
        title: 'Étape 3 : Configurez les variables d\'environnement (Admin uniquement)',
        content: (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Cette étape est réservée aux administrateurs de l'application Aurentia. Si vous êtes un utilisateur, contactez votre administrateur.
            </p>
            <div className="bg-gray-50 p-3 rounded border">
              <p className="font-mono text-sm">
                Les clés doivent être configurées dans Supabase en tant que secrets d'environnement.
              </p>
            </div>
          </div>
        ),
      },
      {
        title: 'Étape 4 : Connectez-vous à Trello',
        content: (
          <div className="space-y-2">
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Cliquez sur <strong>"Connecter avec Trello"</strong> dans la fenêtre de configuration</li>
              <li>Autorisez Aurentia à accéder à votre compte Trello</li>
              <li>Sélectionnez le <strong>board</strong> où vous souhaitez créer des cartes</li>
              <li>Sélectionnez les événements qui doivent créer des cartes Trello (ex: "Livrable Soumis")</li>
              <li>Cliquez sur <strong>"Enregistrer"</strong></li>
            </ol>
            <div className="bg-green-50 border border-green-200 p-3 rounded mt-3">
              <p className="text-green-800 text-sm font-medium">
                ✅ C'est terminé ! Les nouveaux livrables créeront automatiquement des cartes Trello.
              </p>
            </div>
          </div>
        ),
      },
    ],
  },
};
