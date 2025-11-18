import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useOrgPageTitle } from '@/hooks/usePageTitle';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CustomTabs from "@/components/ui/CustomTabs";
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  AlertCircle,
  RefreshCw,
  Download,
  Users,
  FileText,
  FolderOpen,
  Target,
  Star,
  MessageSquare,
  BarChart3,
  Percent,
  Zap,
  Activity,
  Award
} from "lucide-react";
import { MetricCard as MetricCardShared, ProgressMetric as ProgressMetricShared, TimeRangePicker, TIME_RANGE_LABELS, TimeRangeKey } from '@/components/analytics/AnalyticsComponents';

const COLORS = ['#ff5932', '#F04F6A', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

// Aliases to shared components for clarity in this page
const MetricCard = MetricCardShared as typeof MetricCardShared;
const ProgressMetric = ProgressMetricShared as typeof ProgressMetricShared;

const OrganisationAnalyticsAdvanced = () => {
  useOrgPageTitle("Analytics Avancé");
  const { id: organisationId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState<TimeRangeKey>("6months");
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("json");
  const [refreshing, setRefreshing] = useState(false);

  // Utiliser le nouveau hook d'analytics avancés avec mémorisation
  const { data, metrics, loading, error, refetch } = useAdvancedAnalytics(timeRange);
  
  // Helper to compute cutoff matching the hook logic
  const cutoffDate = useMemo(() => {
    const now = new Date();
    switch (timeRange) {
      case "24h": {
        const d = new Date(now); d.setDate(d.getDate() - 1); return d;
      }
      case "7days": {
        const d = new Date(now); d.setDate(d.getDate() - 7); return d;
      }
      case "14days": {
        const d = new Date(now); d.setDate(d.getDate() - 14); return d;
      }
      case "1month":
        return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      case "3months":
        return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      case "6months":
        return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      case "12months":
      default:
        return new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
    }
  }, [timeRange]);

  const periodMetrics = useMemo(() => {
    const byDate = (arr: any[], field: string = 'created_at') => arr.filter((x) => new Date(x[field] || x.created_at) >= cutoffDate);
    const projects = byDate(data.projects);
    const adherents = byDate(data.adherents);
    const businessModels = byDate(data.businessModels);
    const pitches = byDate(data.pitches);
    const visionMissions = byDate(data.visionMissions);
    const marketAnalyses = byDate(data.marketAnalyses);
    const conversations = byDate(data.conversations);
    const messages = byDate(data.messages);
    const scores = byDate(data.scores);
    const completed = projects.filter((p) => ['completed', 'terminé'].includes(p.statut) || ['completed', 'terminé'].includes(p.statut_project)).length;
    const avgScore = scores.reduce((acc: {t:number;c:number}, s:any) => (s.score_final ? { t: acc.t + s.score_final, c: acc.c + 1 } : acc), { t: 0, c: 0 });

    return {
      totalProjects: projects.length,
      totalAdherents: adherents.length,
      projectSuccessRate: projects.length > 0 ? (completed / projects.length) * 100 : 0,
      averageScore: avgScore.c > 0 ? avgScore.t / avgScore.c : 0,
      avgMessagesPerConversation: conversations.length > 0 ? messages.length / conversations.length : 0,
      deliverablesSum: businessModels.length + pitches.length + visionMissions.length + marketAnalyses.length,
      totalBusinessModels: businessModels.length,
      totalPitches: pitches.length,
      totalVisionMissions: visionMissions.length,
      totalMarketAnalyses: marketAnalyses.length,
    };
  }, [data, cutoffDate]);

  const display = periodMetrics;

  // Données pour les graphiques
  const chartData = useMemo(() => {
    // Statut des projets
    const projectStatusData = [
      { name: 'En cours', value: metrics.activeProjects, color: '#ff5932' },
      { name: 'Complétés', value: metrics.completedProjects, color: '#82ca9d' },
      { name: 'Brouillons', value: metrics.draftProjects, color: '#ffc658' }
    ].filter(item => item.value > 0);

    // Progression des livrables
    const deliverablesProgress = [
      { name: 'Business Model', completed: metrics.totalBusinessModels, total: metrics.totalProjects, rate: metrics.completionRates.businessModel },
      { name: 'Pitch', completed: metrics.totalPitches, total: metrics.totalProjects, rate: metrics.completionRates.pitch },
      { name: 'Vision/Mission', completed: metrics.totalVisionMissions, total: metrics.totalProjects, rate: metrics.completionRates.visionMission },
      { name: 'Analyse Marché', completed: metrics.totalMarketAnalyses, total: metrics.totalProjects, rate: metrics.completionRates.marketAnalysis },
      { name: 'Concurrence', completed: metrics.totalConcurrences, total: metrics.totalProjects, rate: metrics.totalProjects > 0 ? (metrics.totalConcurrences / metrics.totalProjects) * 100 : 0 },
      { name: 'Ressources', completed: metrics.totalRessources, total: metrics.totalProjects, rate: metrics.totalProjects > 0 ? (metrics.totalRessources / metrics.totalProjects) * 100 : 0 }
    ];

    // Répartition des personas
    const personaData = Object.entries(metrics.personaTypes).map(([type, count]) => ({
      name: type,
      value: count,
      color: COLORS[Object.keys(metrics.personaTypes).indexOf(type) % COLORS.length]
    }));

    // Funnel de conversion
    const funnelData = [
      { name: 'Adhérents', value: metrics.totalAdherents, fill: COLORS[0] },
      { name: 'Projets créés', value: metrics.totalProjects, fill: COLORS[1] },
      { name: 'Business Models', value: metrics.totalBusinessModels, fill: COLORS[2] },
      { name: 'Projets complétés', value: metrics.completedProjects, fill: COLORS[3] }
    ];

    // Radar chart pour les performances
    const performanceData = [
      { metric: 'Projets', value: Math.min(metrics.totalProjects * 10, 100) },
      { metric: 'Engagement', value: Math.min(metrics.avgMessagesPerConversation * 20, 100) },
      { metric: 'Complétion', value: metrics.projectSuccessRate },
      { metric: 'Qualité', value: metrics.averageScore * 20 },
      { metric: 'Croissance', value: Math.min(metrics.monthlyGrowth.projects * 25, 100) },
      { metric: 'Rétention', value: Math.min(metrics.activeProjects / Math.max(metrics.totalProjects, 1) * 100, 100) }
    ];

    return {
      projectStatusData,
      deliverablesProgress,
      personaData,
      funnelData,
      performanceData,
      monthlyActivity: metrics.monthlyActivity
    };
  }, [metrics]);

  // Configuration des tabs
  const tabsConfig = [
    { key: "overview", label: "Vue d'ensemble", icon: BarChart3 },
    { key: "projects", label: "Projets", icon: FolderOpen },
    { key: "deliverables", label: "Livrables", icon: FileText },
    { key: "entrepreneurs", label: "Entrepreneurs", icon: Users },
    { key: "engagement", label: "Engagement", icon: MessageSquare },
    { key: "performance", label: "Performance", icon: Target }
  ];

  // Fonction d'export
  const handleExport = () => {
    // Construire un objet exhaustif
    const exportData = {
      metadata: {
        organisationId,
        generatedAt: new Date().toISOString(),
        timeRange,
        totalRecords: Object.values(data).reduce((acc: number, val: any) => acc + (Array.isArray(val) ? val.length : (val ? 1 : 0)), 0),
        sections: Object.keys(data),
        onboarding: {
          completed: metrics.onboardingCompleted,
          step: metrics.onboardingStep
        }
      },
      metrics,
      // Regrouper les données par domaine pour lisibilité
      domainData: {
        organization: data.organization,
        members: data.adherents,
        mentors: data.mentors,
        mentorAssignments: data.mentorAssignments,
        projects: data.projects,
        deliverables: data.deliverables,
        legacyDeliverables: {
          businessModels: data.businessModels,
          pitches: data.pitches,
            visionMissions: data.visionMissions,
          marketAnalyses: data.marketAnalyses,
          concurrences: data.concurrences,
          ressources: data.ressources,
          juridiques: data.juridiques
        },
        personas: data.personas,
        scores: data.scores,
        conversations: data.conversations,
        messages: data.messages,
        events: data.events,
        partners: data.partners,
        payments: {
          paymentIntents: data.paymentIntents,
          subscriptions: data.subscriptions
        },
        invitations: data.invitationCodes,
        forms: {
          templates: data.formTemplates,
          submissions: data.formSubmissions
        }
      },
      chartData,
      exportVersion: '2.0'
    };

    if (exportFormat === 'json') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${organisationId}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'csv') {
      // CSV : multiples sections (métriques clés + nouvelles métriques). Pour les données tabulaires massives JSON reste préférable.
      const csvData: (string | number | boolean)[][] = [
        // Métriques principales
        ['=== MÉTRIQUES PRINCIPALES ===', ''],
        ['Métrique', 'Valeur'],
        ['Total Projets', metrics.totalProjects],
        ['Projets Actifs', metrics.activeProjects],
        ['Projets Complétés', metrics.completedProjects],
        ['Projets Brouillons', metrics.draftProjects],
        ['Total Adhérents', metrics.totalAdherents],
        ['Total Mentors', metrics.totalMentors],
        ['Assignments Mentors Actifs', metrics.activeMentorAssignments],
        ['Assignments Mentors (Total)', metrics.totalMentorAssignments],
        ['Score Moyen', metrics.averageScore.toFixed(2)],
        ['Progression Moyenne Projets', metrics.avgProjectProgress?.toFixed(2)],
        ['Taux de Succès (%)', metrics.projectSuccessRate.toFixed(2)],
        ['Messages par Conversation', metrics.avgMessagesPerConversation.toFixed(2)],
        ['Onboarding Complété', metrics.onboardingCompleted],
        ['Étape Onboarding', metrics.onboardingStep],
        ['', ''],

        // Métriques de livrables
        ['=== LIVRABLES ===', ''],
        ['Business Models', metrics.totalBusinessModels],
        ['Pitches', metrics.totalPitches],
        ['Vision/Mission', metrics.totalVisionMissions],
        ['Analyses Marché', metrics.totalMarketAnalyses],
        ['Analyses Concurrence', metrics.totalConcurrences],
        ['Ressources', metrics.totalRessources],
        ['Juridiques', metrics.totalJuridiques],
        ['Personas', metrics.totalPersonas],
        ['Projets Évalués', metrics.totalScores],
        ['Deliverables (nouvelle table)', metrics.totalDeliverables],
        ['Deliverables Complétés', metrics.completedDeliverables],
        ['Deliverables Approuvés', metrics.approvedDeliverables],
        ['', ''],

        // Métriques d'engagement
        ['=== ENGAGEMENT ===', ''],
        ['Total Conversations', metrics.totalConversations],
        ['Total Messages', metrics.totalMessages],
        ['Total Événements', metrics.totalEvents],
        ['Participations Événements', metrics.totalEventParticipations],
        ['Participants Moyens/Événement', metrics.avgParticipantsPerEvent.toFixed(1)],
        ['Événements à Venir', metrics.upcomingEvents],
        ['Événements Passés', metrics.pastEvents],
        ['', ''],

        // Partenaires
        ['=== PARTENAIRES ===', ''],
        ['Partenaires (Total)', metrics.totalPartners],
        ['Partenaires Actifs', metrics.activePartners],
        ...Object.entries(metrics.partnerTypes || {}).map(([type, count]) => [`Partenaires (${type})`, count]),
        ['', ''],

        // Métriques financières
        ['=== FINANCES ===', ''],
        ['Total Paiements', metrics.totalPaymentIntents],
        ['Paiements Réussis', metrics.successfulPayments],
        ['Total Abonnements', metrics.totalSubscriptions],
        ['Abonnements Actifs', metrics.activeSubscriptions],
        ['', ''],

        // Métriques d'invitation
        ['=== INVITATIONS ===', ''],
        ['Total Codes Invitation', metrics.totalInvitationCodes],
        ['Codes Actifs', metrics.activeInvitationCodes],
        ['Codes Utilisés', metrics.usedInvitationCodes],
        ['', ''],

        // Formulaires
        ['=== FORMULAIRES ===', ''],
        ['Templates de Formulaires', metrics.formTemplates],
        ['Soumissions Totales', metrics.formSubmissions],
        ['Soumissions Revue', metrics.reviewedSubmissions],
        ['Soumissions Approuvées', metrics.approvedSubmissions],
        ['Soumissions Rejetées', metrics.rejectedSubmissions],
        ['', ''],

        // Croissance mensuelle
        ['=== CROISSANCE ===', ''],
        ['Nouveaux Projets', metrics.monthlyGrowth.projects],
        ['Nouveaux Entrepreneurs', metrics.monthlyGrowth.entrepreneurs],
        ['Nouveaux Business Models', metrics.monthlyGrowth.businessModels],
        ['Nouvelles Conversations', metrics.monthlyGrowth.conversations],
        ['Nouveaux Deliverables', metrics.monthlyGrowth.deliverables],
        ['Nouveaux Partenaires', metrics.monthlyGrowth.partners],
        ['', ''],

        // Taux de complétion
        ['=== TAUX DE COMPLÉTION (%) ===', ''],
        ['Business Model', metrics.completionRates.businessModel.toFixed(1)],
        ['Pitch', metrics.completionRates.pitch.toFixed(1)],
        ['Vision/Mission', metrics.completionRates.visionMission.toFixed(1)],
        ['Analyse Marché', metrics.completionRates.marketAnalysis.toFixed(1)]
      ];

      const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-complete-${organisationId}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    setExportDialogOpen(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Fonction pour changer de temporalité sans refresh
  const handleTimeRangeChange = (newTimeRange: TimeRangeKey) => {
    setTimeRange(newTimeRange);
    // Le hook useAdvancedAnalytics se chargera de recharger les données automatiquement
    // mais les composants seront mis à jour sans refresh complet de la page
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full overflow-x-hidden bg-[#F4F4F1]">
        <div className="max-w-[100vw] mx-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aurentia-orange mx-auto mb-4"></div>
                <p className="text-gray-500">Chargement des analytics avancés...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full overflow-x-hidden bg-[#F4F4F1]">
        <div className="max-w-[100vw] mx-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                <p className="text-red-500">Erreur lors du chargement: {error}</p>
                <Button onClick={handleRefresh} className="mt-4">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="max-w-[100vw] mx-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl animate-fade-in">
          {/* En-tête optimisé */}
          <div className="mb-6 lg:mb-8">
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Avancés</h1>
                <p className="mt-2 text-sm sm:text-base text-gray-600 leading-relaxed">
                  Tableau de bord complet avec toutes les métriques disponibles et capacités d'export.
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <TimeRangePicker value={timeRange} onChange={handleTimeRangeChange} />
                  <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="h-9 shadow-sm">
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Actualiser</span>
                  </Button>
                  <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-aurentia-orange hover:bg-aurentia-orange/90 text-white h-9 shadow-sm">
                        <Download className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Exporter</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Exporter les Analytics</DialogTitle>
                        <DialogDescription>
                          Choisissez le format d'export pour télécharger toutes les données d'analytics.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Format d'export</label>
                          <Select value={exportFormat} onValueChange={setExportFormat}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="json">JSON (données complètes)</SelectItem>
                              <SelectItem value="csv">CSV (métriques principales)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="text-sm text-gray-500">
                          <p><strong>JSON :</strong> Inclut toutes les données brutes et métriques calculées</p>
                          <p><strong>CSV :</strong> Tableau des métriques principales pour Excel/Sheets</p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                          Annuler
                        </Button>
                        <Button onClick={handleExport} className="bg-aurentia-orange hover:bg-aurentia-orange/90 text-white">
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>

          {/* Métriques principales - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <MetricCard
              title="Entrepreneurs"
              value={display.totalAdherents}
              subtitle={`Nouveaux (${TIME_RANGE_LABELS[timeRange]})`}
              icon={Users}
              trend={{ value: metrics.monthlyGrowth.entrepreneurs, label: "cette période" }}
              color="blue"
            />

            <MetricCard
              title="Projets Totaux"
              value={display.totalProjects}
              subtitle={`Créations (${TIME_RANGE_LABELS[timeRange]})`}
              icon={FolderOpen}
              trend={{ value: metrics.monthlyGrowth.projects, label: "nouveaux" }}
              color="green"
            />

            <MetricCard
              title="Taux de Succès"
              value={`${display.projectSuccessRate.toFixed(1)}%`}
              subtitle="Projets complétés"
              icon={Target}
              color="purple"
            />

            <MetricCard
              title="Score Moyen"
              value={`${display.averageScore.toFixed(1)}/5`}
              subtitle={`${metrics.totalScores} projets évalués`}
              icon={Star}
              color="orange"
            />

            <MetricCard
              title="Livrables"
              value={display.deliverablesSum}
              subtitle={`Créés (${TIME_RANGE_LABELS[timeRange]})`}
              icon={FileText}
              trend={{ value: metrics.monthlyGrowth.businessModels, label: "ce mois" }}
              color="red"
            />
          </div>

          {/* Tabs avec CustomTabs */}
          <CustomTabs
            tabs={tabsConfig}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          >
            {/* Vue d'ensemble */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Activité mensuelle */}
                  <Card className="col-span-2 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-aurentia-orange" />
                        Évolution ({TIME_RANGE_LABELS[timeRange]})
                      </CardTitle>
                      <CardDescription>Projets et entrepreneurs</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={chartData.monthlyActivity}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="projects"
                            stackId="1"
                            stroke="#ff5932"
                            fill="#ff5932"
                            name="Projets"
                          />
                          <Area
                            type="monotone"
                            dataKey="entrepreneurs"
                            stackId="1"
                            stroke="#F04F6A"
                            fill="#F04F6A"
                            name="Entrepreneurs"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Statut des projets */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Percent className="h-5 w-5 text-aurentia-orange" />
                        Statut des Projets
                      </CardTitle>
                      <CardDescription>Répartition par état d'avancement</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={chartData.projectStatusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {chartData.projectStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      
                      <div className="mt-4 space-y-2">
                        {chartData.projectStatusData.map((entry, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: entry.color }}
                              />
                              <span>{entry.name}</span>
                            </div>
                            <span className="font-medium">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Funnel de conversion */}
                  <Card className="col-span-2 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-aurentia-orange" />
                        Funnel de Conversion
                      </CardTitle>
                      <CardDescription>Parcours des entrepreneurs dans l'écosystème</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData.funnelData} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={120} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#ff5932" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Métriques rapides */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-aurentia-orange" />
                        Métriques Rapides
                      </CardTitle>
                      <CardDescription>Aperçu des performances</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Projets actifs</span>
                          <span className="font-semibold text-green-600">{metrics.activeProjects}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Croissance mensuelle</span>
                          <span className="font-semibold text-blue-600">
                            +{metrics.monthlyGrowth.projects} projets
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Score moyen global</span>
                          <span className="font-semibold text-orange-600">
                            {metrics.averageScore.toFixed(1)}/5
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Livrables créés</span>
                          <span className="font-semibold text-purple-600">
                            {metrics.totalBusinessModels + metrics.totalPitches + metrics.totalVisionMissions + metrics.totalMarketAnalyses}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Taux de complétion</span>
                          <span className="font-semibold text-indigo-600">
                            {metrics.projectSuccessRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Projets */}
            {activeTab === "projects" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Projets par statut détaillé */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle>Analyse des Projets</CardTitle>
                      <CardDescription>Distribution détaillée par statut</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="font-medium text-green-800">Projets Actifs</span>
                          <span className="text-2xl font-bold text-green-600">{metrics.activeProjects}</span>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                          <span className="font-medium text-blue-800">Projets Complétés</span>
                          <span className="text-2xl font-bold text-blue-600">{metrics.completedProjects}</span>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                          <span className="font-medium text-orange-800">Brouillons</span>
                          <span className="text-2xl font-bold text-orange-600">{metrics.draftProjects}</span>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-800">Total</span>
                          <span className="text-2xl font-bold text-gray-600">{metrics.totalProjects}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Croissance des projets */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle>Croissance des Projets</CardTitle>
                      <CardDescription>Nouveaux projets par période</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData.monthlyActivity}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="projects" stroke="#ff5932" strokeWidth={2} name="Nouveaux projets" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Livrables */}
            {activeTab === "deliverables" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Progression des livrables */}
                  <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-aurentia-orange" />
                        Progression des Livrables
                      </CardTitle>
                      <CardDescription>Taux de complétion par type de livrable</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={chartData.deliverablesProgress} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" domain={[0, 100]} />
                          <YAxis dataKey="name" type="category" width={120} />
                          <Tooltip formatter={(value, name) => {
                            if (name === 'rate') return [`${Number(value).toFixed(1)}%`, 'Taux de complétion'];
                            if (name === 'completed') return [value, 'Complétés'];
                            return [value, name];
                          }} />
                          <Legend />
                          <Bar dataKey="rate" fill="#ff5932" name="Taux de complétion %" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Répartition des personas */}
                  {chartData.personaData.length > 0 && (
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-aurentia-orange" />
                          Types de Personas
                        </CardTitle>
                        <CardDescription>Répartition par catégorie</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={chartData.personaData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {chartData.personaData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        
                        <div className="mt-4 space-y-2">
                          {chartData.personaData.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span>{entry.name}</span>
                              </div>
                              <span className="font-medium">{entry.value}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Métriques de livrables détaillées */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-aurentia-orange" />
                        Statistiques des Livrables
                      </CardTitle>
                      <CardDescription>Vue d'ensemble de la production</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Business Models</span>
                          <span className="font-semibold text-blue-600">{metrics.totalBusinessModels}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Pitches</span>
                          <span className="font-semibold text-green-600">{metrics.totalPitches}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Vision/Mission</span>
                          <span className="font-semibold text-purple-600">{metrics.totalVisionMissions}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Analyses Marché</span>
                          <span className="font-semibold text-orange-600">{metrics.totalMarketAnalyses}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Analyses Concurrence</span>
                          <span className="font-semibold text-red-600">{metrics.totalConcurrences}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Ressources</span>
                          <span className="font-semibold text-indigo-600">{metrics.totalRessources}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Juridiques</span>
                          <span className="font-semibold text-yellow-600">{metrics.totalJuridiques}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Personas</span>
                          <span className="font-semibold text-pink-600">{metrics.totalPersonas}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tableau de progression détaillé */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-aurentia-orange" />
                      Progression Détaillée
                    </CardTitle>
                    <CardDescription>Analyse complète des taux de complétion</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {chartData.deliverablesProgress.map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-sm text-gray-600">
                              {item.completed}/{item.total} ({item.rate.toFixed(1)}%)
                            </span>
                          </div>
                          <ProgressMetric
                            title=""
                            value={item.rate}
                            color={COLORS[index % COLORS.length]}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Entrepreneurs */}
            {activeTab === "entrepreneurs" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Statistiques de recrutement */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-aurentia-orange" />
                        Recrutement
                      </CardTitle>
                      <CardDescription>Inscriptions et croissance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Entrepreneurs</span>
                          <span className="font-semibold text-blue-600">{metrics.totalAdherents}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Nouveaux ({TIME_RANGE_LABELS[timeRange]})</span>
                          <span className="font-semibold text-green-600">{metrics.monthlyGrowth.entrepreneurs}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Taux de croissance</span>
                          <span className="font-semibold text-purple-600">
                            {metrics.totalAdherents > 0 ? ((metrics.monthlyGrowth.entrepreneurs / metrics.totalAdherents) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Activité des entrepreneurs */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-aurentia-orange" />
                        Activité Moyenne
                      </CardTitle>
                      <CardDescription>Par entrepreneur</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Projets par entrepreneur</span>
                          <span className="font-semibold text-blue-600">
                            {metrics.totalAdherents > 0 ? (metrics.totalProjects / metrics.totalAdherents).toFixed(1) : '0'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Événements par entrepreneur</span>
                          <span className="font-semibold text-green-600">
                            {metrics.totalAdherents > 0 ? (metrics.totalEvents / metrics.totalAdherents).toFixed(1) : '0'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Conversations par entrepreneur</span>
                          <span className="font-semibold text-purple-600">
                            {metrics.totalAdherents > 0 ? (metrics.totalConversations / metrics.totalAdherents).toFixed(1) : '0'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Répartition par statut */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-aurentia-orange" />
                        Statut des Entrepreneurs
                      </CardTitle>
                      <CardDescription>Répartition par rôle</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(() => {
                          const roleStats = data.adherents.reduce((acc, entrepreneur) => {
                            const role = entrepreneur.user_role || 'member';
                            acc[role] = (acc[role] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>);

                          const total = Object.values(roleStats).reduce((sum: number, count: number) => sum + count, 0);
                          
                          const roleEntries = Object.entries(roleStats) as Array<[string, number]>;
                          const totalNumber = Number(total);
                          return roleEntries.map(([role, count]) => (
                            <div key={role} className="flex justify-between items-center">
                              <span className="text-sm text-gray-600 capitalize">
                                {role === 'member' ? 'Membre' : 
                                 role === 'staff' ? 'Staff' : 
                                 role === 'organisation' ? 'Organisation' : role}
                              </span>
                              <span className="font-semibold text-indigo-600">
                                {count} ({totalNumber > 0 ? ((count / totalNumber) * 100).toFixed(0) : 0}%)
                              </span>
                            </div>
                          ));
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Graphiques d'évolution des entrepreneurs */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Évolution des inscriptions */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-aurentia-orange" />
                        Évolution des Inscriptions
                      </CardTitle>
                      <CardDescription>Nouveaux entrepreneurs par période</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData.monthlyActivity}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="entrepreneurs" 
                            stroke="#ff5932" 
                            strokeWidth={2} 
                            name="Nouveaux entrepreneurs" 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Segmentation par ancienneté */}
                  {(() => {
                    const now = new Date();
                    const segments = {
                      '0-1 mois': 0,
                      '1-3 mois': 0,
                      '3-6 mois': 0,
                      '6-12 mois': 0,
                      '+12 mois': 0
                    };

                    data.adherents.forEach(adhérent => {
                      const createdAt = new Date(adhérent.created_at);
                      const monthsDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
                      
                      if (monthsDiff <= 1) segments['0-1 mois']++;
                      else if (monthsDiff <= 3) segments['1-3 mois']++;
                      else if (monthsDiff <= 6) segments['3-6 mois']++;
                      else if (monthsDiff <= 12) segments['6-12 mois']++;
                      else segments['+12 mois']++;
                    });

                    const segmentData = Object.entries(segments).map(([segment, count]) => ({
                      name: segment,
                      value: count,
                      color: COLORS[Object.keys(segments).indexOf(segment) % COLORS.length]
                    })).filter(item => item.value > 0);

                    return segmentData.length > 0 ? (
                      <Card className="shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-aurentia-orange" />
                            Ancienneté des Entrepreneurs
                          </CardTitle>
                          <CardDescription>Répartition par durée d'adhésion</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={segmentData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {segmentData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                          
                          <div className="mt-4 space-y-2">
                            {segmentData.map((entry, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <span>{entry.name}</span>
                                </div>
                                <span className="font-medium">{entry.value}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ) : null;
                  })()}
                </div>

                {/* Métriques détaillées des entrepreneurs */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-aurentia-orange" />
                      Métriques Détaillées
                    </CardTitle>
                    <CardDescription>Analyse approfondie de la communauté entrepreneuriale</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">Productivité</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Projets actifs/entrepreneur</span>
                            <span className="font-medium">
                              {metrics.totalAdherents > 0 ? (metrics.activeProjects / metrics.totalAdherents).toFixed(1) : '0'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Livrables/entrepreneur</span>
                            <span className="font-medium">
                              {metrics.totalAdherents > 0 ? 
                                ((metrics.totalBusinessModels + metrics.totalPitches + metrics.totalVisionMissions + metrics.totalMarketAnalyses) / metrics.totalAdherents).toFixed(1) : '0'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">Engagement</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Participation événements</span>
                            <span className="font-medium">
                              {metrics.totalEventParticipations > 0 ? 
                                ((metrics.totalEventParticipations / metrics.totalAdherents) * 100).toFixed(0) : 0}% des adhérents
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Taux conversation</span>
                            <span className="font-medium">
                              {metrics.totalAdherents > 0 ? 
                                ((metrics.totalConversations / metrics.totalAdherents) * 100).toFixed(0) : 0}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">Qualité</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Score moyen</span>
                            <span className="font-medium">{metrics.averageScore.toFixed(1)}/5</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Taux de succès</span>
                            <span className="font-medium">{metrics.projectSuccessRate.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">Croissance</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Nouveaux ce mois</span>
                            <span className="font-medium">+{metrics.monthlyGrowth.entrepreneurs}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Taux de rétention estimé</span>
                            <span className="font-medium">
                              {metrics.totalAdherents > 0 ? 
                                ((metrics.activeProjects / metrics.totalProjects) * 100).toFixed(0) : 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Engagement */}
            {activeTab === "engagement" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Métriques d'événements */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-aurentia-orange" />
                        Engagement Événements
                      </CardTitle>
                      <CardDescription>Participation et création d'événements</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Événements</span>
                          <span className="font-semibold text-blue-600">{metrics.totalEvents}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Participations Totales</span>
                          <span className="font-semibold text-green-600">{metrics.totalEventParticipations}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Participants Moyens/Événement</span>
                          <span className="font-semibold text-purple-600">
                            {metrics.avgParticipantsPerEvent.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Statut des événements */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-aurentia-orange" />
                        Statut des Événements
                      </CardTitle>
                      <CardDescription>Répartition par période</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                          <span className="font-medium text-blue-800">Événements à Venir</span>
                          <span className="text-2xl font-bold text-blue-600">{metrics.upcomingEvents}</span>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="font-medium text-green-800">Événements Passés</span>
                          <span className="text-2xl font-bold text-green-600">{metrics.pastEvents}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Taux de participation */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Percent className="h-5 w-5 text-aurentia-orange" />
                        Taux de Participation
                      </CardTitle>
                      <CardDescription>Mesure de l'engagement communautaire</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Taux de participation moyen</span>
                          <span className="font-semibold text-indigo-600">
                            {metrics.totalEvents > 0 ? ((metrics.totalEventParticipations / (metrics.totalEvents * metrics.totalAdherents)) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Événements par adhérent</span>
                          <span className="font-semibold text-orange-600">
                            {metrics.totalAdherents > 0 ? (metrics.totalEvents / metrics.totalAdherents).toFixed(1) : 0}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Graphique d'activité des événements - pleine largeur */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-aurentia-orange" />
                      Activité Événements
                    </CardTitle>
                    <CardDescription>Création d'événements par période</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={chartData.monthlyActivity}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="events" 
                          stroke="#ff5932" 
                          strokeWidth={2} 
                          name="Événements créés" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Graphiques d'événements */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Répartition par type d'événement */}
                  {(() => {
                    const eventTypes = data.events.reduce((acc, event) => {
                      acc[event.type] = (acc[event.type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);

                    const eventTypeData = Object.entries(eventTypes).map(([type, count]) => ({
                      name: type,
                      value: count,
                      color: COLORS[Object.keys(eventTypes).indexOf(type) % COLORS.length]
                    }));

                    return eventTypeData.length > 0 ? (
                      <Card className="shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-aurentia-orange" />
                            Types d'Événements
                          </CardTitle>
                          <CardDescription>Répartition par catégorie</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={eventTypeData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {eventTypeData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                          
                          <div className="mt-4 space-y-2">
                            {eventTypeData.map((entry, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <span>{entry.name}</span>
                                </div>
                                <span className="font-medium">{Number(entry.value)}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ) : null;
                  })()}
                </div>
              </div>
            )}

            {/* Performance */}
            {activeTab === "performance" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Performance radar */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-aurentia-orange" />
                        Radar de Performance
                      </CardTitle>
                      <CardDescription>Vue multidimensionnelle des KPIs</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <RadarChart data={chartData.performanceData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="metric" />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} />
                          <Radar
                            name="Performance"
                            dataKey="value"
                            stroke="#ff5932"
                            fill="#ff5932"
                            fillOpacity={0.6}
                          />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* KPIs détaillés */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-aurentia-orange" />
                        KPIs Détaillés
                      </CardTitle>
                      <CardDescription>Indicateurs de performance clés</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <ProgressMetric
                          title="Taux de complétion Business Model"
                          value={metrics.completionRates.businessModel}
                          color="#ff5932"
                        />

                        <ProgressMetric
                          title="Taux de complétion Pitch"
                          value={metrics.completionRates.pitch}
                          color="#82ca9d"
                        />

                        <ProgressMetric
                          title="Taux de complétion Vision/Mission"
                          value={metrics.completionRates.visionMission}
                          color="#ffc658"
                        />

                        <ProgressMetric
                          title="Taux de complétion Analyse Marché"
                          value={metrics.completionRates.marketAnalysis}
                          color="#ff7c7c"
                        />
                        
                        <ProgressMetric
                          title="Taux de succès global"
                          value={metrics.projectSuccessRate}
                          color="#8884d8"
                        />
                        
                        <ProgressMetric
                          title="Score moyen"
                          value={metrics.averageScore * 20}
                          color="#d084d0"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Métriques additionnelles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        Productivité
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Projets par adhérent</span>
                          <span className="font-semibold">
                            {metrics.totalAdherents > 0 ? 
                              (metrics.totalProjects / metrics.totalAdherents).toFixed(1) : '0'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Livrables par projet</span>
                          <span className="font-semibold">
                            {metrics.totalProjects > 0 ? 
                              ((metrics.totalBusinessModels + metrics.totalPitches + metrics.totalVisionMissions + metrics.totalMarketAnalyses) / metrics.totalProjects).toFixed(1) : '0'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-500" />
                        Engagement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Conversations actives</span>
                          <span className="font-semibold">{metrics.totalConversations}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Messages par conversation</span>
                          <span className="font-semibold">{metrics.avgMessagesPerConversation.toFixed(1)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-purple-500" />
                        Qualité
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Score moyen</span>
                          <span className="font-semibold">{metrics.averageScore.toFixed(1)}/5</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Projets évalués</span>
                          <span className="font-semibold">{metrics.totalScores}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

          </CustomTabs>
        </div>
      </div>
    </div>
  );
};

export default OrganisationAnalyticsAdvanced;