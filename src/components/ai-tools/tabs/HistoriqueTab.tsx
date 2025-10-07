import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, CheckCircle, XCircle, Loader, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { AITool, AIToolUsageHistory } from '@/types/aiTools';

interface HistoriqueTabProps {
  tool: AITool;
  history: AIToolUsageHistory[];
}

export const HistoriqueTab: React.FC<HistoriqueTabProps> = ({ tool, history }) => {
  const [selectedEntry, setSelectedEntry] = useState<AIToolUsageHistory | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'processing':
        return <Loader className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      processing: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };

    const labels = {
      completed: 'Terminé',
      failed: 'Échoué',
      processing: 'En cours',
      pending: 'En attente',
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
    } catch {
      return dateString;
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getInputPreview = (inputData: Record<string, any>) => {
    const entries = Object.entries(inputData);
    if (entries.length === 0) return 'Aucune donnée d\'entrée';
    
    const preview = entries
      .slice(0, 2)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join(', ');
    
    return truncateText(preview, 80);
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aucun historique
        </h3>
        <p className="text-gray-600 max-w-sm mx-auto">
          Vous n'avez pas encore utilisé cet outil. Rendez-vous dans l'onglet "Utilisation" pour commencer.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Historique d'utilisation ({history.length})
        </h3>
      </div>

      <div className="space-y-4">
        {history.map((entry) => (
          <Card key={entry.id} className="border border-gray-200 hover:border-orange-200 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* En-tête */}
                  <div className="flex items-center gap-3">
                    {getStatusIcon(entry.status)}
                    {getStatusBadge(entry.status)}
                    <span className="text-sm text-gray-600">
                      {formatDate(entry.created_at)}
                    </span>
                  </div>

                  {/* Aperçu des données d'entrée */}
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Données d'entrée :
                    </p>
                    <p className="text-sm text-gray-600">
                      {getInputPreview(entry.input_data)}
                    </p>
                  </div>

                  {/* Métadonnées */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {entry.credits_used && (
                      <span>💡 {entry.credits_used} crédits utilisés</span>
                    )}
                    {entry.execution_time_ms && (
                      <span>⏱️ {entry.execution_time_ms}ms</span>
                    )}
                    {entry.completed_at && (
                      <span>✅ Terminé le {formatDate(entry.completed_at)}</span>
                    )}
                  </div>

                  {/* Message d'erreur */}
                  {entry.error_message && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800">
                        <strong>Erreur :</strong> {entry.error_message}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bouton voir le résultat */}
                {entry.status === 'completed' && entry.output_data && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedEntry(entry)}
                    className="ml-4 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Voir le résultat
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal pour afficher le résultat détaillé */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              Résultat de l'exécution - {selectedEntry && formatDate(selectedEntry.created_at)}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEntry && (
            <div className="space-y-6">
              {/* Données d'entrée */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Données d'entrée</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(selectedEntry.input_data, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Résultat */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Résultat</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(selectedEntry.output_data, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Métadonnées */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <span className="text-sm font-medium text-gray-500">Statut :</span>
                  <div className="mt-1">{getStatusBadge(selectedEntry.status)}</div>
                </div>
                {selectedEntry.credits_used && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Crédits utilisés :</span>
                    <p className="text-sm text-gray-900 mt-1">{selectedEntry.credits_used}</p>
                  </div>
                )}
                {selectedEntry.execution_time_ms && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Temps d'exécution :</span>
                    <p className="text-sm text-gray-900 mt-1">{selectedEntry.execution_time_ms}ms</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};