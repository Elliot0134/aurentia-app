/**
 * Utility functions for exporting analytics data to CSV and other formats
 */

export interface ExportData {
  headers: string[];
  rows: (string | number)[][];
}

export const exportToCSV = (data: ExportData, filename: string) => {
  const csvContent = [
    data.headers.join(','),
    ...data.rows.map(row => row.map(cell => {
      // Escape cells containing commas, quotes, or newlines
      const cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const prepareFinancialsExport = (metrics: any): ExportData => {
  return {
    headers: ['Métrique', 'Valeur'],
    rows: [
      ['MRR', `${metrics.mrr.toFixed(2)}€`],
      ['Revenue Total Annualisé', `${metrics.totalRevenue.toFixed(2)}€`],
      ['Revenue Moyen par Utilisateur', `${metrics.averageRevenuePerUser.toFixed(2)}€`],
      ['Total Abonnés', metrics.totalSubscribers],
      ['Abonnés Actifs', metrics.activeSubscribers],
      ['Taux de Churn', `${metrics.churnRate.toFixed(2)}%`],
      ['Utilisation Crédits', `${metrics.creditUtilizationRate.toFixed(2)}%`],
      ['Crédits Alloués', metrics.totalCreditsAllocated],
      ['Crédits Utilisés', metrics.totalCreditsUsed],
      ['Paiements à Jour', metrics.paymentStatusDistribution.current],
      ['Paiements en Retard', metrics.paymentStatusDistribution.overdue],
      ['Paiements Échoués', metrics.paymentStatusDistribution.failed],
    ]
  };
};

export const prepareGrowthExport = (metrics: any): ExportData => {
  return {
    headers: ['Métrique', 'Valeur'],
    rows: [
      ['Total Inscriptions', metrics.totalSignups],
      ['Inscriptions Cette Période', metrics.signupsThisPeriod],
      ['Taux de Croissance', `${metrics.signupGrowthRate.toFixed(2)}%`],
      ['Taux de Rétention', `${metrics.retentionRate.toFixed(2)}%`],
      ['Taux d\'Activation', `${metrics.activationRate.toFixed(2)}%`],
      ['Utilisateurs Activés', metrics.activatedUsers],
      ['Taux de Churn', `${metrics.churnRate.toFixed(2)}%`],
      ['Utilisateurs Churnés', metrics.churnedUsers],
      ['Conversion Invitations', `${metrics.invitationConversionRate.toFixed(2)}%`],
      ['Invitations Générées', metrics.invitationsGenerated],
      ['Invitations Acceptées', metrics.invitationsAccepted],
      ['Nouveaux Utilisateurs (<7j)', metrics.usersByStage.new],
      ['Utilisateurs Actifs', metrics.usersByStage.active],
      ['Utilisateurs Dormants', metrics.usersByStage.dormant],
      ['Utilisateurs Churnés', metrics.usersByStage.churned],
    ]
  };
};

export const preparePartnersExport = (metrics: any): ExportData => {
  return {
    headers: ['Métrique', 'Valeur'],
    rows: [
      ['Total Partenaires', metrics.totalPartners],
      ['Partenaires Actifs', metrics.activePartners],
      ['Prospects', metrics.prospectPartners],
      ['Partenaires Inactifs', metrics.inactivePartners],
      ['Taux de Conversion', `${metrics.prospectToActiveConversion.toFixed(2)}%`],
      ['Note Moyenne', `${metrics.averageRating.toFixed(2)} / 5`],
      ['Partenaires Ajoutés Cette Période', metrics.partnersAddedThisPeriod],
      ['Taux de Croissance', `${metrics.partnerGrowthRate.toFixed(2)}%`],
    ]
  };
};

export const prepareMentorsExport = (metrics: any): ExportData => {
  return {
    headers: ['Métrique', 'Valeur'],
    rows: [
      ['Total Mentors', metrics.totalMentors],
      ['Mentors Actifs', metrics.activeMentors],
      ['Ratio Mentor:Entrepreneur', metrics.mentorToEntrepreneurRatio],
      ['Capacité Totale', metrics.totalCapacity],
      ['Charge Actuelle', metrics.currentLoad],
      ['Utilisation Capacité', `${metrics.capacityUtilization.toFixed(2)}%`],
      ['Mentors à Capacité Max', metrics.mentorsAtCapacity],
      ['Total Assignments', metrics.totalAssignments],
      ['Assignments Actifs', metrics.activeAssignments],
      ['Assignments Complétés', metrics.completedAssignments],
      ['Taux de Succès Moyen', `${metrics.averageSuccessRate.toFixed(2)}%`],
      ['Note Moyenne', `${metrics.averageRating.toFixed(2)} / 5`],
      ['Entrepreneurs Moyens par Mentor', metrics.averageEntrepreneursPerMentor.toFixed(2)],
      ['Mentors aussi Staff', metrics.mentorsAlsoStaff],
    ]
  };
};

export const prepareDeliverablesExport = (metrics: any): ExportData => {
  const typeRows = metrics.deliverablesByType.map((d: any) => [
    d.type,
    d.total,
    d.completed,
    `${d.completionRate.toFixed(2)}%`
  ]);

  return {
    headers: ['Type de Livrable', 'Total', 'Complétés', 'Taux de Complétion'],
    rows: [
      ['=== RÉSUMÉ ===', '', '', ''],
      ['Total Livrables', metrics.totalDeliverables, '', ''],
      ['Livrables Complétés', metrics.completedDeliverables, '', ''],
      ['Taux de Complétion Global', '', '', `${metrics.completionRate.toFixed(2)}%`],
      ['Score Qualité Moyen', '', '', `${metrics.averageQualityScore.toFixed(2)}%`],
      ['Temps Moyen de Complétion', '', '', `${metrics.averageCompletionTime} jours`],
      ['', '', '', ''],
      ['=== PAR TYPE ===', '', '', ''],
      ...typeRows
    ]
  };
};

export const prepareEventsExport = (metrics: any): ExportData => {
  return {
    headers: ['Métrique', 'Valeur'],
    rows: [
      ['Total Événements', metrics.totalEvents],
      ['Événements à Venir', metrics.upcomingEvents],
      ['Événements Passés', metrics.pastEvents],
      ['Événements Récurrents', metrics.recurringEvents],
      ['Total Participants', metrics.totalParticipants],
      ['Participants Moyens par Événement', metrics.averageParticipantsPerEvent.toFixed(2)],
    ]
  };
};

export const prepareResourcesExport = (metrics: any): ExportData => {
  return {
    headers: ['Métrique', 'Valeur'],
    rows: [
      ['Total Ressources', metrics.totalResources],
      ['Ressources Publiées', metrics.publishedResources],
      ['Brouillons', metrics.draftResources],
      ['Total Vues', metrics.totalViews],
      ['Total Partages', metrics.totalShares],
      ['Taux d\'Engagement Moyen', `${metrics.averageEngagementRate.toFixed(2)}%`],
    ]
  };
};

export const prepareEngagementExport = (metrics: any): ExportData => {
  return {
    headers: ['Métrique', 'Valeur'],
    rows: [
      ['Total Conversations', metrics.totalConversations],
      ['Conversations Actives', metrics.activeConversations],
      ['Total Messages', metrics.totalMessages],
      ['Temps de Réponse Moyen', `${metrics.averageResponseTime} min`],
      ['Sessions Chatbot', metrics.totalChatSessions],
      ['Messages Moyens par Session', metrics.averageMessagesPerSession.toFixed(2)],
      ['Utilisateurs Actifs Quotidiens', metrics.dailyActiveUsers],
      ['Utilisateurs Actifs Hebdomadaires', metrics.weeklyActiveUsers],
      ['Utilisateurs Actifs Mensuels', metrics.monthlyActiveUsers],
      ['Articles Base de Connaissances', metrics.knowledgeBaseItems],
      ['Stockage Utilisé (MB)', metrics.knowledgeBaseStorageUsed.toFixed(2)],
    ]
  };
};

export const prepareStaffExport = (metrics: any): ExportData => {
  const roleRows = metrics.staffByRole.map((s: any) => [s.role, s.count]);

  return {
    headers: ['Métrique', 'Valeur'],
    rows: [
      ['=== RÉSUMÉ ===', ''],
      ['Total Staff', metrics.totalStaff],
      ['Staff Actifs', metrics.activeStaff],
      ['Ratio Staff:Entrepreneur', metrics.staffToEntrepreneurRatio],
      ['Staff aussi Mentors', metrics.staffAlsoMentors],
      ['', ''],
      ['=== PAR RÔLE ===', ''],
      ...roleRows
    ]
  };
};

export const prepareFormsExport = (metrics: any): ExportData => {
  return {
    headers: ['Métrique', 'Valeur'],
    rows: [
      ['Total Formulaires', metrics.totalForms],
      ['Formulaires Publiés', metrics.publishedForms],
      ['Brouillons', metrics.draftForms],
      ['Total Soumissions', metrics.totalSubmissions],
      ['Soumissions Cette Période', metrics.submissionsThisPeriod],
      ['Taux de Réponse Moyen', `${metrics.averageResponseRate.toFixed(2)}%`],
      ['Invitations Générées', metrics.invitationsGenerated],
      ['Invitations Utilisées', metrics.invitationsUsed],
      ['Taux d\'Utilisation', `${metrics.invitationUsageRate.toFixed(2)}%`],
    ]
  };
};
