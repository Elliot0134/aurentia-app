export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      backup_profiles: {
        Row: {
          created_at: string | null
          credit_limit: string | null
          credits_restants: string | null
          email: string | null
          id: string | null
        }
        Insert: {
          created_at?: string | null
          credit_limit?: string | null
          credits_restants?: string | null
          email?: string | null
          id?: string | null
        }
        Update: {
          created_at?: string | null
          credit_limit?: string | null
          credits_restants?: string | null
          email?: string | null
          id?: string | null
        }
        Relationships: []
      }
      backup_project_summary: {
        Row: {
          created_at: string | null
          project_id: string | null
          statut_project: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          project_id?: string | null
          statut_project?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          project_id?: string | null
          statut_project?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "backup_project_summary_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_summary"
            referencedColumns: ["project_id"]
          },
        ]
      }
      business_model: {
        Row: {
          activites_cles: string | null
          canaux: string | null
          created_at: string
          flux_revenus_analyse: string | null
          flux_revenus_liste_des_revenus: string | null
          partenaires_cles: string | null
          project_id: string
          proposition_valeur: string | null
          relations_clients: string | null
          ressources_financieres: string | null
          ressources_humaines: string | null
          ressources_intellectuelles: string | null
          ressources_materielles: string | null
          segments_clients: string | null
          structure_couts_analyse: string | null
          structure_couts_liste_des_couts: string | null
          user_id: string
        }
        Insert: {
          activites_cles?: string | null
          canaux?: string | null
          created_at?: string
          flux_revenus_analyse?: string | null
          flux_revenus_liste_des_revenus?: string | null
          partenaires_cles?: string | null
          project_id?: string
          proposition_valeur?: string | null
          relations_clients?: string | null
          ressources_financieres?: string | null
          ressources_humaines?: string | null
          ressources_intellectuelles?: string | null
          ressources_materielles?: string | null
          segments_clients?: string | null
          structure_couts_analyse?: string | null
          structure_couts_liste_des_couts?: string | null
          user_id: string
        }
        Update: {
          activites_cles?: string | null
          canaux?: string | null
          created_at?: string
          flux_revenus_analyse?: string | null
          flux_revenus_liste_des_revenus?: string | null
          partenaires_cles?: string | null
          project_id?: string
          proposition_valeur?: string | null
          relations_clients?: string | null
          ressources_financieres?: string | null
          ressources_humaines?: string | null
          ressources_intellectuelles?: string | null
          ressources_materielles?: string | null
          segments_clients?: string | null
          structure_couts_analyse?: string | null
          structure_couts_liste_des_couts?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_model_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "project_summary"
            referencedColumns: ["project_id"]
          },
        ]
      }
      concurrence: {
        Row: {
          avis: string | null
          concurrent_1_caracteristiques: string | null
          concurrent_1_description: string | null
          concurrent_1_faiblesses: string | null
          concurrent_1_forces: string | null
          concurrent_1_nom: string | null
          concurrent_1_url: string | null
          concurrent_10_caracteristiques: string | null
          concurrent_10_description: string | null
          concurrent_10_faiblesses: string | null
          concurrent_10_forces: string | null
          concurrent_10_nom: string | null
          concurrent_10_url: string | null
          concurrent_2_caracteristiques: string | null
          concurrent_2_description: string | null
          concurrent_2_faiblesses: string | null
          concurrent_2_forces: string | null
          concurrent_2_nom: string | null
          concurrent_2_url: string | null
          concurrent_3_caracteristiques: string | null
          concurrent_3_description: string | null
          concurrent_3_faiblesses: string | null
          concurrent_3_forces: string | null
          concurrent_3_nom: string | null
          concurrent_3_url: string | null
          concurrent_4_caracteristiques: string | null
          concurrent_4_description: string | null
          concurrent_4_faiblesses: string | null
          concurrent_4_forces: string | null
          concurrent_4_nom: string | null
          concurrent_4_url: string | null
          concurrent_5_caracteristiques: string | null
          concurrent_5_description: string | null
          concurrent_5_faiblesses: string | null
          concurrent_5_forces: string | null
          concurrent_5_nom: string | null
          concurrent_5_url: string | null
          concurrent_6_caracteristiques: string | null
          concurrent_6_description: string | null
          concurrent_6_faiblesses: string | null
          concurrent_6_forces: string | null
          concurrent_6_nom: string | null
          concurrent_6_url: string | null
          concurrent_7_caracteristiques: string | null
          concurrent_7_description: string | null
          concurrent_7_faiblesses: string | null
          concurrent_7_forces: string | null
          concurrent_7_nom: string | null
          concurrent_7_url: string | null
          concurrent_8_caracteristiques: string | null
          concurrent_8_description: string | null
          concurrent_8_faiblesses: string | null
          concurrent_8_forces: string | null
          concurrent_8_nom: string | null
          concurrent_8_url: string | null
          concurrent_9_caracteristiques: string | null
          concurrent_9_description: string | null
          concurrent_9_faiblesses: string | null
          concurrent_9_forces: string | null
          concurrent_9_nom: string | null
          concurrent_9_url: string | null
          free_critere_differentiation_1: string | null
          free_critere_differentiation_2: string | null
          free_critere_differentiation_3: string | null
          free_direct_definition: string
          free_direct_importance: string | null
          free_indirect_definition: string | null
          free_indirect_importance: string | null
          free_potentiel_definition: string | null
          free_potentiel_importance: string | null
          free_segmentation_concurrentielle: string | null
          justification_avis: string | null
          project_id: string
          recommandations: string | null
          user_id: string
        }
        Insert: {
          avis?: string | null
          concurrent_1_caracteristiques?: string | null
          concurrent_1_description?: string | null
          concurrent_1_faiblesses?: string | null
          concurrent_1_forces?: string | null
          concurrent_1_nom?: string | null
          concurrent_1_url?: string | null
          concurrent_10_caracteristiques?: string | null
          concurrent_10_description?: string | null
          concurrent_10_faiblesses?: string | null
          concurrent_10_forces?: string | null
          concurrent_10_nom?: string | null
          concurrent_10_url?: string | null
          concurrent_2_caracteristiques?: string | null
          concurrent_2_description?: string | null
          concurrent_2_faiblesses?: string | null
          concurrent_2_forces?: string | null
          concurrent_2_nom?: string | null
          concurrent_2_url?: string | null
          concurrent_3_caracteristiques?: string | null
          concurrent_3_description?: string | null
          concurrent_3_faiblesses?: string | null
          concurrent_3_forces?: string | null
          concurrent_3_nom?: string | null
          concurrent_3_url?: string | null
          concurrent_4_caracteristiques?: string | null
          concurrent_4_description?: string | null
          concurrent_4_faiblesses?: string | null
          concurrent_4_forces?: string | null
          concurrent_4_nom?: string | null
          concurrent_4_url?: string | null
          concurrent_5_caracteristiques?: string | null
          concurrent_5_description?: string | null
          concurrent_5_faiblesses?: string | null
          concurrent_5_forces?: string | null
          concurrent_5_nom?: string | null
          concurrent_5_url?: string | null
          concurrent_6_caracteristiques?: string | null
          concurrent_6_description?: string | null
          concurrent_6_faiblesses?: string | null
          concurrent_6_forces?: string | null
          concurrent_6_nom?: string | null
          concurrent_6_url?: string | null
          concurrent_7_caracteristiques?: string | null
          concurrent_7_description?: string | null
          concurrent_7_faiblesses?: string | null
          concurrent_7_forces?: string | null
          concurrent_7_nom?: string | null
          concurrent_7_url?: string | null
          concurrent_8_caracteristiques?: string | null
          concurrent_8_description?: string | null
          concurrent_8_faiblesses?: string | null
          concurrent_8_forces?: string | null
          concurrent_8_nom?: string | null
          concurrent_8_url?: string | null
          concurrent_9_caracteristiques?: string | null
          concurrent_9_description?: string | null
          concurrent_9_faiblesses?: string | null
          concurrent_9_forces?: string | null
          concurrent_9_nom?: string | null
          concurrent_9_url?: string | null
          free_critere_differentiation_1?: string | null
          free_critere_differentiation_2?: string | null
          free_critere_differentiation_3?: string | null
          free_direct_definition: string
          free_direct_importance?: string | null
          free_indirect_definition?: string | null
          free_indirect_importance?: string | null
          free_potentiel_definition?: string | null
          free_potentiel_importance?: string | null
          free_segmentation_concurrentielle?: string | null
          justification_avis?: string | null
          project_id: string
          recommandations?: string | null
          user_id?: string
        }
        Update: {
          avis?: string | null
          concurrent_1_caracteristiques?: string | null
          concurrent_1_description?: string | null
          concurrent_1_faiblesses?: string | null
          concurrent_1_forces?: string | null
          concurrent_1_nom?: string | null
          concurrent_1_url?: string | null
          concurrent_10_caracteristiques?: string | null
          concurrent_10_description?: string | null
          concurrent_10_faiblesses?: string | null
          concurrent_10_forces?: string | null
          concurrent_10_nom?: string | null
          concurrent_10_url?: string | null
          concurrent_2_caracteristiques?: string | null
          concurrent_2_description?: string | null
          concurrent_2_faiblesses?: string | null
          concurrent_2_forces?: string | null
          concurrent_2_nom?: string | null
          concurrent_2_url?: string | null
          concurrent_3_caracteristiques?: string | null
          concurrent_3_description?: string | null
          concurrent_3_faiblesses?: string | null
          concurrent_3_forces?: string | null
          concurrent_3_nom?: string | null
          concurrent_3_url?: string | null
          concurrent_4_caracteristiques?: string | null
          concurrent_4_description?: string | null
          concurrent_4_faiblesses?: string | null
          concurrent_4_forces?: string | null
          concurrent_4_nom?: string | null
          concurrent_4_url?: string | null
          concurrent_5_caracteristiques?: string | null
          concurrent_5_description?: string | null
          concurrent_5_faiblesses?: string | null
          concurrent_5_forces?: string | null
          concurrent_5_nom?: string | null
          concurrent_5_url?: string | null
          concurrent_6_caracteristiques?: string | null
          concurrent_6_description?: string | null
          concurrent_6_faiblesses?: string | null
          concurrent_6_forces?: string | null
          concurrent_6_nom?: string | null
          concurrent_6_url?: string | null
          concurrent_7_caracteristiques?: string | null
          concurrent_7_description?: string | null
          concurrent_7_faiblesses?: string | null
          concurrent_7_forces?: string | null
          concurrent_7_nom?: string | null
          concurrent_7_url?: string | null
          concurrent_8_caracteristiques?: string | null
          concurrent_8_description?: string | null
          concurrent_8_faiblesses?: string | null
          concurrent_8_forces?: string | null
          concurrent_8_nom?: string | null
          concurrent_8_url?: string | null
          concurrent_9_caracteristiques?: string | null
          concurrent_9_description?: string | null
          concurrent_9_faiblesses?: string | null
          concurrent_9_forces?: string | null
          concurrent_9_nom?: string | null
          concurrent_9_url?: string | null
          free_critere_differentiation_1?: string | null
          free_critere_differentiation_2?: string | null
          free_critere_differentiation_3?: string | null
          free_direct_definition?: string
          free_direct_importance?: string | null
          free_indirect_definition?: string | null
          free_indirect_importance?: string | null
          free_potentiel_definition?: string | null
          free_potentiel_importance?: string | null
          free_segmentation_concurrentielle?: string | null
          justification_avis?: string | null
          project_id?: string
          recommandations?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "concurrence_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "project_summary"
            referencedColumns: ["project_id"]
          },
        ]
      }
      conversation: {
        Row: {
          created_at: string
          id: string
          project_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_summary"
            referencedColumns: ["project_id"]
          },
        ]
      }
      form_business_idea: {
        Row: {
          clients_type: string | null
          created_at: string
          equipe_fondatrice: string | null
          localisation: string | null
          motivations_entrepreneur: string | null
          moyens_minimum: string | null
          nom_projet: string | null
          other_infos: string | null
          produit_service: string | null
          project_id: string
          project_sentence: string | null
          reponse_besoin: string | null
          type_projet: string | null
          user_id: string
        }
        Insert: {
          clients_type?: string | null
          created_at?: string
          equipe_fondatrice?: string | null
          localisation?: string | null
          motivations_entrepreneur?: string | null
          moyens_minimum?: string | null
          nom_projet?: string | null
          other_infos?: string | null
          produit_service?: string | null
          project_id?: string
          project_sentence?: string | null
          reponse_besoin?: string | null
          type_projet?: string | null
          user_id: string
        }
        Update: {
          clients_type?: string | null
          created_at?: string
          equipe_fondatrice?: string | null
          localisation?: string | null
          motivations_entrepreneur?: string | null
          moyens_minimum?: string | null
          nom_projet?: string | null
          other_infos?: string | null
          produit_service?: string | null
          project_id?: string
          project_sentence?: string | null
          reponse_besoin?: string | null
          type_projet?: string | null
          user_id?: string
        }
        Relationships: []
      }
      juridique: {
        Row: {
          avis: string | null
          created_at: string
          justification_avis: string | null
          project_id: string
          recommandations: string | null
          structure: Json | null
          user_id: string | null
        }
        Insert: {
          avis?: string | null
          created_at?: string
          justification_avis?: string | null
          project_id?: string
          recommandations?: string | null
          structure?: Json | null
          user_id?: string | null
        }
        Update: {
          avis?: string | null
          created_at?: string
          justification_avis?: string | null
          project_id?: string
          recommandations?: string | null
          structure?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "juridique_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "project_summary"
            referencedColumns: ["project_id"]
          },
        ]
      }
      kanban_card: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          priority: string
          project_id: string
          status: string
          tags: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          priority: string
          project_id: string
          status: string
          tags?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          priority?: string
          project_id?: string
          status?: string
          tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_card_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_summary"
            referencedColumns: ["project_id"]
          },
        ]
      }
      kanban_comment: {
        Row: {
          author: string
          card_id: string
          comment: string
          created_at: string
          id: string
        }
        Insert: {
          author: string
          card_id: string
          comment: string
          created_at?: string
          id?: string
        }
        Update: {
          author?: string
          card_id?: string
          comment?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_comment_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "kanban_card"
            referencedColumns: ["id"]
          },
        ]
      }
      marche: {
        Row: {
          avis: string | null
          created_at: string
          free_3_enjeux_principaux: string | null
          free_classification: string | null
          free_description_du_marche: string | null
          free_details_difficulte_a_l_entree: string | null
          free_difficulte_a_l_entree: string | null
          free_evolution_du_marche: string | null
          free_justification_concise: string | null
          free_marche: string | null
          free_marche_viable: string | null
          free_marches_annexe: string | null
          free_predictions: string | null
          justification_avis: string | null
          pay_attenuation_menace_1_menace_associee: string | null
          pay_attenuation_menace_1_priorite: string | null
          pay_attenuation_menace_1_recommandation: string | null
          pay_attenuation_menace_2_menace_associee: string | null
          pay_attenuation_menace_2_priorite: string | null
          pay_attenuation_menace_2_recommandation: string | null
          pay_attenuation_menace_3_menace_associee: string | null
          pay_attenuation_menace_3_priorite: string | null
          pay_attenuation_menace_3_recommandation: string | null
          pay_ca_an_deux: string | null
          pay_ca_an_trois: string | null
          pay_ca_an_un: string | null
          pay_economique_menace_1_description: string | null
          pay_economique_menace_1_impact_potentiel: string | null
          pay_economique_menace_1_source: string | null
          pay_economique_menace_1_url: string | null
          pay_economique_menace_2_description: string | null
          pay_economique_menace_2_impact_potentiel: string | null
          pay_economique_menace_2_source: string | null
          pay_economique_menace_2_url: string | null
          pay_economique_menace_3_description: string | null
          pay_economique_menace_3_impact_potentiel: string | null
          pay_economique_menace_3_source: string | null
          pay_economique_menace_3_url: string | null
          pay_economique_opportunite_1_description: string | null
          pay_economique_opportunite_1_impact_potentiel: string | null
          pay_economique_opportunite_1_source: string | null
          pay_economique_opportunite_1_url: string | null
          pay_economique_opportunite_2_description: string | null
          pay_economique_opportunite_2_impact_potentiel: string | null
          pay_economique_opportunite_2_source: string | null
          pay_economique_opportunite_2_url: string | null
          pay_economique_opportunite_3_description: string | null
          pay_economique_opportunite_3_impact_potentiel: string | null
          pay_economique_opportunite_3_source: string | null
          pay_economique_opportunite_3_url: string | null
          pay_exploitation_opportunite_1_opportunite_associee: string | null
          pay_exploitation_opportunite_1_priorite: string | null
          pay_exploitation_opportunite_1_recommandation: string | null
          pay_exploitation_opportunite_2_opportunite_associee: string | null
          pay_exploitation_opportunite_2_priorite: string | null
          pay_exploitation_opportunite_2_recommandation: string | null
          pay_exploitation_opportunite_3_opportunite_associee: string | null
          pay_exploitation_opportunite_3_priorite: string | null
          pay_exploitation_opportunite_3_recommandation: string | null
          pay_facteurs_influence: string | null
          pay_justification_projections: string | null
          pay_segment_1_ca_potentiel: string | null
          pay_segment_1_caracteristiques: string | null
          pay_segment_1_frequence_achat: string | null
          pay_segment_1_nom: string | null
          pay_segment_1_panier_moyen: string | null
          pay_segment_1_taille_volume: string | null
          pay_segment_2_ca_potentiel: string | null
          pay_segment_2_caracteristiques: string | null
          pay_segment_2_frequence_achat: string | null
          pay_segment_2_nom: string | null
          pay_segment_2_panier_moyen: string | null
          pay_segment_2_taille_volume: string | null
          pay_segment_3_ca_potentiel: string | null
          pay_segment_3_caracteristiques: string | null
          pay_segment_3_frequence_achat: string | null
          pay_segment_3_nom: string | null
          pay_segment_3_panier_moyen: string | null
          pay_segment_3_taille_volume: string | null
          pay_sociodemographique_menace_1_description: string | null
          pay_sociodemographique_menace_1_impact_potentiel: string | null
          pay_sociodemographique_menace_1_source: string | null
          pay_sociodemographique_menace_1_url: string | null
          pay_sociodemographique_menace_2_description: string | null
          pay_sociodemographique_menace_2_impact_potentiel: string | null
          pay_sociodemographique_menace_2_source: string | null
          pay_sociodemographique_menace_2_url: string | null
          pay_sociodemographique_menace_3_description: string | null
          pay_sociodemographique_menace_3_impact_potentiel: string | null
          pay_sociodemographique_menace_3_source: string | null
          pay_sociodemographique_menace_3_url: string | null
          pay_sociodemographique_opportunite_1_description: string | null
          pay_sociodemographique_opportunite_1_impact_potentiel: string | null
          pay_sociodemographique_opportunite_1_source: string | null
          pay_sociodemographique_opportunite_1_url: string | null
          pay_sociodemographique_opportunite_2_description: string | null
          pay_sociodemographique_opportunite_2_impact_potentiel: string | null
          pay_sociodemographique_opportunite_2_source: string | null
          pay_sociodemographique_opportunite_2_url: string | null
          pay_sociodemographique_opportunite_3_description: string | null
          pay_sociodemographique_opportunite_3_impact_potentiel: string | null
          pay_sociodemographique_opportunite_3_source: string | null
          pay_sociodemographique_opportunite_3_url: string | null
          pay_synthese_demande: string | null
          pay_technologique_menace_1_description: string | null
          pay_technologique_menace_1_impact_potentiel: string | null
          pay_technologique_menace_1_source: string | null
          pay_technologique_menace_1_url: string | null
          pay_technologique_menace_2_description: string | null
          pay_technologique_menace_2_impact_potentiel: string | null
          pay_technologique_menace_2_source: string | null
          pay_technologique_menace_2_url: string | null
          pay_technologique_menace_3_description: string | null
          pay_technologique_menace_3_impact_potentiel: string | null
          pay_technologique_menace_3_source: string | null
          pay_technologique_menace_3_url: string | null
          pay_technologique_opportunite_1_description: string | null
          pay_technologique_opportunite_1_impact_potentiel: string | null
          pay_technologique_opportunite_1_source: string | null
          pay_technologique_opportunite_1_url: string | null
          pay_technologique_opportunite_2_description: string | null
          pay_technologique_opportunite_2_impact_potentiel: string | null
          pay_technologique_opportunite_2_source: string | null
          pay_technologique_opportunite_2_url: string | null
          pay_technologique_opportunite_3_description: string | null
          pay_technologique_opportunite_3_impact_potentiel: string | null
          pay_technologique_opportunite_3_source: string | null
          pay_technologique_opportunite_3_url: string | null
          pay_vue_d_ensemble: string | null
          project_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avis?: string | null
          created_at?: string
          free_3_enjeux_principaux?: string | null
          free_classification?: string | null
          free_description_du_marche?: string | null
          free_details_difficulte_a_l_entree?: string | null
          free_difficulte_a_l_entree?: string | null
          free_evolution_du_marche?: string | null
          free_justification_concise?: string | null
          free_marche?: string | null
          free_marche_viable?: string | null
          free_marches_annexe?: string | null
          free_predictions?: string | null
          justification_avis?: string | null
          pay_attenuation_menace_1_menace_associee?: string | null
          pay_attenuation_menace_1_priorite?: string | null
          pay_attenuation_menace_1_recommandation?: string | null
          pay_attenuation_menace_2_menace_associee?: string | null
          pay_attenuation_menace_2_priorite?: string | null
          pay_attenuation_menace_2_recommandation?: string | null
          pay_attenuation_menace_3_menace_associee?: string | null
          pay_attenuation_menace_3_priorite?: string | null
          pay_attenuation_menace_3_recommandation?: string | null
          pay_ca_an_deux?: string | null
          pay_ca_an_trois?: string | null
          pay_ca_an_un?: string | null
          pay_economique_menace_1_description?: string | null
          pay_economique_menace_1_impact_potentiel?: string | null
          pay_economique_menace_1_source?: string | null
          pay_economique_menace_1_url?: string | null
          pay_economique_menace_2_description?: string | null
          pay_economique_menace_2_impact_potentiel?: string | null
          pay_economique_menace_2_source?: string | null
          pay_economique_menace_2_url?: string | null
          pay_economique_menace_3_description?: string | null
          pay_economique_menace_3_impact_potentiel?: string | null
          pay_economique_menace_3_source?: string | null
          pay_economique_menace_3_url?: string | null
          pay_economique_opportunite_1_description?: string | null
          pay_economique_opportunite_1_impact_potentiel?: string | null
          pay_economique_opportunite_1_source?: string | null
          pay_economique_opportunite_1_url?: string | null
          pay_economique_opportunite_2_description?: string | null
          pay_economique_opportunite_2_impact_potentiel?: string | null
          pay_economique_opportunite_2_source?: string | null
          pay_economique_opportunite_2_url?: string | null
          pay_economique_opportunite_3_description?: string | null
          pay_economique_opportunite_3_impact_potentiel?: string | null
          pay_economique_opportunite_3_source?: string | null
          pay_economique_opportunite_3_url?: string | null
          pay_exploitation_opportunite_1_opportunite_associee?: string | null
          pay_exploitation_opportunite_1_priorite?: string | null
          pay_exploitation_opportunite_1_recommandation?: string | null
          pay_exploitation_opportunite_2_opportunite_associee?: string | null
          pay_exploitation_opportunite_2_priorite?: string | null
          pay_exploitation_opportunite_2_recommandation?: string | null
          pay_exploitation_opportunite_3_opportunite_associee?: string | null
          pay_exploitation_opportunite_3_priorite?: string | null
          pay_exploitation_opportunite_3_recommandation?: string | null
          pay_facteurs_influence?: string | null
          pay_justification_projections?: string | null
          pay_segment_1_ca_potentiel?: string | null
          pay_segment_1_caracteristiques?: string | null
          pay_segment_1_frequence_achat?: string | null
          pay_segment_1_nom?: string | null
          pay_segment_1_panier_moyen?: string | null
          pay_segment_1_taille_volume?: string | null
          pay_segment_2_ca_potentiel?: string | null
          pay_segment_2_caracteristiques?: string | null
          pay_segment_2_frequence_achat?: string | null
          pay_segment_2_nom?: string | null
          pay_segment_2_panier_moyen?: string | null
          pay_segment_2_taille_volume?: string | null
          pay_segment_3_ca_potentiel?: string | null
          pay_segment_3_caracteristiques?: string | null
          pay_segment_3_frequence_achat?: string | null
          pay_segment_3_nom?: string | null
          pay_segment_3_panier_moyen?: string | null
          pay_segment_3_taille_volume?: string | null
          pay_sociodemographique_menace_1_description?: string | null
          pay_sociodemographique_menace_1_impact_potentiel?: string | null
          pay_sociodemographique_menace_1_source?: string | null
          pay_sociodemographique_menace_1_url?: string | null
          pay_sociodemographique_menace_2_description?: string | null
          pay_sociodemographique_menace_2_impact_potentiel?: string | null
          pay_sociodemographique_menace_2_source?: string | null
          pay_sociodemographique_menace_2_url?: string | null
          pay_sociodemographique_menace_3_description?: string | null
          pay_sociodemographique_menace_3_impact_potentiel?: string | null
          pay_sociodemographique_menace_3_source?: string | null
          pay_sociodemographique_menace_3_url?: string | null
          pay_sociodemographique_opportunite_1_description?: string | null
          pay_sociodemographique_opportunite_1_impact_potentiel?: string | null
          pay_sociodemographique_opportunite_1_source?: string | null
          pay_sociodemographique_opportunite_1_url?: string | null
          pay_sociodemographique_opportunite_2_description?: string | null
          pay_sociodemographique_opportunite_2_impact_potentiel?: string | null
          pay_sociodemographique_opportunite_2_source?: string | null
          pay_sociodemographique_opportunite_2_url?: string | null
          pay_sociodemographique_opportunite_3_description?: string | null
          pay_sociodemographique_opportunite_3_impact_potentiel?: string | null
          pay_sociodemographique_opportunite_3_source?: string | null
          pay_sociodemographique_opportunite_3_url?: string | null
          pay_synthese_demande?: string | null
          pay_technologique_menace_1_description?: string | null
          pay_technologique_menace_1_impact_potentiel?: string | null
          pay_technologique_menace_1_source?: string | null
          pay_technologique_menace_1_url?: string | null
          pay_technologique_menace_2_description?: string | null
          pay_technologique_menace_2_impact_potentiel?: string | null
          pay_technologique_menace_2_source?: string | null
          pay_technologique_menace_2_url?: string | null
          pay_technologique_menace_3_description?: string | null
          pay_technologique_menace_3_impact_potentiel?: string | null
          pay_technologique_menace_3_source?: string | null
          pay_technologique_menace_3_url?: string | null
          pay_technologique_opportunite_1_description?: string | null
          pay_technologique_opportunite_1_impact_potentiel?: string | null
          pay_technologique_opportunite_1_source?: string | null
          pay_technologique_opportunite_1_url?: string | null
          pay_technologique_opportunite_2_description?: string | null
          pay_technologique_opportunite_2_impact_potentiel?: string | null
          pay_technologique_opportunite_2_source?: string | null
          pay_technologique_opportunite_2_url?: string | null
          pay_technologique_opportunite_3_description?: string | null
          pay_technologique_opportunite_3_impact_potentiel?: string | null
          pay_technologique_opportunite_3_source?: string | null
          pay_technologique_opportunite_3_url?: string | null
          pay_vue_d_ensemble?: string | null
          project_id: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          avis?: string | null
          created_at?: string
          free_3_enjeux_principaux?: string | null
          free_classification?: string | null
          free_description_du_marche?: string | null
          free_details_difficulte_a_l_entree?: string | null
          free_difficulte_a_l_entree?: string | null
          free_evolution_du_marche?: string | null
          free_justification_concise?: string | null
          free_marche?: string | null
          free_marche_viable?: string | null
          free_marches_annexe?: string | null
          free_predictions?: string | null
          justification_avis?: string | null
          pay_attenuation_menace_1_menace_associee?: string | null
          pay_attenuation_menace_1_priorite?: string | null
          pay_attenuation_menace_1_recommandation?: string | null
          pay_attenuation_menace_2_menace_associee?: string | null
          pay_attenuation_menace_2_priorite?: string | null
          pay_attenuation_menace_2_recommandation?: string | null
          pay_attenuation_menace_3_menace_associee?: string | null
          pay_attenuation_menace_3_priorite?: string | null
          pay_attenuation_menace_3_recommandation?: string | null
          pay_ca_an_deux?: string | null
          pay_ca_an_trois?: string | null
          pay_ca_an_un?: string | null
          pay_economique_menace_1_description?: string | null
          pay_economique_menace_1_impact_potentiel?: string | null
          pay_economique_menace_1_source?: string | null
          pay_economique_menace_1_url?: string | null
          pay_economique_menace_2_description?: string | null
          pay_economique_menace_2_impact_potentiel?: string | null
          pay_economique_menace_2_source?: string | null
          pay_economique_menace_2_url?: string | null
          pay_economique_menace_3_description?: string | null
          pay_economique_menace_3_impact_potentiel?: string | null
          pay_economique_menace_3_source?: string | null
          pay_economique_menace_3_url?: string | null
          pay_economique_opportunite_1_description?: string | null
          pay_economique_opportunite_1_impact_potentiel?: string | null
          pay_economique_opportunite_1_source?: string | null
          pay_economique_opportunite_1_url?: string | null
          pay_economique_opportunite_2_description?: string | null
          pay_economique_opportunite_2_impact_potentiel?: string | null
          pay_economique_opportunite_2_source?: string | null
          pay_economique_opportunite_2_url?: string | null
          pay_economique_opportunite_3_description?: string | null
          pay_economique_opportunite_3_impact_potentiel?: string | null
          pay_economique_opportunite_3_source?: string | null
          pay_economique_opportunite_3_url?: string | null
          pay_exploitation_opportunite_1_opportunite_associee?: string | null
          pay_exploitation_opportunite_1_priorite?: string | null
          pay_exploitation_opportunite_1_recommandation?: string | null
          pay_exploitation_opportunite_2_opportunite_associee?: string | null
          pay_exploitation_opportunite_2_priorite?: string | null
          pay_exploitation_opportunite_2_recommandation?: string | null
          pay_exploitation_opportunite_3_opportunite_associee?: string | null
          pay_exploitation_opportunite_3_priorite?: string | null
          pay_exploitation_opportunite_3_recommandation?: string | null
          pay_facteurs_influence?: string | null
          pay_justification_projections?: string | null
          pay_segment_1_ca_potentiel?: string | null
          pay_segment_1_caracteristiques?: string | null
          pay_segment_1_frequence_achat?: string | null
          pay_segment_1_nom?: string | null
          pay_segment_1_panier_moyen?: string | null
          pay_segment_1_taille_volume?: string | null
          pay_segment_2_ca_potentiel?: string | null
          pay_segment_2_caracteristiques?: string | null
          pay_segment_2_frequence_achat?: string | null
          pay_segment_2_nom?: string | null
          pay_segment_2_panier_moyen?: string | null
          pay_segment_2_taille_volume?: string | null
          pay_segment_3_ca_potentiel?: string | null
          pay_segment_3_caracteristiques?: string | null
          pay_segment_3_frequence_achat?: string | null
          pay_segment_3_nom?: string | null
          pay_segment_3_panier_moyen?: string | null
          pay_segment_3_taille_volume?: string | null
          pay_sociodemographique_menace_1_description?: string | null
          pay_sociodemographique_menace_1_impact_potentiel?: string | null
          pay_sociodemographique_menace_1_source?: string | null
          pay_sociodemographique_menace_1_url?: string | null
          pay_sociodemographique_menace_2_description?: string | null
          pay_sociodemographique_menace_2_impact_potentiel?: string | null
          pay_sociodemographique_menace_2_source?: string | null
          pay_sociodemographique_menace_2_url?: string | null
          pay_sociodemographique_menace_3_description?: string | null
          pay_sociodemographique_menace_3_impact_potentiel?: string | null
          pay_sociodemographique_menace_3_source?: string | null
          pay_sociodemographique_menace_3_url?: string | null
          pay_sociodemographique_opportunite_1_description?: string | null
          pay_sociodemographique_opportunite_1_impact_potentiel?: string | null
          pay_sociodemographique_opportunite_1_source?: string | null
          pay_sociodemographique_opportunite_1_url?: string | null
          pay_sociodemographique_opportunite_2_description?: string | null
          pay_sociodemographique_opportunite_2_impact_potentiel?: string | null
          pay_sociodemographique_opportunite_2_source?: string | null
          pay_sociodemographique_opportunite_2_url?: string | null
          pay_sociodemographique_opportunite_3_description?: string | null
          pay_sociodemographique_opportunite_3_impact_potentiel?: string | null
          pay_sociodemographique_opportunite_3_source?: string | null
          pay_sociodemographique_opportunite_3_url?: string | null
          pay_synthese_demande?: string | null
          pay_technologique_menace_1_description?: string | null
          pay_technologique_menace_1_impact_potentiel?: string | null
          pay_technologique_menace_1_source?: string | null
          pay_technologique_menace_1_url?: string | null
          pay_technologique_menace_2_description?: string | null
          pay_technologique_menace_2_impact_potentiel?: string | null
          pay_technologique_menace_2_source?: string | null
          pay_technologique_menace_2_url?: string | null
          pay_technologique_menace_3_description?: string | null
          pay_technologique_menace_3_impact_potentiel?: string | null
          pay_technologique_menace_3_source?: string | null
          pay_technologique_menace_3_url?: string | null
          pay_technologique_opportunite_1_description?: string | null
          pay_technologique_opportunite_1_impact_potentiel?: string | null
          pay_technologique_opportunite_1_source?: string | null
          pay_technologique_opportunite_1_url?: string | null
          pay_technologique_opportunite_2_description?: string | null
          pay_technologique_opportunite_2_impact_potentiel?: string | null
          pay_technologique_opportunite_2_source?: string | null
          pay_technologique_opportunite_2_url?: string | null
          pay_technologique_opportunite_3_description?: string | null
          pay_technologique_opportunite_3_impact_potentiel?: string | null
          pay_technologique_opportunite_3_source?: string | null
          pay_technologique_opportunite_3_url?: string | null
          pay_vue_d_ensemble?: string | null
          project_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marche_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "project_summary"
            referencedColumns: ["project_id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          project_id: string | null
          sender: string
          user_id: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          project_id?: string | null
          sender: string
          user_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          project_id?: string | null
          sender?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_summary"
            referencedColumns: ["project_id"]
          },
        ]
      }
      mini_swot: {
        Row: {
          avis: string | null
          created_at: string
          economique_menace_1: string | null
          economique_menace_2: string | null
          economique_opportunite_1: string | null
          economique_opportunite_2: string | null
          faiblesse_1: string | null
          faiblesse_2: string | null
          faiblesse_3: string | null
          faiblesse_4: string | null
          force_1: string | null
          force_2: string | null
          force_3: string | null
          force_4: string | null
          justification_avis: string | null
          project_id: string
          recommandations: string | null
          socio_menace_1: string | null
          socio_menace_2: string | null
          socio_opportunite_1: string | null
          socio_opportunite_2: string | null
          user_id: string
        }
        Insert: {
          avis?: string | null
          created_at?: string
          economique_menace_1?: string | null
          economique_menace_2?: string | null
          economique_opportunite_1?: string | null
          economique_opportunite_2?: string | null
          faiblesse_1?: string | null
          faiblesse_2?: string | null
          faiblesse_3?: string | null
          faiblesse_4?: string | null
          force_1?: string | null
          force_2?: string | null
          force_3?: string | null
          force_4?: string | null
          justification_avis?: string | null
          project_id: string
          recommandations?: string | null
          socio_menace_1?: string | null
          socio_menace_2?: string | null
          socio_opportunite_1?: string | null
          socio_opportunite_2?: string | null
          user_id: string
        }
        Update: {
          avis?: string | null
          created_at?: string
          economique_menace_1?: string | null
          economique_menace_2?: string | null
          economique_opportunite_1?: string | null
          economique_opportunite_2?: string | null
          faiblesse_1?: string | null
          faiblesse_2?: string | null
          faiblesse_3?: string | null
          faiblesse_4?: string | null
          force_1?: string | null
          force_2?: string | null
          force_3?: string | null
          force_4?: string | null
          justification_avis?: string | null
          project_id?: string
          recommandations?: string | null
          socio_menace_1?: string | null
          socio_menace_2?: string | null
          socio_opportunite_1?: string | null
          socio_opportunite_2?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mini_swot_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "project_summary"
            referencedColumns: ["project_id"]
          },
        ]
      }
      payment_intents: {
        Row: {
          amount: number | null
          completed_at: string | null
          created_at: string | null
          currency: string | null
          id: string
          payment_intent_id: string
          project_id: string
          status: string
          stripe_payment_intent_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_intent_id: string
          project_id: string
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_intent_id?: string
          project_id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      persona_express_b2b: {
        Row: {
          contexte_organisationnel: string | null
          created_at: string
          enjeux_business: string | null
          identite_professionnelle: string | null
          objections_courantes: string | null
          processus_decision: string | null
          project_id: string
          recherche_information: string | null
          recommandations_b2b: string | null
          responsabilites_cles: string | null
          strategie_approche: string | null
          user_id: string
        }
        Insert: {
          contexte_organisationnel?: string | null
          created_at?: string
          enjeux_business?: string | null
          identite_professionnelle?: string | null
          objections_courantes?: string | null
          processus_decision?: string | null
          project_id: string
          recherche_information?: string | null
          recommandations_b2b?: string | null
          responsabilites_cles?: string | null
          strategie_approche?: string | null
          user_id: string
        }
        Update: {
          contexte_organisationnel?: string | null
          created_at?: string
          enjeux_business?: string | null
          identite_professionnelle?: string | null
          objections_courantes?: string | null
          processus_decision?: string | null
          project_id?: string
          recherche_information?: string | null
          recommandations_b2b?: string | null
          responsabilites_cles?: string | null
          strategie_approche?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "persona_express_b2b_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "project_summary"
            referencedColumns: ["project_id"]
          },
        ]
      }
      persona_express_b2c: {
        Row: {
          approche_vente: string | null
          avis: string | null
          comportement_achat: string | null
          contexte_personnel: string | null
          created_at: string
          defis_frustrations: string | null
          identite: string | null
          justification_avis: string | null
          motivations_valeurs: string | null
          presence_digitale: string | null
          project_id: string
          recommandations: string | null
          recommandations_b2c: string | null
          strategies_marketing: string | null
          user_id: string
        }
        Insert: {
          approche_vente?: string | null
          avis?: string | null
          comportement_achat?: string | null
          contexte_personnel?: string | null
          created_at?: string
          defis_frustrations?: string | null
          identite?: string | null
          justification_avis?: string | null
          motivations_valeurs?: string | null
          presence_digitale?: string | null
          project_id: string
          recommandations?: string | null
          recommandations_b2c?: string | null
          strategies_marketing?: string | null
          user_id: string
        }
        Update: {
          approche_vente?: string | null
          avis?: string | null
          comportement_achat?: string | null
          contexte_personnel?: string | null
          created_at?: string
          defis_frustrations?: string | null
          identite?: string | null
          justification_avis?: string | null
          motivations_valeurs?: string | null
          presence_digitale?: string | null
          project_id?: string
          recommandations?: string | null
          recommandations_b2c?: string | null
          strategies_marketing?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "persona_express_b2c_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "project_summary"
            referencedColumns: ["project_id"]
          },
        ]
      }
      persona_express_organismes: {
        Row: {
          contexte_organisationnel: string | null
          contraintes_budgetaires: string | null
          created_at: string
          enjeux_prioritaires: string | null
          identite_institutionnelle: string | null
          mission_responsabilites: string | null
          processus_decision: string | null
          project_id: string
          recommandations_organisme: string | null
          strategie_approche: string | null
          user_id: string
          valeurs_attentes: string | null
        }
        Insert: {
          contexte_organisationnel?: string | null
          contraintes_budgetaires?: string | null
          created_at?: string
          enjeux_prioritaires?: string | null
          identite_institutionnelle?: string | null
          mission_responsabilites?: string | null
          processus_decision?: string | null
          project_id: string
          recommandations_organisme?: string | null
          strategie_approche?: string | null
          user_id: string
          valeurs_attentes?: string | null
        }
        Update: {
          contexte_organisationnel?: string | null
          contraintes_budgetaires?: string | null
          created_at?: string
          enjeux_prioritaires?: string | null
          identite_institutionnelle?: string | null
          mission_responsabilites?: string | null
          processus_decision?: string | null
          project_id?: string
          recommandations_organisme?: string | null
          strategie_approche?: string | null
          user_id?: string
          valeurs_attentes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "persona_express_organismes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "project_summary"
            referencedColumns: ["project_id"]
          },
        ]
      }
      pitch: {
        Row: {
          avis: string | null
          created_at: string
          pitch_30_secondes_appel_action: string | null
          pitch_30_secondes_texte: string | null
          pitch_complet_appel_action: string | null
          pitch_complet_texte: string | null
          pitch_court_appel_action: string | null
          pitch_court_texte: string | null
          project_id: string
          user_id: string
        }
        Insert: {
          avis?: string | null
          created_at?: string
          pitch_30_secondes_appel_action?: string | null
          pitch_30_secondes_texte?: string | null
          pitch_complet_appel_action?: string | null
          pitch_complet_texte?: string | null
          pitch_court_appel_action?: string | null
          pitch_court_texte?: string | null
          project_id: string
          user_id: string
        }
        Update: {
          avis?: string | null
          created_at?: string
          pitch_30_secondes_appel_action?: string | null
          pitch_30_secondes_texte?: string | null
          pitch_complet_appel_action?: string | null
          pitch_complet_texte?: string | null
          pitch_court_appel_action?: string | null
          pitch_court_texte?: string | null
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Pitch_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "project_summary"
            referencedColumns: ["project_id"]
          },
        ]
      }
      beta: {
        Row: {
          id: string
          email: string
          created_at: string | null
        }
        Insert: {
          id?: string
          email: string
          created_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          created_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          abonnement: string | null
          avatar_url: string | null
          bio: string | null
          cohort_year: number | null
          company: string | null
          conv_limit: string | null
          created_at: string | null
          credit_limit: string | null
          drive_folder_id: string | null
          drive_folder_rag: string | null
          drive_folder_url: string | null
          email: string | null
          email_confirmed_at: string | null
          email_confirmation_required: boolean | null
          first_name: string | null
          has_beta_access: boolean | null
          id: string
          invitation_code_used: string | null
          is_member: boolean | null
          job_title: string | null
          last_credit_reset: string
          last_name: string | null
          linkedin_url: string | null
          location: string | null
          monthly_credits_limit: number
          monthly_credits_remaining: number
          nb_projects: string | null
          onboarding_completed: boolean | null
          onboarding_data: Json | null
          organization_setup_dismissed: boolean | null
          organization_setup_pending: boolean | null
          phone: string | null
          preferred_language: string | null
          program_type: string | null
          purchased_credits_remaining: number
          availability_schedule: Json | null
          stripe_customer_id: string | null
          subscription_status: string | null
          theme_preference: string | null
          training_budget: number | null
          user_role: string | null
          user_type: string | null
          website: string | null
        }
        Insert: {
          abonnement?: string | null
          avatar_url?: string | null
          bio?: string | null
          cohort_year?: number | null
          company?: string | null
          conv_limit?: string | null
          created_at?: string | null
          credit_limit?: string | null
          drive_folder_id?: string | null
          drive_folder_rag?: string | null
          drive_folder_url?: string | null
          email?: string | null
          email_confirmed_at?: string | null
          email_confirmation_required?: boolean | null
          first_name?: string | null
          has_beta_access?: boolean | null
          id: string
          invitation_code_used?: string | null
          is_member?: boolean | null
          job_title?: string | null
          last_credit_reset?: string
          last_name?: string | null
          linkedin_url?: string | null
          location?: string | null
          monthly_credits_limit?: number
          monthly_credits_remaining?: number
          nb_projects?: string | null
          onboarding_completed?: boolean | null
          onboarding_data?: Json | null
          organization_setup_dismissed?: boolean | null
          organization_setup_pending?: boolean | null
          phone?: string | null
          preferred_language?: string | null
          program_type?: string | null
          purchased_credits_remaining?: number
          availability_schedule?: Json | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          theme_preference?: string | null
          training_budget?: number | null
          user_role?: string | null
          user_type?: string | null
          website?: string | null
        }
        Update: {
          abonnement?: string | null
          avatar_url?: string | null
          bio?: string | null
          cohort_year?: number | null
          company?: string | null
          conv_limit?: string | null
          created_at?: string | null
          credit_limit?: string | null
          drive_folder_id?: string | null
          drive_folder_rag?: string | null
          drive_folder_url?: string | null
          email?: string | null
          email_confirmed_at?: string | null
          email_confirmation_required?: boolean | null
          first_name?: string | null
          has_beta_access?: boolean | null
          id?: string
          invitation_code_used?: string | null
          is_member?: boolean | null
          job_title?: string | null
          last_credit_reset?: string
          last_name?: string | null
          linkedin_url?: string | null
          location?: string | null
          monthly_credits_limit?: number
          monthly_credits_remaining?: number
          nb_projects?: string | null
          onboarding_completed?: boolean | null
          onboarding_data?: Json | null
          organization_setup_dismissed?: boolean | null
          organization_setup_pending?: boolean | null
          phone?: string | null
          preferred_language?: string | null
          program_type?: string | null
          purchased_credits_remaining?: number
          availability_schedule?: Json | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          theme_preference?: string | null
          training_budget?: number | null
          user_role?: string | null
          user_type?: string | null
          website?: string | null
        }
        Relationships: []
      }
      project_collaborators: {
        Row: {
          accepted_at: string
          id: string
          invited_at: string
          invited_by: string
          project_id: string
          role: string
          status: string
          user_id: string
        }
        Insert: {
          accepted_at?: string
          id?: string
          invited_at?: string
          invited_by: string
          project_id: string
          role: string
          status?: string
          user_id: string
        }
        Update: {
          accepted_at?: string
          id?: string
          invited_at?: string
          invited_by?: string
          project_id?: string
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_collaborators_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_summary"
            referencedColumns: ["project_id"]
          },
        ]
      }
      project_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          accepted_email: string | null
          email: string
          expires_at: string | null
          id: string
          invited_at: string | null
          invited_by: string
          project_id: string
          project_name: string | null
          role: string
          status: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          accepted_email?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by: string
          project_id: string
          project_name?: string | null
          role?: string
          status?: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          accepted_email?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string
          project_id?: string
          project_name?: string | null
          role?: string
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_invitations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_summary"
            referencedColumns: ["project_id"]
          },
        ]
      }
      project_summary: {
        Row: {
          b2b_problems: string | null
          b2b_profile: string | null
          b2c_problems: string | null
          b2c_profile: string | null
          budget: string | null
          created_at: string
          date_mail_avis: string | null
          date_paiement: string | null
          date_relance_free_to_premium: string | null
          description_synthetique: string | null
          doc_free_id: string | null
          drive_folder_id: string | null
          drive_folder_url: string | null
          elements_distinctifs: string | null
          equipe_fondatrice: string | null
          Marche_cible: string | null
          marches_annexes: string | null
          Motivation_entrepreneur: string | null
          nom_projet: string | null
          organismes_problems: string | null
          organismes_profile: string | null
          problemes: string | null
          produit_service: string | null
          project_id: string
          project_location: string | null
          project_type: string | null
          proposition_valeur: string | null
          public_cible: string | null
          status_action_plan: string | null
          statut: string | null
          statut_business_model: string | null
          statut_concurrence: string | null
          statut_juridique: string | null
          statut_mini_swot: string | null
          statut_persona_express: string | null
          statut_pestel: string | null
          statut_pitch: string | null
          statut_project: string | null
          statut_proposition_valeur: string | null
          statut_relance_free_to_premium: string | null
          statut_ressources: string | null
          statut_success_story: string | null
          statut_vision_mission_valeurs: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          b2b_problems?: string | null
          b2b_profile?: string | null
          b2c_problems?: string | null
          b2c_profile?: string | null
          budget?: string | null
          created_at?: string
          date_mail_avis?: string | null
          date_paiement?: string | null
          date_relance_free_to_premium?: string | null
          description_synthetique?: string | null
          doc_free_id?: string | null
          drive_folder_id?: string | null
          drive_folder_url?: string | null
          elements_distinctifs?: string | null
          equipe_fondatrice?: string | null
          Marche_cible?: string | null
          marches_annexes?: string | null
          Motivation_entrepreneur?: string | null
          nom_projet?: string | null
          organismes_problems?: string | null
          organismes_profile?: string | null
          problemes?: string | null
          produit_service?: string | null
          project_id?: string
          project_location?: string | null
          project_type?: string | null
          proposition_valeur?: string | null
          public_cible?: string | null
          status_action_plan?: string | null
          statut?: string | null
          statut_business_model?: string | null
          statut_concurrence?: string | null
          statut_juridique?: string | null
          statut_mini_swot?: string | null
          statut_persona_express?: string | null
          statut_pestel?: string | null
          statut_pitch?: string | null
          statut_project?: string | null
          statut_proposition_valeur?: string | null
          statut_relance_free_to_premium?: string | null
          statut_ressources?: string | null
          statut_success_story?: string | null
          statut_vision_mission_valeurs?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          b2b_problems?: string | null
          b2b_profile?: string | null
          b2c_problems?: string | null
          b2c_profile?: string | null
          budget?: string | null
          created_at?: string
          date_mail_avis?: string | null
          date_paiement?: string | null
          date_relance_free_to_premium?: string | null
          description_synthetique?: string | null
          doc_free_id?: string | null
          drive_folder_id?: string | null
          drive_folder_url?: string | null
          elements_distinctifs?: string | null
          equipe_fondatrice?: string | null
          Marche_cible?: string | null
          marches_annexes?: string | null
          Motivation_entrepreneur?: string | null
          nom_projet?: string | null
          organismes_problems?: string | null
          organismes_profile?: string | null
          problemes?: string | null
          produit_service?: string | null
          project_id?: string
          project_location?: string | null
          project_type?: string | null
          proposition_valeur?: string | null
          public_cible?: string | null
          status_action_plan?: string | null
          statut?: string | null
          statut_business_model?: string | null
          statut_concurrence?: string | null
          statut_juridique?: string | null
          statut_mini_swot?: string | null
          statut_persona_express?: string | null
          statut_pestel?: string | null
          statut_pitch?: string | null
          statut_project?: string | null
          statut_proposition_valeur?: string | null
          statut_relance_free_to_premium?: string | null
          statut_ressources?: string | null
          statut_success_story?: string | null
          statut_vision_mission_valeurs?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_summary_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "form_business_idea"
            referencedColumns: ["project_id"]
          },
        ]
      }
      proposition_valeur: {
        Row: {
          b2b_carte_valeur_createurs_benefices: string | null
          b2b_carte_valeur_produits_services: string | null
          b2b_carte_valeur_solutions: string | null
          b2b_profil_aspirations: string | null
          b2b_profil_besoins: string | null
          b2b_profil_problemes: string | null
          b2c_carte_valeur_createurs_benefices: string | null
          b2c_carte_valeur_produits_services: string | null
          b2c_carte_valeur_solutions: string | null
          b2c_profil_aspirations: string | null
          b2c_profil_besoins: string | null
          b2c_profil_problemes: string | null
          created_at: string
          organismes_carte_valeur_createurs_benefices: string | null
          organismes_carte_valeur_produits_services: string | null
          organismes_carte_valeur_solutions: string | null
          organismes_profil_aspirations: string | null
          organismes_profil_besoins: string | null
          organismes_profil_problemes: string | null
          project_id: string
          user_id: string
        }
        Insert: {
          b2b_carte_valeur_createurs_benefices?: string | null
          b2b_carte_valeur_produits_services?: string | null
          b2b_carte_valeur_solutions?: string | null
          b2b_profil_aspirations?: string | null
          b2b_profil_besoins?: string | null
          b2b_profil_problemes?: string | null
          b2c_carte_valeur_createurs_benefices?: string | null
          b2c_carte_valeur_produits_services?: string | null
          b2c_carte_valeur_solutions?: string | null
          b2c_profil_aspirations?: string | null
          b2c_profil_besoins?: string | null
          b2c_profil_problemes?: string | null
          created_at?: string
          organismes_carte_valeur_createurs_benefices?: string | null
          organismes_carte_valeur_produits_services?: string | null
          organismes_carte_valeur_solutions?: string | null
          organismes_profil_aspirations?: string | null
          organismes_profil_besoins?: string | null
          organismes_profil_problemes?: string | null
          project_id?: string
          user_id: string
        }
        Update: {
          b2b_carte_valeur_createurs_benefices?: string | null
          b2b_carte_valeur_produits_services?: string | null
          b2b_carte_valeur_solutions?: string | null
          b2b_profil_aspirations?: string | null
          b2b_profil_besoins?: string | null
          b2b_profil_problemes?: string | null
          b2c_carte_valeur_createurs_benefices?: string | null
          b2c_carte_valeur_produits_services?: string | null
          b2c_carte_valeur_solutions?: string | null
          b2c_profil_aspirations?: string | null
          b2c_profil_besoins?: string | null
          b2c_profil_problemes?: string | null
          created_at?: string
          organismes_carte_valeur_createurs_benefices?: string | null
          organismes_carte_valeur_produits_services?: string | null
          organismes_carte_valeur_solutions?: string | null
          organismes_profil_aspirations?: string | null
          organismes_profil_besoins?: string | null
          organismes_profil_problemes?: string | null
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposition_valeur_project_id_fkey1"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "project_summary"
            referencedColumns: ["project_id"]
          },
        ]
      }
      rag: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          project_id: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          project_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          project_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rag_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_summary"
            referencedColumns: ["project_id"]
          },
        ]
      }
      ressources_requises: {
        Row: {
          avis: string | null
          created_at: string
          project_id: string
          ressources_humaines: string | null
          ressources_materielles: string | null
          ressources_techniques: string | null
          user_id: string
        }
        Insert: {
          avis?: string | null
          created_at?: string
          project_id?: string
          ressources_humaines?: string | null
          ressources_materielles?: string | null
          ressources_techniques?: string | null
          user_id: string
        }
        Update: {
          avis?: string | null
          created_at?: string
          project_id?: string
          ressources_humaines?: string | null
          ressources_materielles?: string | null
          ressources_techniques?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ressources_requises_project_id_fkey1"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "project_summary"
            referencedColumns: ["project_id"]
          },
        ]
      }
      success_story: {
        Row: {
          avis: string | null
          created_at: string
          message_motivation: string | null
          project_id: string
          projections_cinq_ans_titre: string | null
          projections_cinq_ans_vision: string | null
          projections_trois_ans_titre: string | null
          projections_trois_ans_vision: string | null
          projections_un_an_titre: string | null
          projections_un_an_vision: string | null
          user_id: string
        }
        Insert: {
          avis?: string | null
          created_at?: string
          message_motivation?: string | null
          project_id: string
          projections_cinq_ans_titre?: string | null
          projections_cinq_ans_vision?: string | null
          projections_trois_ans_titre?: string | null
          projections_trois_ans_vision?: string | null
          projections_un_an_titre?: string | null
          projections_un_an_vision?: string | null
          user_id: string
        }
        Update: {
          avis?: string | null
          created_at?: string
          message_motivation?: string | null
          project_id?: string
          projections_cinq_ans_titre?: string | null
          projections_cinq_ans_vision?: string | null
          projections_trois_ans_titre?: string | null
          projections_trois_ans_vision?: string | null
          projections_un_an_titre?: string | null
          projections_un_an_vision?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "success_story_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "project_summary"
            referencedColumns: ["project_id"]
          },
        ]
      }
      Template: {
        Row: {
          created_at: string
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          project_id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Template_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "form_business_idea"
            referencedColumns: ["project_id"]
          },
        ]
      }
      vision_mission_valeurs: {
        Row: {
          avis: string | null
          coherence_strategique: string | null
          created_at: string
          mission: string | null
          project_id: string
          user_id: string
          valeurs: string | null
          vision: string | null
        }
        Insert: {
          avis?: string | null
          coherence_strategique?: string | null
          created_at?: string
          mission?: string | null
          project_id: string
          user_id: string
          valeurs?: string | null
          vision?: string | null
        }
        Update: {
          avis?: string | null
          coherence_strategique?: string | null
          created_at?: string
          mission?: string | null
          project_id?: string
          user_id?: string
          valeurs?: string | null
          vision?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vision_mission_valeurs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "form_business_idea"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "vision_mission_valeurs_project_id_fkey1"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "project_summary"
            referencedColumns: ["project_id"]
          },
        ]
      }
      score_projet: {
        Row: {
          project_id: string;
          score_final: number;
          analyse_juridique: Json;
          marche_concurrence: Json;
          faisabilite_business: Json;
          innovation_risques: Json;
          evaluation_finale: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          project_id: string;
          score_final?: number;
          analyse_juridique?: Json;
          marche_concurrence?: Json;
          faisabilite_business?: Json;
          innovation_risques?: Json;
          evaluation_finale?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          project_id?: string;
          score_final?: number;
          analyse_juridique?: Json;
          marche_concurrence?: Json;
          faisabilite_business?: Json;
          innovation_risques?: Json;
          evaluation_finale?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "score_projet_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: true;
            referencedRelation: "project_summary";
            referencedColumns: ["project_id"];
          },
        ];
      };
      organization_resources: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          description: string | null;
          slug: string | null;
          cover_image_url: string | null;
          resource_type: string;
          category: string | null;
          tags: string[] | null;
          content: Json;
          status: string;
          visibility: string;
          assigned_to: string[] | null;
          view_count: number;
          favorite_count: number;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
          published_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          title: string;
          description?: string | null;
          slug?: string | null;
          cover_image_url?: string | null;
          resource_type?: string;
          category?: string | null;
          tags?: string[] | null;
          content?: Json;
          status?: string;
          visibility?: string;
          assigned_to?: string[] | null;
          view_count?: number;
          favorite_count?: number;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          published_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          title?: string;
          description?: string | null;
          slug?: string | null;
          cover_image_url?: string | null;
          resource_type?: string;
          category?: string | null;
          tags?: string[] | null;
          content?: Json;
          status?: string;
          visibility?: string;
          assigned_to?: string[] | null;
          view_count?: number;
          favorite_count?: number;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          published_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "organization_resources_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "organization_resources_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      resource_favorites: {
        Row: {
          id: string;
          resource_id: string;
          user_id: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          resource_id: string;
          user_id: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          resource_id?: string;
          user_id?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "resource_favorites_resource_id_fkey";
            columns: ["resource_id"];
            isOneToOne: false;
            referencedRelation: "organization_resources";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resource_favorites_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      resource_views: {
        Row: {
          id: string;
          resource_id: string;
          user_id: string;
          viewed_at: string | null;
        };
        Insert: {
          id?: string;
          resource_id: string;
          user_id: string;
          viewed_at?: string | null;
        };
        Update: {
          id?: string;
          resource_id?: string;
          user_id?: string;
          viewed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "resource_views_resource_id_fkey";
            columns: ["resource_id"];
            isOneToOne: false;
            referencedRelation: "organization_resources";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resource_views_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: {
        Args: { p_invitation_id: string }
        Returns: Json
      }
      accept_invitation_by_token: {
        Args: { p_token: string }
        Returns: Json
      }
      accept_project_invitation: {
        Args: { p_invitation_id: string }
        Returns: Json
      }
      associate_form_responses_to_user: {
        Args: { user_email: string; user_id: string }
        Returns: number
      }
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      cleanup_expired_invitations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      complete_payment_intent: {
        Args: {
          p_payment_intent_id: string
          p_stripe_payment_intent_id?: string
        }
        Returns: boolean
      }
      get_action_plan_classification: {
        Args: { project_uuid: string }
        Returns: unknown[]
      }
      get_action_plan_jalons: {
        Args: { project_uuid: string }
        Returns: unknown[]
      }
      get_action_plan_livrables: {
        Args: { project_uuid: string }
        Returns: unknown[]
      }
      get_action_plan_phases: {
        Args: { project_uuid: string }
        Returns: unknown[]
      }
      get_action_plan_taches: {
        Args: { project_uuid: string }
        Returns: unknown[]
      }
      get_action_plan_user_responses: {
        Args: { project_uuid: string }
        Returns: unknown[]
      }
      get_all_projects: {
        Args: Record<PropertyKey, never>
        Returns: {
          b2b_problems: string | null
          b2b_profile: string | null
          b2c_problems: string | null
          b2c_profile: string | null
          budget: string | null
          created_at: string
          date_mail_avis: string | null
          date_paiement: string | null
          date_relance_free_to_premium: string | null
          description_synthetique: string | null
          doc_free_id: string | null
          drive_folder_id: string | null
          drive_folder_url: string | null
          elements_distinctifs: string | null
          equipe_fondatrice: string | null
          Marche_cible: string | null
          marches_annexes: string | null
          Motivation_entrepreneur: string | null
          nom_projet: string | null
          organismes_problems: string | null
          organismes_profile: string | null
          problemes: string | null
          produit_service: string | null
          project_id: string
          project_location: string | null
          project_type: string | null
          proposition_valeur: string | null
          public_cible: string | null
          status_action_plan: string | null
          statut: string | null
          statut_business_model: string | null
          statut_concurrence: string | null
          statut_juridique: string | null
          statut_mini_swot: string | null
          statut_persona_express: string | null
          statut_pestel: string | null
          statut_pitch: string | null
          statut_project: string | null
          statut_proposition_valeur: string | null
          statut_relance_free_to_premium: string | null
          statut_ressources: string | null
          statut_success_story: string | null
          statut_vision_mission_valeurs: string | null
          updated_at: string
          user_id: string | null
        }[]
      }
      get_projects_by_email: {
        Args: { user_email: string }
        Returns: {
          b2b_problems: string | null
          b2b_profile: string | null
          b2c_problems: string | null
          b2c_profile: string | null
          budget: string | null
          created_at: string
          date_mail_avis: string | null
          date_paiement: string | null
          date_relance_free_to_premium: string | null
          description_synthetique: string | null
          doc_free_id: string | null
          drive_folder_id: string | null
          drive_folder_url: string | null
          elements_distinctifs: string | null
          equipe_fondatrice: string | null
          Marche_cible: string | null
          marches_annexes: string | null
          Motivation_entrepreneur: string | null
          nom_projet: string | null
          organismes_problems: string | null
          organismes_profile: string | null
          problemes: string | null
          produit_service: string | null
          project_id: string
          project_location: string | null
          project_type: string | null
          proposition_valeur: string | null
          public_cible: string | null
          status_action_plan: string | null
          statut: string | null
          statut_business_model: string | null
          statut_concurrence: string | null
          statut_juridique: string | null
          statut_mini_swot: string | null
          statut_persona_express: string | null
          statut_pestel: string | null
          statut_pitch: string | null
          statut_project: string | null
          statut_proposition_valeur: string | null
          statut_relance_free_to_premium: string | null
          statut_ressources: string | null
          statut_success_story: string | null
          statut_vision_mission_valeurs: string | null
          updated_at: string
          user_id: string | null
        }[]
      }
      get_user_email: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_from_payment_intent: {
        Args: { p_payment_intent_id: string }
        Returns: {
          project_id: string
          status: string
          user_id: string
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      increment_tool_usage: {
        Args: { tool_id: string }
        Returns: undefined
      }
      insert_project_summary: {
        Args: {
          p_b2b_problems: string
          p_b2b_profile: string
          p_b2c_problems: string
          p_b2c_profile: string
          p_competences: string
          p_description_synthetique: string
          p_elements_distinctifs: string
          p_form_id: string
          p_nom_projet: string
          p_organismes_problems: string
          p_organismes_profile: string
          p_problemes: string
          p_produit_service: string
          p_proposition_valeur: string
          p_public_cible: string
          p_vision_3_ans: string
        }
        Returns: string
      }
      invite_email_to_project: {
        Args: { p_email: string; p_project_id: string; p_role?: string }
        Returns: Json
      }
      invite_user_to_project: {
        Args:
          | { p_project_id: string; p_role: string; p_user_id: string }
          | { p_project_id: string; p_role?: string; p_user_id: string }
        Returns: Json
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      match_documents: {
        Args:
          | { filter?: Json; match_count?: number; query_embedding: string }
          | { match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      user_has_project_access: {
        Args: { p_project_id: string } | { project_id: string; user_id: string }
        Returns: boolean
      }
      user_has_project_write_access: {
        Args: { p_project_id: string }
        Returns: boolean
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      Activité: "Actif" | "Inactif"
      form_status: "pending" | "summary" | "completed" | "failed"
      processing_status: "pending" | "processing" | "summary" | "livrable"
      Statut: "Formulaire Audit v1 remplit" | "Attente retour Audit v1"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      Activité: ["Actif", "Inactif"],
      form_status: ["pending", "summary", "completed", "failed"],
      processing_status: ["pending", "processing", "summary", "livrable"],
      Statut: ["Formulaire Audit v1 remplit", "Attente retour Audit v1"],
    },
  },
} as const
