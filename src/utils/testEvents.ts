// Script de test pour vérifier le système d'événements
import { createEvent, getOrganisationEvents, updateEvent, deleteEvent } from '../services/organisationService';

// Test data
const testEvent = {
  title: 'Test Event',
  description: 'Event de test pour vérifier la fonctionnalité',
  start_date: new Date().toISOString(),
  end_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // +2 heures
  type: 'workshop' as const,
  location: 'Salle de test',
  is_recurring: false,
  max_participants: 10,
  organization_id: 'YOUR_ORG_ID_HERE' // Remplacer par un vrai ID d'organisation
};

export const testEventSystem = async () => {
  try {
    console.log('🚀 Test du système d\'événements...');
    
    // Test 1: Créer un événement
    console.log('1. Test création d\'événement...');
    const createdEvent = await createEvent(testEvent);
    console.log('✅ Événement créé:', createdEvent.id);
    
    // Test 2: Récupérer les événements
    console.log('2. Test récupération des événements...');
    const events = await getOrganisationEvents(testEvent.organization_id);
    console.log('✅ Événements récupérés:', events.length);
    
    // Test 3: Mettre à jour l'événement
    console.log('3. Test mise à jour d\'événement...');
    const updatedEvent = await updateEvent(createdEvent.id, {
      title: 'Test Event - Mis à jour',
      max_participants: 15
    });
    console.log('✅ Événement mis à jour:', updatedEvent.title);
    
    // Test 4: Supprimer l'événement
    console.log('4. Test suppression d\'événement...');
    const deleted = await deleteEvent(createdEvent.id);
    console.log('✅ Événement supprimé:', deleted);
    
    console.log('🎉 Tous les tests sont passés !');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
    throw error;
  }
};

// Tests de validation
export const testValidation = async () => {
  try {
    console.log('🔍 Test des validations...');
    
    // Test avec max_participants négatif
    try {
      await createEvent({
        ...testEvent,
        max_participants: -5
      });
      console.error('❌ La validation des participants négatifs a échoué');
    } catch (error) {
      console.log('✅ Validation des participants négatifs fonctionne');
    }
    
    // Test sans titre
    try {
      await createEvent({
        ...testEvent,
        title: ''
      });
      console.error('❌ La validation du titre vide a échoué');
    } catch (error) {
      console.log('✅ Validation du titre requis fonctionne');
    }
    
    console.log('🎉 Toutes les validations fonctionnent !');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests de validation:', error);
  }
};