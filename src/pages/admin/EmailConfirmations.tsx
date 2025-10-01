import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Mail, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Download,
  Trash2,
  Shield,
  TrendingUp,
  Users,
  Timer
} from 'lucide-react';
import { 
  emailConfirmationAdminService,
  EmailConfirmationMetrics,
  EmailConfirmationLog 
} from '@/services/emailConfirmationAdminService';
import { toast } from '@/components/ui/use-toast';

const EmailConfirmationsAdmin: React.FC = () => {
  const [metrics, setMetrics] = useState<EmailConfirmationMetrics | null>(null);
  const [logs, setLogs] = useState<EmailConfirmationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const [filters, setFilters] = useState({
    action: '',
    success: '',
    email: '',
    startDate: '',
    endDate: '',
  });

  // Charger les métriques
  const loadMetrics = async () => {
    try {
      const metricsData = await emailConfirmationAdminService.getConfirmationMetrics();
      setMetrics(metricsData);
    } catch (error: any) {
      console.error('Erreur chargement métriques:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les métriques.",
        variant: "destructive",
      });
    }
  };

  // Charger les logs
  const loadLogs = async (page = 1) => {
    try {
      setLoading(true);
      const result = await emailConfirmationAdminService.getAuditLogs(page, pageSize, {
        action: filters.action || undefined,
        success: filters.success ? filters.success === 'true' : undefined,
        email: filters.email || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
      
      setLogs(result.logs);
      setTotalCount(result.totalCount);
      setCurrentPage(page);
    } catch (error: any) {
      console.error('Erreur chargement logs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les logs.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Exporter les logs
  const handleExportLogs = async () => {
    try {
      const exportFilters = {
        action: filters.action || undefined,
        success: filters.success ? filters.success === 'true' : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      };
      
      const csvContent = await emailConfirmationAdminService.exportLogs(exportFilters);
      
      // Créer et télécharger le fichier
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `email_confirmations_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export réussi",
        description: "Les logs ont été exportés en CSV.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur d'export",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Nettoyage manuel
  const handleCleanup = async () => {
    if (!confirm('Êtes-vous sûr de vouloir nettoyer les tokens expirés ?')) {
      return;
    }

    try {
      const result = await emailConfirmationAdminService.cleanupExpiredTokens();
      
      toast({
        title: "Nettoyage effectué",
        description: `${result.deletedCount} tokens expirés ont été nettoyés.`,
      });
      
      // Recharger les données
      loadMetrics();
      loadLogs(currentPage);
    } catch (error: any) {
      toast({
        title: "Erreur de nettoyage",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadMetrics();
    loadLogs();
  }, []);

  const getActionBadge = (action: string, success: boolean) => {
    const getVariant = () => {
      if (!success) return 'destructive';
      
      switch (action) {
        case 'confirmed': return 'default';
        case 'sent': return 'secondary';
        case 'clicked': return 'outline';
        case 'resent': return 'secondary';
        default: return 'outline';
      }
    };

    const getColor = () => {
      switch (action) {
        case 'sent': return success ? 'bg-blue-100 text-blue-800' : '';
        case 'clicked': return 'bg-yellow-100 text-yellow-800';
        case 'confirmed': return 'bg-green-100 text-green-800';
        case 'resent': return 'bg-purple-100 text-purple-800';
        case 'expired': return 'bg-orange-100 text-orange-800';
        case 'cancelled': return 'bg-gray-100 text-gray-800';
        default: return '';
      }
    };

    return (
      <Badge 
        variant={getVariant()}
        className={getColor()}
      >
        {action}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const formatResponseTime = (ms: number | null) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Confirmations d'Email</h1>
          <p className="text-gray-600">Monitoring et gestion des confirmations d'email</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleExportLogs} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
          <Button onClick={handleCleanup} variant="outline">
            <Trash2 className="h-4 w-4 mr-2" />
            Nettoyer
          </Button>
          <Button onClick={() => { loadMetrics(); loadLogs(currentPage); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Métriques */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{metrics.totalSent}</p>
                  <p className="text-sm text-gray-600">Emails envoyés</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{metrics.totalConfirmed}</p>
                  <p className="text-sm text-gray-600">Confirmés</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{metrics.confirmationRate.toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">Taux de confirmation</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{metrics.averageConfirmationTime.toFixed(0)}m</p>
                  <p className="text-sm text-gray-600">Temps moyen</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Logs d'Audit</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          {/* Filtres */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="action-filter">Action</Label>
                  <Select value={filters.action} onValueChange={(value) => setFilters(prev => ({ ...prev, action: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toutes</SelectItem>
                      <SelectItem value="sent">Envoyé</SelectItem>
                      <SelectItem value="clicked">Cliqué</SelectItem>
                      <SelectItem value="confirmed">Confirmé</SelectItem>
                      <SelectItem value="failed">Échoué</SelectItem>
                      <SelectItem value="resent">Renvoyé</SelectItem>
                      <SelectItem value="expired">Expiré</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="success-filter">Statut</Label>
                  <Select value={filters.success} onValueChange={(value) => setFilters(prev => ({ ...prev, success: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tous</SelectItem>
                      <SelectItem value="true">Succès</SelectItem>
                      <SelectItem value="false">Échec</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="email-filter">Email</Label>
                  <Input
                    id="email-filter"
                    placeholder="Rechercher par email"
                    value={filters.email}
                    onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="start-date">Date début</Label>
                  <Input
                    id="start-date"
                    type="datetime-local"
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="end-date">Date fin</Label>
                  <Input
                    id="end-date"
                    type="datetime-local"
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={() => loadLogs(1)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Appliquer filtres
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFilters({ action: '', success: '', email: '', startDate: '', endDate: '' });
                    loadLogs(1);
                  }}
                >
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Table des logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Logs d'Audit ({totalCount} entrées)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Chargement...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead>Temps</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm">
                            {formatDate(log.created_at)}
                          </TableCell>
                          <TableCell>
                            {getActionBadge(log.action, log.success)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {log.metadata?.email || 'N/A'}
                          </TableCell>
                          <TableCell className="text-sm font-mono">
                            {log.ip_address ? log.ip_address.substring(0, 12) + '...' : 'N/A'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatResponseTime(log.response_time_ms)}
                          </TableCell>
                          <TableCell>
                            {log.success ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalCount > pageSize && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Page {currentPage} sur {Math.ceil(totalCount / pageSize)}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => loadLogs(currentPage - 1)}
                          disabled={currentPage <= 1}
                          variant="outline"
                          size="sm"
                        >
                          Précédent
                        </Button>
                        <Button
                          onClick={() => loadLogs(currentPage + 1)}
                          disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                          variant="outline"
                          size="sm"
                        >
                          Suivant
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Détaillées</CardTitle>
            </CardHeader>
            <CardContent>
              {metrics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Activité Récente</h4>
                    <div className="space-y-1 text-sm">
                      <p>24h : <span className="font-medium">{metrics.recentActivity.last24h}</span></p>
                      <p>7j : <span className="font-medium">{metrics.recentActivity.last7days}</span></p>
                      <p>30j : <span className="font-medium">{metrics.recentActivity.last30days}</span></p>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">Performance</h4>
                    <div className="space-y-1 text-sm">
                      <p>Taux : <span className="font-medium">{metrics.confirmationRate.toFixed(1)}%</span></p>
                      <p>Temps moy : <span className="font-medium">{metrics.averageConfirmationTime.toFixed(0)}min</span></p>
                      <p>Échecs : <span className="font-medium">{metrics.totalFailed}</span></p>
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4">
                    <h4 className="font-medium text-orange-900 mb-2">Statuts</h4>
                    <div className="space-y-1 text-sm">
                      <p>Confirmés : <span className="font-medium text-green-600">{metrics.totalConfirmed}</span></p>
                      <p>Expirés : <span className="font-medium text-orange-600">{metrics.totalExpired}</span></p>
                      <p>Échecs : <span className="font-medium text-red-600">{metrics.totalFailed}</span></p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Sécurité et Rate Limiting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Les fonctionnalités de sécurité avancées sont en cours de développement.
                  Actuellement actif : Rate limiting automatique par IP, email et utilisateur.
                </AlertDescription>
              </Alert>
              
              <div className="mt-4 space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">Limites Actuelles</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Par email : 10 tentatives / heure</li>
                    <li>• Par IP : 15 tentatives / heure</li>
                    <li>• Par utilisateur : 5 tentatives / heure</li>
                    <li>• Expiration des tokens : 24 heures</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailConfirmationsAdmin;