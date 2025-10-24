import { useState, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimeRangeFilter, DateRange, MetricComparison, getComparisonPeriod } from "@/components/organisation/analytics/TimeRangeFilter";
import {
  exportToCSV,
  prepareFinancialsExport,
  prepareGrowthExport,
  preparePartnersExport,
  prepareMentorsExport,
  prepareDeliverablesExport,
  prepareEventsExport,
  prepareResourcesExport,
  prepareEngagementExport,
  prepareStaffExport,
  prepareFormsExport
} from "@/utils/analyticsExport";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrganisationFinancials } from "@/hooks/useOrganisationFinancials";
import { useOrganisationGrowthMetrics } from "@/hooks/useOrganisationGrowthMetrics";
import { useOrganisationPartnerMetrics } from "@/hooks/useOrganisationPartnerMetrics";
import { useOrganisationMentorMetrics } from "@/hooks/useOrganisationMentorMetrics";
import { useOrganisationFormMetrics } from "@/hooks/useOrganisationFormMetrics";
import { useOrganisationDeliverableMetrics } from "@/hooks/useOrganisationDeliverableMetrics";
import { useOrganisationEventMetrics, useOrganisationResourceMetrics, useOrganisationEngagementMetrics, useOrganisationStaffMetrics } from "@/hooks/useOrganisationAnalyticsMetrics";
import { useOrganisationStats, useProjects, useEntrepreneurs } from '@/hooks/useOrganisationData';
import { useNewsletters } from '@/hooks/newsletters/useNewsletters';
import { subDays } from "date-fns";
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
  Area
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  Users,
  Target,
  Handshake,
  GraduationCap,
  FileText,
  CheckSquare,
  Calendar,
  BookOpen,
  MessageSquare,
  UserCog,
  Download
} from "lucide-react";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d1'];

const OrganisationAnalytics = () => {
  const { id: organisationId } = useParams();

  // Get tab from URL params (source of truth)
  const [searchParams, setSearchParams] = useSearchParams();
  const validTabs = ['overview', 'financials', 'growth', 'partners', 'mentors', 'forms', 'deliverables', 'events', 'resources', 'engagement', 'staff'];
  const tabFromUrl = searchParams.get('tab') || 'overview';
  const activeTab = validTabs.includes(tabFromUrl) ? tabFromUrl : 'overview';

  // Function to update tab and URL
  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  // Date range state
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [comparisonMode, setComparisonMode] = useState(false);

  // Export function
  const handleExport = (type: string) => {
    const dateStr = new Date().toISOString().split('T')[0];

    switch (type) {
      case 'financials':
        if (financialMetrics) {
          exportToCSV(prepareFinancialsExport(financialMetrics), `analytics-financials-${dateStr}`);
        }
        break;
      case 'growth':
        if (growthMetrics) {
          exportToCSV(prepareGrowthExport(growthMetrics), `analytics-growth-${dateStr}`);
        }
        break;
      case 'partners':
        if (partnerMetrics) {
          exportToCSV(preparePartnersExport(partnerMetrics), `analytics-partners-${dateStr}`);
        }
        break;
      case 'mentors':
        if (mentorMetrics) {
          exportToCSV(prepareMentorsExport(mentorMetrics), `analytics-mentors-${dateStr}`);
        }
        break;
      case 'forms':
        if (formMetrics) {
          exportToCSV(prepareFormsExport(formMetrics), `analytics-forms-${dateStr}`);
        }
        break;
      case 'deliverables':
        if (deliverableMetrics) {
          exportToCSV(prepareDeliverablesExport(deliverableMetrics), `analytics-deliverables-${dateStr}`);
        }
        break;
      case 'events':
        if (eventMetrics) {
          exportToCSV(prepareEventsExport(eventMetrics), `analytics-events-${dateStr}`);
        }
        break;
      case 'resources':
        if (resourceMetrics) {
          exportToCSV(prepareResourcesExport(resourceMetrics), `analytics-resources-${dateStr}`);
        }
        break;
      case 'engagement':
        if (engagementMetrics) {
          exportToCSV(prepareEngagementExport(engagementMetrics), `analytics-engagement-${dateStr}`);
        }
        break;
      case 'staff':
        if (staffMetrics) {
          exportToCSV(prepareStaffExport(staffMetrics), `analytics-staff-${dateStr}`);
        }
        break;
      case 'all':
        // Export all metrics
        if (financialMetrics) exportToCSV(prepareFinancialsExport(financialMetrics), `analytics-financials-${dateStr}`);
        if (growthMetrics) exportToCSV(prepareGrowthExport(growthMetrics), `analytics-growth-${dateStr}`);
        if (partnerMetrics) exportToCSV(preparePartnersExport(partnerMetrics), `analytics-partners-${dateStr}`);
        if (mentorMetrics) exportToCSV(prepareMentorsExport(mentorMetrics), `analytics-mentors-${dateStr}`);
        break;
    }
  };

  // Fetch all metrics
  const { metrics: financialMetrics, loading: financialLoading } = useOrganisationFinancials(dateRange);
  const { metrics: growthMetrics, loading: growthLoading } = useOrganisationGrowthMetrics(dateRange);
  const { metrics: partnerMetrics, loading: partnerLoading } = useOrganisationPartnerMetrics(dateRange);
  const { metrics: mentorMetrics, loading: mentorLoading } = useOrganisationMentorMetrics(dateRange);
  const { metrics: formMetrics, loading: formLoading } = useOrganisationFormMetrics(dateRange);
  const { metrics: deliverableMetrics, loading: deliverableLoading } = useOrganisationDeliverableMetrics(dateRange);
  const { metrics: eventMetrics, loading: eventLoading } = useOrganisationEventMetrics(dateRange);
  const { metrics: resourceMetrics, loading: resourceLoading } = useOrganisationResourceMetrics(dateRange);
  const { metrics: engagementMetrics, loading: engagementLoading } = useOrganisationEngagementMetrics(dateRange);
  const { metrics: staffMetrics, loading: staffLoading } = useOrganisationStaffMetrics(dateRange);

  // Legacy hooks for newsletter data
  const { data: newsletters } = useNewsletters(organisationId || "");
  const { stats } = useOrganisationStats();
  const { projects } = useProjects();
  const { entrepreneurs } = useEntrepreneurs();

  // Comparison period data (if comparison mode is enabled)
  const comparisonPeriod = useMemo(() => {
    return comparisonMode ? getComparisonPeriod(dateRange) : null;
  }, [comparisonMode, dateRange]);

  const { metrics: financialMetricsComparison } = useOrganisationFinancials(comparisonPeriod || undefined);
  const { metrics: growthMetricsComparison } = useOrganisationGrowthMetrics(comparisonPeriod || undefined);

  const isLoading = financialLoading || growthLoading || partnerLoading || mentorLoading ||
    formLoading || deliverableLoading || eventLoading || resourceLoading ||
    engagementLoading || staffLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aurentia-orange mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics</h1>
            <p className="text-gray-600 text-base">
              Analyse complète des performances de votre organisation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exporter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Exporter les données</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport('all')}>
                  Tout exporter (principales métriques)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport('financials')}>
                  Finances
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('growth')}>
                  Croissance
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('partners')}>
                  Partenaires
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('mentors')}>
                  Mentors
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('forms')}>
                  Formulaires
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('deliverables')}>
                  Livrables
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('events')}>
                  Événements
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('resources')}>
                  Ressources
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('engagement')}>
                  Engagement
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('staff')}>
                  Équipe
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Time Range Filter */}
        <div className="mt-6">
          <TimeRangeFilter
            value={dateRange}
            onChange={setDateRange}
            comparisonMode={comparisonMode}
            onComparisonModeChange={setComparisonMode}
          />
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:grid-cols-11 gap-2">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="financials">Finances</TabsTrigger>
          <TabsTrigger value="growth">Croissance</TabsTrigger>
          <TabsTrigger value="partners">Partenaires</TabsTrigger>
          <TabsTrigger value="mentors">Mentors</TabsTrigger>
          <TabsTrigger value="forms">Formulaires</TabsTrigger>
          <TabsTrigger value="deliverables">Livrables</TabsTrigger>
          <TabsTrigger value="events">Événements</TabsTrigger>
          <TabsTrigger value="resources">Ressources</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="staff">Équipe</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Mensuel (MRR)</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <MetricComparison
                  label=""
                  current={financialMetrics?.mrr || 0}
                  previous={comparisonMode ? financialMetricsComparison?.mrr : undefined}
                  format={(v) => `${v.toFixed(0)}€`}
                  showComparison={comparisonMode}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entrepreneurs Actifs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <MetricComparison
                  label=""
                  current={growthMetrics?.totalSignups || 0}
                  previous={comparisonMode ? growthMetricsComparison?.totalSignups : undefined}
                  showComparison={comparisonMode}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux de Croissance</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <MetricComparison
                  label=""
                  current={growthMetrics?.signupGrowthRate || 0}
                  format={(v) => `${v.toFixed(1)}%`}
                  showComparison={false}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux de Complétion</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <MetricComparison
                  label=""
                  current={deliverableMetrics?.completionRate || 0}
                  format={(v) => `${v.toFixed(1)}%`}
                  showComparison={false}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Croissance des Inscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={growthMetrics?.signupsByPeriod || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="signups" fill="#8884d8" stroke="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Mensuel</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={financialMetrics?.revenueByMonth || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financials Tab */}
        <TabsContent value="financials" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">MRR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{financialMetrics?.mrr.toFixed(0)}€</div>
                <p className="text-xs text-muted-foreground mt-1">Revenue mensuel récurrent</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Revenue Moyen / Utilisateur</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{financialMetrics?.averageRevenuePerUser.toFixed(2)}€</div>
                <p className="text-xs text-muted-foreground mt-1">ARPU</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Taux de Churn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{financialMetrics?.churnRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {financialMetrics?.churnedSubscribers || 0} churned
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Utilisation Crédits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{financialMetrics?.creditUtilizationRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {financialMetrics?.totalCreditsUsed || 0} / {financialMetrics?.totalCreditsAllocated || 0}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Statut des Paiements</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'À jour', value: financialMetrics?.paymentStatusDistribution.current || 0 },
                        { name: 'En retard', value: financialMetrics?.paymentStatusDistribution.overdue || 0 },
                        { name: 'Échec', value: financialMetrics?.paymentStatusDistribution.failed || 0 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[0, 1, 2].map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue par Mois</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={financialMetrics?.revenueByMonth || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#82ca9d" name="Revenue (€)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Growth Tab */}
        <TabsContent value="growth" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Inscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{growthMetrics?.totalSignups || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {growthMetrics?.signupsThisPeriod || 0} cette période
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Taux de Rétention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{growthMetrics?.retentionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">Utilisateurs actifs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Taux d'Activation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{growthMetrics?.activationRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {growthMetrics?.activatedUsers || 0} activés
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Conversion Invitations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{growthMetrics?.invitationConversionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {growthMetrics?.invitationsAccepted || 0} / {growthMetrics?.invitationsGenerated || 0}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Inscriptions par Période</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={growthMetrics?.signupsByPeriod || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="signups" fill="#8884d8" stroke="#8884d8" name="Inscriptions" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cycle de Vie Utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Nouveaux (<7j)', value: growthMetrics?.usersByStage.new || 0 },
                      { name: 'Actifs', value: growthMetrics?.usersByStage.active || 0 },
                      { name: 'Dormants', value: growthMetrics?.usersByStage.dormant || 0 },
                      { name: 'Churnés', value: growthMetrics?.usersByStage.churned || 0 }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[0, 1, 2, 3].map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Partners Tab */}
        <TabsContent value="partners" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Partenaires</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{partnerMetrics?.totalPartners || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {partnerMetrics?.activePartners || 0} actifs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Prospects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{partnerMetrics?.prospectPartners || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">En prospection</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Taux de Conversion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{partnerMetrics?.prospectToActiveConversion.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">Prospect → Actif</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Note Moyenne</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{partnerMetrics?.averageRating.toFixed(1)} / 5</div>
                <p className="text-xs text-muted-foreground mt-1">Satisfaction</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Partenaires par Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={partnerMetrics?.partnersByType || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Types de Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={partnerMetrics?.collaborationTypes || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.type}: ${entry.count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(partnerMetrics?.collaborationTypes || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Mentors Tab */}
        <TabsContent value="mentors" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Mentors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mentorMetrics?.totalMentors || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {mentorMetrics?.activeMentors || 0} actifs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Ratio Mentor:Entrepreneur</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mentorMetrics?.mentorToEntrepreneurRatio}</div>
                <p className="text-xs text-muted-foreground mt-1">Charge moyenne</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Utilisation Capacité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mentorMetrics?.capacityUtilization.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {mentorMetrics?.currentLoad || 0} / {mentorMetrics?.totalCapacity || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Taux de Succès</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mentorMetrics?.averageSuccessRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">Performance moyenne</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribution des Expertises</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mentorMetrics?.expertiseDistribution?.slice(0, 10) || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="expertise" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forms & Invitations Tab */}
        <TabsContent value="forms" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Formulaires</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formMetrics?.totalForms || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formMetrics?.publishedForms || 0} publiés
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Invitations Générées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formMetrics?.invitationsGenerated || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formMetrics?.invitationsUsed || 0} utilisées
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Taux d'Utilisation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formMetrics?.invitationUsageRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">Invitations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Formulaires par Catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formMetrics?.formsByCategory.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Catégories actives</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Invitations par Rôle</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={formMetrics?.invitationsByRole || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="role" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Générées" />
                    <Bar dataKey="used" fill="#82ca9d" name="Utilisées" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Formulaires par Catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={formMetrics?.formsByCategory || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.category}: ${entry.count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(formMetrics?.formsByCategory || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Deliverables Tab */}
        <TabsContent value="deliverables" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Livrables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{deliverableMetrics?.totalDeliverables || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {deliverableMetrics?.completedDeliverables || 0} complétés
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Taux de Complétion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{deliverableMetrics?.completionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">Global</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Score Qualité Moyen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{deliverableMetrics?.averageQualityScore.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">Qualité</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Temps Moyen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{deliverableMetrics?.averageCompletionTime} j</div>
                <p className="text-xs text-muted-foreground mt-1">Complétion</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Livrables par Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={deliverableMetrics?.deliverablesByType || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="type" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#82ca9d" name="Complétés" />
                  <Bar dataKey="total" fill="#8884d8" name="Total" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribution des Statuts</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deliverableMetrics?.statusDistribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.status}: ${entry.count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(deliverableMetrics?.statusDistribution || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Complétions par Mois</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={deliverableMetrics?.completionsByMonth || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="completed" stroke="#82ca9d" name="Complétés" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Événements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{eventMetrics?.totalEvents || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {eventMetrics?.upcomingEvents || 0} à venir
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Événements Passés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{eventMetrics?.pastEvents || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Terminés</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{eventMetrics?.totalParticipants || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {eventMetrics?.averageParticipantsPerEvent.toFixed(1)} / événement
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Événements Récurrents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{eventMetrics?.recurringEvents || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Récurrents</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Événements par Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={eventMetrics?.eventsByType || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.type}: ${entry.count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(eventMetrics?.eventsByType || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Événements par Mois</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={eventMetrics?.eventsByMonth || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" name="Événements" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Ressources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resourceMetrics?.totalResources || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {resourceMetrics?.publishedResources || 0} publiées
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Brouillons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resourceMetrics?.draftResources || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Non publiées</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Vues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resourceMetrics?.totalViews || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Vues</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Partages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resourceMetrics?.totalShares || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Partages</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ressources par Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={resourceMetrics?.resourcesByType || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.type}: ${entry.count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(resourceMetrics?.resourcesByType || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Création de Ressources</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={resourceMetrics?.resourcesByMonth || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#82ca9d" name="Ressources créées" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{engagementMetrics?.totalConversations || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {engagementMetrics?.activeConversations || 0} actives
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Sessions Chatbot</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{engagementMetrics?.totalChatSessions || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {engagementMetrics?.averageMessagesPerSession.toFixed(1)} msg/session
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Base de Connaissances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{engagementMetrics?.knowledgeBaseItems || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {engagementMetrics?.knowledgeBaseStorageUsed.toFixed(2)} MB
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Utilisateurs Actifs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{engagementMetrics?.monthlyActiveUsers || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Ce mois</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Graphiques d'engagement détaillés à venir
            </p>
          </div>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Staff</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{staffMetrics?.totalStaff || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {staffMetrics?.activeStaff || 0} actifs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Ratio Staff:Entrepreneur</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{staffMetrics?.staffToEntrepreneurRatio}</div>
                <p className="text-xs text-muted-foreground mt-1">Charge</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Double Rôles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{staffMetrics?.staffAlsoMentors || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Staff + Mentor</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Départements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{staffMetrics?.staffByDepartment.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Actifs</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Staff par Rôle</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={staffMetrics?.staffByRole || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="role" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribution par Département</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={staffMetrics?.staffByDepartment || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.department}: ${entry.count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(staffMetrics?.staffByDepartment || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default OrganisationAnalytics;
