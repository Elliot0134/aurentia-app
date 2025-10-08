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
      ai_tool_favorites: {
        Row: {
          created_at: string | null
          id: string
          tool_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          tool_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          tool_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tool_favorites_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "ai_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tool_usage_history: {
        Row: {
          completed_at: string | null
          created_at: string | null
          credits_used: number | null
          error_message: string | null
          execution_time_ms: number | null
          id: string
          input_data: Json
          output_data: Json | null
          project_id: string | null
          status: string
          tool_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          credits_used?: number | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_data?: Json
          output_data?: Json | null
          project_id?: string | null
          status?: string
          tool_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          credits_used?: number | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_data?: Json
          output_data?: Json | null
          project_id?: string | null
          status?: string
          tool_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tool_usage_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "ai_tool_usage_history_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "ai_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tool_user_settings: {
        Row: {
          created_at: string | null
          id: string
          settings_data: Json
          tool_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          settings_data?: Json
          tool_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          settings_data?: Json
          tool_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tool_user_settings_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "ai_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tools: {
        Row: {
          category: string
          created_at: string | null
          credits_cost: number
          description: string | null
          difficulty: string | null
          estimated_time: string | null
          features: string[] | null
          how_to_use_steps: Json | null
          icon_url: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          short_description: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
          video_url: string | null
          webhook_url: string
          what_you_get: string[] | null
        }
        Insert: {
          category: string
          created_at?: string | null
          credits_cost?: number
          description?: string | null
          difficulty?: string | null
          estimated_time?: string | null
          features?: string[] | null
          how_to_use_steps?: Json | null
          icon_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          short_description?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          video_url?: string | null
          webhook_url: string
          what_you_get?: string[] | null
        }
        Update: {
          category?: string
          created_at?: string | null
          credits_cost?: number
          description?: string | null
          difficulty?: string | null
          estimated_time?: string | null
          features?: string[] | null
          how_to_use_steps?: Json | null
          icon_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          short_description?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
          webhook_url?: string
          what_you_get?: string[] | null
        }
        Relationships: []
      }
      backup_profiles: {
        Row: {
          created_at: string | null
          credit_limit: string | null
          credits_restants: string | null
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          credit_limit?: string | null
          credits_restants?: string | null
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          credit_limit?: string | null
          credits_restants?: string | null
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      backup_project_summary: {
        Row: {
          created_at: string | null
          project_id: string
          statut_project: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          project_id: string
          statut_project?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          project_id?: string
          statut_project?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "backup_project_summary_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
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
      deliverables: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          entrepreneur_id: string | null
          file_url: string | null
          id: string
          new_project_id: string | null
          organization_id: string | null
          project_id: string | null
          quality_score: number | null
          status: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          entrepreneur_id?: string | null
          file_url?: string | null
          id?: string
          new_project_id?: string | null
          organization_id?: string | null
          project_id?: string | null
          quality_score?: number | null
          status?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          entrepreneur_id?: string | null
          file_url?: string | null
          id?: string
          new_project_id?: string | null
          organization_id?: string | null
          project_id?: string | null
          quality_score?: number | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_entrepreneur_id_fkey"
            columns: ["entrepreneur_id"]
            isOneToOne: false
            referencedRelation: "organization_adherents_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "deliverables_entrepreneur_id_fkey"
            columns: ["entrepreneur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverables_new_project_id_fkey"
            columns: ["new_project_id"]
            isOneToOne: false
            referencedRelation: "organization_projects_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverables_new_project_id_fkey"
            columns: ["new_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverables_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverables_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "public_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverables_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_summary"
            referencedColumns: ["project_id"]
          },
        ]
      }
      email_confirmation_logs: {
        Row: {
          action: string
          confirmation_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          response_time_ms: number | null
          success: boolean | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          confirmation_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          response_time_ms?: number | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          confirmation_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          response_time_ms?: number | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_confirmation_logs_confirmation_id_fkey"
            columns: ["confirmation_id"]
            isOneToOne: false
            referencedRelation: "email_confirmations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_confirmations: {
        Row: {
          attempts: number | null
          confirmation_type: string | null
          confirmed_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          ip_address: unknown | null
          last_sent_at: string | null
          max_attempts: number | null
          metadata: Json | null
          new_email_confirmed_at: string | null
          new_email_token_hash: string | null
          old_email_confirmed_at: string | null
          old_email_token_hash: string | null
          status: string | null
          token_hash: string
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          attempts?: number | null
          confirmation_type?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          ip_address?: unknown | null
          last_sent_at?: string | null
          max_attempts?: number | null
          metadata?: Json | null
          new_email_confirmed_at?: string | null
          new_email_token_hash?: string | null
          old_email_confirmed_at?: string | null
          old_email_token_hash?: string | null
          status?: string | null
          token_hash: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          attempts?: number | null
          confirmation_type?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          last_sent_at?: string | null
          max_attempts?: number | null
          metadata?: Json | null
          new_email_confirmed_at?: string | null
          new_email_token_hash?: string | null
          old_email_confirmed_at?: string | null
          old_email_token_hash?: string | null
          status?: string | null
          token_hash?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          is_recurring: boolean | null
          location: string | null
          max_participants: number | null
          organization_id: string | null
          organizer_id: string | null
          participants: string[] | null
          start_date: string
          status: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          max_participants?: number | null
          organization_id?: string | null
          organizer_id?: string | null
          participants?: string[] | null
          start_date: string
          status?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          max_participants?: number | null
          organization_id?: string | null
          organizer_id?: string | null
          participants?: string[] | null
          start_date?: string
          status?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "public_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "organization_adherents_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          other_infos?: string | null
          produit_service?: string | null
          project_id?: string
          project_sentence?: string | null
          reponse_besoin?: string | null
          type_projet?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_business_idea_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_business_idea_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "public_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          data: Json
          form_id: string | null
          id: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          submitted_at: string | null
          submitted_by: string | null
        }
        Insert: {
          data?: Json
          form_id?: string | null
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
        }
        Update: {
          data?: Json
          form_id?: string | null
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "form_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "organization_adherents_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "form_submissions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "organization_adherents_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "form_submissions_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      form_templates: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          fields: Json
          id: string
          is_active: boolean | null
          organization_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          fields?: Json
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          fields?: Json
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "organization_adherents_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "form_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "public_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_code: {
        Row: {
          assigned_role: string | null
          code: string
          created_at: string | null
          created_by: string | null
          current_uses: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          organization_id: string | null
          type: string
        }
        Insert: {
          assigned_role?: string | null
          code: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          organization_id?: string | null
          type: string
        }
        Update: {
          assigned_role?: string | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          organization_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitation_code_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitation_code_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "public_organizations"
            referencedColumns: ["id"]
          },
        ]
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
      member_subscriptions: {
        Row: {
          amount: number
          auto_renew: boolean | null
          created_at: string | null
          currency: string | null
          days_overdue: number | null
          id: string
          last_payment_date: string | null
          next_payment_date: string | null
          notes: string | null
          organization_id: string
          payment_frequency: string | null
          payment_method: string | null
          payment_status: string | null
          status: string
          stripe_invoice_id: string | null
          stripe_subscription_id: string | null
          subscription_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          auto_renew?: boolean | null
          created_at?: string | null
          currency?: string | null
          days_overdue?: number | null
          id?: string
          last_payment_date?: string | null
          next_payment_date?: string | null
          notes?: string | null
          organization_id: string
          payment_frequency?: string | null
          payment_method?: string | null
          payment_status?: string | null
          status: string
          stripe_invoice_id?: string | null
          stripe_subscription_id?: string | null
          subscription_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          auto_renew?: boolean | null
          created_at?: string | null
          currency?: string | null
          days_overdue?: number | null
          id?: string
          last_payment_date?: string | null
          next_payment_date?: string | null
          notes?: string | null
          organization_id?: string
          payment_frequency?: string | null
          payment_method?: string | null
          payment_status?: string | null
          status?: string
          stripe_invoice_id?: string | null
          stripe_subscription_id?: string | null
          subscription_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "public_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          assignment_reason: string | null
          created_by: string | null
          entrepreneur_id: string | null
          id: string
          mentor_id: string | null
          notes: string | null
          organization_id: string | null
          project_id: string | null
          status: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          assignment_reason?: string | null
          created_by?: string | null
          entrepreneur_id?: string | null
          id?: string
          mentor_id?: string | null
          notes?: string | null
          organization_id?: string | null
          project_id?: string | null
          status?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          assignment_reason?: string | null
          created_by?: string | null
          entrepreneur_id?: string | null
          id?: string
          mentor_id?: string | null
          notes?: string | null
          organization_id?: string | null
          project_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "organization_adherents_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "mentor_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "organization_adherents_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "mentor_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_assignments_entrepreneur_id_fkey"
            columns: ["entrepreneur_id"]
            isOneToOne: false
            referencedRelation: "organization_adherents_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "mentor_assignments_entrepreneur_id_fkey"
            columns: ["entrepreneur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_assignments_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_assignments_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "organization_mentors_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "public_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_summary"
            referencedColumns: ["project_id"]
          },
        ]
      }
      mentors: {
        Row: {
          availability: Json | null
          bio: string | null
          created_at: string | null
          expertise: string[] | null
          id: string
          linkedin_url: string | null
          max_entrepreneurs: number | null
          max_projects: number | null
          organization_id: string | null
          rating: number | null
          status: string | null
          success_rate: number | null
          total_entrepreneurs: number | null
          updated_at: string | null
          user_id: string | null
          user_organization_id: string | null
        }
        Insert: {
          availability?: Json | null
          bio?: string | null
          created_at?: string | null
          expertise?: string[] | null
          id?: string
          linkedin_url?: string | null
          max_entrepreneurs?: number | null
          max_projects?: number | null
          organization_id?: string | null
          rating?: number | null
          status?: string | null
          success_rate?: number | null
          total_entrepreneurs?: number | null
          updated_at?: string | null
          user_id?: string | null
          user_organization_id?: string | null
        }
        Update: {
          availability?: Json | null
          bio?: string | null
          created_at?: string | null
          expertise?: string[] | null
          id?: string
          linkedin_url?: string | null
          max_entrepreneurs?: number | null
          max_projects?: number | null
          organization_id?: string | null
          rating?: number | null
          status?: string | null
          success_rate?: number | null
          total_entrepreneurs?: number | null
          updated_at?: string | null
          user_id?: string | null
          user_organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "public_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "organization_adherents_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "mentors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentors_user_organization_id_fkey"
            columns: ["user_organization_id"]
            isOneToOne: false
            referencedRelation: "organization_members_view"
            referencedColumns: ["membership_id"]
          },
          {
            foreignKeyName: "mentors_user_organization_id_fkey"
            columns: ["user_organization_id"]
            isOneToOne: false
            referencedRelation: "user_organizations"
            referencedColumns: ["id"]
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
      organisation_applications: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          organization_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          organization_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          organization_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organisation_applications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organisation_applications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "public_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organisation_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "organization_adherents_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "organisation_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          allow_direct_applications: boolean | null
          banner_path: string | null
          banner_url: string | null
          created_at: string | null
          created_by: string | null
          custom_geographic: string | null
          custom_type: string | null
          description: string | null
          domain: string | null
          email: string | null
          event_type_colors: Json | null
          founded_year: number | null
          geographic_focus: Json | null
          id: string
          is_public: boolean | null
          logo: string | null
          logo_path: string | null
          logo_url: string | null
          methodology: string | null
          mission: string | null
          name: string
          newsletter_enabled: boolean | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          owner_id: string | null
          phone: string | null
          plan: Database["public"]["Enums"]["organization_plan"] | null
          primary_color: string | null
          program_duration_months: number | null
          secondary_color: string | null
          sectors: Json | null
          settings: Json | null
          social_media: Json | null
          specializations: Json | null
          stages: Json | null
          success_criteria: string | null
          support_types: Json | null
          team_size: number | null
          type: string | null
          updated_at: string | null
          values: Json | null
          vision: string | null
          website: string | null
          welcome_message: string | null
        }
        Insert: {
          address?: string | null
          allow_direct_applications?: boolean | null
          banner_path?: string | null
          banner_url?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_geographic?: string | null
          custom_type?: string | null
          description?: string | null
          domain?: string | null
          email?: string | null
          event_type_colors?: Json | null
          founded_year?: number | null
          geographic_focus?: Json | null
          id?: string
          is_public?: boolean | null
          logo?: string | null
          logo_path?: string | null
          logo_url?: string | null
          methodology?: string | null
          mission?: string | null
          name: string
          newsletter_enabled?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          owner_id?: string | null
          phone?: string | null
          plan?: Database["public"]["Enums"]["organization_plan"] | null
          primary_color?: string | null
          program_duration_months?: number | null
          secondary_color?: string | null
          sectors?: Json | null
          settings?: Json | null
          social_media?: Json | null
          specializations?: Json | null
          stages?: Json | null
          success_criteria?: string | null
          support_types?: Json | null
          team_size?: number | null
          type?: string | null
          updated_at?: string | null
          values?: Json | null
          vision?: string | null
          website?: string | null
          welcome_message?: string | null
        }
        Update: {
          address?: string | null
          allow_direct_applications?: boolean | null
          banner_path?: string | null
          banner_url?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_geographic?: string | null
          custom_type?: string | null
          description?: string | null
          domain?: string | null
          email?: string | null
          event_type_colors?: Json | null
          founded_year?: number | null
          geographic_focus?: Json | null
          id?: string
          is_public?: boolean | null
          logo?: string | null
          logo_path?: string | null
          logo_url?: string | null
          methodology?: string | null
          mission?: string | null
          name?: string
          newsletter_enabled?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          owner_id?: string | null
          phone?: string | null
          plan?: Database["public"]["Enums"]["organization_plan"] | null
          primary_color?: string | null
          program_duration_months?: number | null
          secondary_color?: string | null
          sectors?: Json | null
          settings?: Json | null
          social_media?: Json | null
          specializations?: Json | null
          stages?: Json | null
          success_criteria?: string | null
          support_types?: Json | null
          team_size?: number | null
          type?: string | null
          updated_at?: string | null
          values?: Json | null
          vision?: string | null
          website?: string | null
          welcome_message?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          collaboration_type: string[] | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          logo: string | null
          name: string
          organization_id: string | null
          phone: string | null
          rating: number | null
          status: string | null
          type: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          collaboration_type?: string[] | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          logo?: string | null
          name: string
          organization_id?: string | null
          phone?: string | null
          rating?: number | null
          status?: string | null
          type: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          collaboration_type?: string[] | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          logo?: string | null
          name?: string
          organization_id?: string | null
          phone?: string | null
          rating?: number | null
          status?: string | null
          type?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partners_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partners_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "public_organizations"
            referencedColumns: ["id"]
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
      profiles: {
        Row: {
          availability_schedule: Json | null
          avatar_url: string | null
          bio: string | null
          cohort_year: number | null
          company: string | null
          conv_limit: string | null
          created_at: string | null
          drive_folder_id: string | null
          drive_folder_rag: string | null
          drive_folder_url: string | null
          email: string | null
          email_confirmation_required: boolean | null
          email_confirmed_at: string | null
          first_name: string | null
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
          organization_setup_pending: boolean | null
          phone: string | null
          program_type: string | null
          purchased_credits_remaining: number
          stripe_customer_id: string | null
          subscription_status: string | null
          training_budget: number | null
          user_role: string | null
          website: string | null
        }
        Insert: {
          availability_schedule?: Json | null
          avatar_url?: string | null
          bio?: string | null
          cohort_year?: number | null
          company?: string | null
          conv_limit?: string | null
          created_at?: string | null
          drive_folder_id?: string | null
          drive_folder_rag?: string | null
          drive_folder_url?: string | null
          email?: string | null
          email_confirmation_required?: boolean | null
          email_confirmed_at?: string | null
          first_name?: string | null
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
          organization_setup_pending?: boolean | null
          phone?: string | null
          program_type?: string | null
          purchased_credits_remaining?: number
          stripe_customer_id?: string | null
          subscription_status?: string | null
          training_budget?: number | null
          user_role?: string | null
          website?: string | null
        }
        Update: {
          availability_schedule?: Json | null
          avatar_url?: string | null
          bio?: string | null
          cohort_year?: number | null
          company?: string | null
          conv_limit?: string | null
          created_at?: string | null
          drive_folder_id?: string | null
          drive_folder_rag?: string | null
          drive_folder_url?: string | null
          email?: string | null
          email_confirmation_required?: boolean | null
          email_confirmed_at?: string | null
          first_name?: string | null
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
          organization_setup_pending?: boolean | null
          phone?: string | null
          program_type?: string | null
          purchased_credits_remaining?: number
          stripe_customer_id?: string | null
          subscription_status?: string | null
          training_budget?: number | null
          user_role?: string | null
          website?: string | null
        }
        Relationships: []
      }
      project_collaborators: {
        Row: {
          id: string
          joined_at: string | null
          permissions: Json | null
          project_id: string
          role: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          permissions?: Json | null
          project_id: string
          role?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          permissions?: Json | null
          project_id?: string
          role?: string
          status?: string
          updated_at?: string | null
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
          {
            foreignKeyName: "project_collaborators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "organization_adherents_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "project_collaborators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
            foreignKeyName: "project_invitations_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "organization_adherents_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "project_invitations_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "organization_adherents_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "project_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
          id: string | null
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
          status_score_viabilite: string | null
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
          id?: string | null
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
          status_score_viabilite?: string | null
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
          id?: string | null
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
          status_score_viabilite?: string | null
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
      projects: {
        Row: {
          address: string | null
          budget: number | null
          business_type: string | null
          category: string | null
          city: string | null
          created_at: string
          creator_id: string
          deadline: string | null
          description: string | null
          funding_amount: number | null
          funding_planned: boolean | null
          id: string
          ip_status: string | null
          legacy_project_id: string | null
          legacy_statut: string | null
          legal_status: string | null
          organization_id: string
          progress: number | null
          required_resources: string[] | null
          revenue: number | null
          stage: string | null
          status: string
          tags: string[] | null
          team_size: number | null
          title: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          budget?: number | null
          business_type?: string | null
          category?: string | null
          city?: string | null
          created_at?: string
          creator_id: string
          deadline?: string | null
          description?: string | null
          funding_amount?: number | null
          funding_planned?: boolean | null
          id?: string
          ip_status?: string | null
          legacy_project_id?: string | null
          legacy_statut?: string | null
          legal_status?: string | null
          organization_id: string
          progress?: number | null
          required_resources?: string[] | null
          revenue?: number | null
          stage?: string | null
          status?: string
          tags?: string[] | null
          team_size?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          budget?: number | null
          business_type?: string | null
          category?: string | null
          city?: string | null
          created_at?: string
          creator_id?: string
          deadline?: string | null
          description?: string | null
          funding_amount?: number | null
          funding_planned?: boolean | null
          id?: string
          ip_status?: string | null
          legacy_project_id?: string | null
          legacy_statut?: string | null
          legal_status?: string | null
          organization_id?: string
          progress?: number | null
          required_resources?: string[] | null
          revenue?: number | null
          stage?: string | null
          status?: string
          tags?: string[] | null
          team_size?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "public_organizations"
            referencedColumns: ["id"]
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
      resource_ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          resource_id: string
          user_ip: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          resource_id: string
          user_ip: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          resource_id?: string
          user_ip?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_ratings_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          average_rating: number | null
          category: string | null
          created_at: string | null
          credit_cost: number | null
          description: string | null
          detailed_description: string | null
          download_count: number | null
          faq_answer_1: string | null
          faq_answer_2: string | null
          faq_answer_3: string | null
          faq_question_1: string | null
          faq_question_2: string | null
          faq_question_3: string | null
          favorite_count: number | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          image_2_url: string | null
          image_3_url: string | null
          image_4_url: string | null
          image_url: string | null
          included_items: Json | null
          is_featured: boolean | null
          is_published: boolean | null
          long_description: string | null
          meta_description: string | null
          meta_title: string | null
          name: string
          reason_1_text: string | null
          reason_1_title: string | null
          reason_2_text: string | null
          reason_2_title: string | null
          reason_3_text: string | null
          reason_3_title: string | null
          slug: string
          tags: string[] | null
          total_ratings: number | null
          updated_at: string | null
          video_url: string | null
          view_count: number | null
        }
        Insert: {
          average_rating?: number | null
          category?: string | null
          created_at?: string | null
          credit_cost?: number | null
          description?: string | null
          detailed_description?: string | null
          download_count?: number | null
          faq_answer_1?: string | null
          faq_answer_2?: string | null
          faq_answer_3?: string | null
          faq_question_1?: string | null
          faq_question_2?: string | null
          faq_question_3?: string | null
          favorite_count?: number | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          image_2_url?: string | null
          image_3_url?: string | null
          image_4_url?: string | null
          image_url?: string | null
          included_items?: Json | null
          is_featured?: boolean | null
          is_published?: boolean | null
          long_description?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          reason_1_text?: string | null
          reason_1_title?: string | null
          reason_2_text?: string | null
          reason_2_title?: string | null
          reason_3_text?: string | null
          reason_3_title?: string | null
          slug: string
          tags?: string[] | null
          total_ratings?: number | null
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Update: {
          average_rating?: number | null
          category?: string | null
          created_at?: string | null
          credit_cost?: number | null
          description?: string | null
          detailed_description?: string | null
          download_count?: number | null
          faq_answer_1?: string | null
          faq_answer_2?: string | null
          faq_answer_3?: string | null
          faq_question_1?: string | null
          faq_question_2?: string | null
          faq_question_3?: string | null
          favorite_count?: number | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          image_2_url?: string | null
          image_3_url?: string | null
          image_4_url?: string | null
          image_url?: string | null
          included_items?: Json | null
          is_featured?: boolean | null
          is_published?: boolean | null
          long_description?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          reason_1_text?: string | null
          reason_1_title?: string | null
          reason_2_text?: string | null
          reason_2_title?: string | null
          reason_3_text?: string | null
          reason_3_title?: string | null
          slug?: string
          tags?: string[] | null
          total_ratings?: number | null
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Relationships: []
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
      score_projet: {
        Row: {
          analyse_juridique: Json | null
          created_at: string | null
          evaluation_finale: Json | null
          faisabilite_business: Json | null
          innovation_risques: Json | null
          marche_concurrence: Json | null
          project_id: string
          score_final: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          analyse_juridique?: Json | null
          created_at?: string | null
          evaluation_finale?: Json | null
          faisabilite_business?: Json | null
          innovation_risques?: Json | null
          marche_concurrence?: Json | null
          project_id: string
          score_final?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          analyse_juridique?: Json | null
          created_at?: string | null
          evaluation_finale?: Json | null
          faisabilite_business?: Json | null
          innovation_risques?: Json | null
          marche_concurrence?: Json | null
          project_id?: string
          score_final?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "score_projet_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "project_summary"
            referencedColumns: ["project_id"]
          },
        ]
      }
      stripe_customers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          stripe_customer_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          stripe_customer_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          stripe_customer_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      stripe_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_subscriptions_stripe_customer_id_fkey"
            columns: ["stripe_customer_id"]
            isOneToOne: false
            referencedRelation: "stripe_customers"
            referencedColumns: ["stripe_customer_id"]
          },
        ]
      }
      stripe_webhook_events: {
        Row: {
          created_at: string | null
          data: Json | null
          event_type: string
          id: string
          processed: boolean | null
          processed_at: string | null
          stripe_event_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          event_type: string
          id?: string
          processed?: boolean | null
          processed_at?: string | null
          stripe_event_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          event_type?: string
          id?: string
          processed?: boolean | null
          processed_at?: string | null
          stripe_event_id?: string
        }
        Relationships: []
      }
      subscription_intents: {
        Row: {
          created_at: string | null
          id: string
          price_id: string
          product_id: string
          project_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          price_id: string
          product_id: string
          project_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          price_id?: string
          product_id?: string
          project_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      user_activity_log: {
        Row: {
          activity_description: string | null
          activity_type: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          organization_id: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_description?: string | null
          activity_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          organization_id?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_description?: string | null
          activity_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          organization_id?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "public_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string | null
          id: string
          resource_id: string
          user_ip: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          resource_id: string
          user_ip: string
        }
        Update: {
          created_at?: string | null
          id?: string
          resource_id?: string
          user_ip?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      user_organizations: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          joined_at: string | null
          organization_id: string
          status: string | null
          updated_at: string | null
          user_id: string
          user_role: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          joined_at?: string | null
          organization_id: string
          status?: string | null
          updated_at?: string | null
          user_id: string
          user_role: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          joined_at?: string | null
          organization_id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
          user_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "public_organizations"
            referencedColumns: ["id"]
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
    }
    Views: {
      organization_adherents_view: {
        Row: {
          active_projects: number | null
          activity_status: string | null
          availability_schedule: Json | null
          avatar_url: string | null
          bio: string | null
          cohort_year: number | null
          company: string | null
          completed_deliverables: number | null
          completion_rate: number | null
          email: string | null
          first_name: string | null
          job_title: string | null
          joined_at: string | null
          last_name: string | null
          last_payment_date: string | null
          linkedin_url: string | null
          location: string | null
          mentor_names: string[] | null
          monthly_credits_remaining: number | null
          next_payment_date: string | null
          organization_id: string | null
          payment_status: string | null
          phone: string | null
          program_type: string | null
          project_names: string[] | null
          purchased_credits_remaining: number | null
          subscription_amount: number | null
          subscription_days_overdue: number | null
          total_deliverables: number | null
          total_projects: number | null
          training_budget: number | null
          user_id: string | null
          user_role: string | null
          website: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "public_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members_view: {
        Row: {
          active_projects: number | null
          activity_status: string | null
          completed_deliverables: number | null
          completed_projects: number | null
          email: string | null
          first_name: string | null
          is_primary: boolean | null
          joined_at: string | null
          last_name: string | null
          membership_id: string | null
          membership_status: string | null
          mentor_id: string | null
          mentor_name: string | null
          organization_id: string | null
          organization_name: string | null
          phone: string | null
          project_count: number | null
          total_deliverables: number | null
          user_id: string | null
          user_role: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_assignments_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_assignments_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "organization_mentors_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "public_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_mentors_view: {
        Row: {
          active_assignments: number | null
          availability: Json | null
          avatar_url: string | null
          company: string | null
          completed_assignments: number | null
          created_at: string | null
          current_entrepreneurs: number | null
          email: string | null
          expertise: string[] | null
          first_name: string | null
          id: string | null
          job_title: string | null
          joined_at: string | null
          last_name: string | null
          location: string | null
          max_entrepreneurs: number | null
          max_projects: number | null
          mentor_bio: string | null
          mentor_linkedin_url: string | null
          organization_id: string | null
          phone: string | null
          profile_bio: string | null
          profile_linkedin_url: string | null
          rating: number | null
          recent_assignments: number | null
          status: string | null
          success_rate: number | null
          total_assignments: number | null
          total_entrepreneurs: number | null
          updated_at: string | null
          user_id: string | null
          user_role: string | null
          website: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "public_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "organization_adherents_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "mentors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_projects_view: {
        Row: {
          category: string | null
          completed_deliverables_count: number | null
          created_at: string | null
          creator_email: string | null
          creator_id: string | null
          creator_name: string | null
          deadline_status: string | null
          deliverables_count: number | null
          description: string | null
          id: string | null
          organization_id: string | null
          organization_name: string | null
          progress: number | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "public_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      public_organizations: {
        Row: {
          address: string | null
          created_at: string | null
          description: string | null
          email: string | null
          founded_year: number | null
          geographic_focus: Json | null
          id: string | null
          logo_url: string | null
          mission: string | null
          name: string | null
          phone: string | null
          sectors: Json | null
          social_media: Json | null
          specializations: Json | null
          stages: Json | null
          team_size: number | null
          type: string | null
          updated_at: string | null
          values: Json | null
          vision: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          founded_year?: number | null
          geographic_focus?: Json | null
          id?: string | null
          logo_url?: string | null
          mission?: string | null
          name?: string | null
          phone?: string | null
          sectors?: Json | null
          social_media?: Json | null
          specializations?: Json | null
          stages?: Json | null
          team_size?: number | null
          type?: string | null
          updated_at?: string | null
          values?: Json | null
          vision?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          founded_year?: number | null
          geographic_focus?: Json | null
          id?: string | null
          logo_url?: string | null
          mission?: string | null
          name?: string | null
          phone?: string | null
          sectors?: Json | null
          social_media?: Json | null
          specializations?: Json | null
          stages?: Json | null
          team_size?: number | null
          type?: string | null
          updated_at?: string | null
          values?: Json | null
          vision?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_invitation: {
        Args: { p_token: string } | { p_token: string }
        Returns: Json
      }
      accept_invitation_by_email: {
        Args: { p_email: string; p_token: string }
        Returns: Json
      }
      accept_invitation_by_token: {
        Args: { p_token: string }
        Returns: Json
      }
      accept_invitation_enhanced: {
        Args: { p_token: string }
        Returns: Json
      }
      accept_project_invitation: {
        Args: { p_invitation_id: string }
        Returns: Json
      }
      add_purchased_credits: {
        Args: { p_amount: number; p_user_id: string }
        Returns: Json
      }
      admin_expire_email_confirmation: {
        Args: { p_confirmation_id: string; p_reason: string }
        Returns: boolean
      }
      admin_manually_confirm_email: {
        Args: { p_reason: string; p_user_id: string }
        Returns: boolean
      }
      assign_mentor_to_entrepreneur: {
        Args: {
          p_assigned_by?: string
          p_entrepreneur_id: string
          p_mentor_id: string
          p_notes?: string
          p_project_id?: string
        }
        Returns: string
      }
      associate_form_responses_to_user: {
        Args: { user_email: string; user_id: string }
        Returns: number
      }
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      cancel_email_confirmation: {
        Args: { p_confirmation_id: string }
        Returns: boolean
      }
      check_and_reset_credits: {
        Args: { p_user_id: string }
        Returns: Json
      }
      check_email_confirmation_needed: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      check_email_confirmation_rate_limit: {
        Args: { p_email: string; p_ip_address?: unknown; p_user_id?: string }
        Returns: Json
      }
      check_subscription_status: {
        Args: { p_organization_id: string; p_user_id: string }
        Returns: {
          days_overdue: number
          is_paid: boolean
          next_payment_date: string
          subscription_status: string
        }[]
      }
      check_user_project_permissions: {
        Args: { p_project_id: string; p_user_id?: string }
        Returns: Json
      }
      check_user_references: {
        Args: { p_user_id: string }
        Returns: {
          record_count: number
          table_name: string
        }[]
      }
      cleanup_expired_email_confirmations: {
        Args: Record<PropertyKey, never>
        Returns: number
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
      confirm_user_email: {
        Args: { p_confirmation_id: string; p_user_id: string }
        Returns: Json
      }
      consume_credits: {
        Args: { p_amount?: number; p_user_id: string }
        Returns: Json
      }
      create_invitation_code_with_mapping: {
        Args: {
          p_created_by?: string
          p_expires_at?: string
          p_max_uses?: number
          p_organization_id: string
          p_ui_role: string
        }
        Returns: string
      }
      delete_user_cascade: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_accepted_invitations_for_email: {
        Args: { user_email: string }
        Returns: {
          invited_by: string
          project_id: string
          role: string
        }[]
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
          id: string | null
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
          status_score_viabilite: string | null
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
      get_avatar_url: {
        Args: { user_id: string }
        Returns: string
      }
      get_email_confirmation_logs_paginated: {
        Args: {
          p_action?: string
          p_email?: string
          p_end_date?: string
          p_page?: number
          p_page_size?: number
          p_start_date?: string
          p_success?: boolean
          p_user_id?: string
        }
        Returns: Json
      }
      get_email_confirmation_metrics: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: Json
      }
      get_email_confirmation_status: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_organization_adherents: {
        Args: { org_id: string }
        Returns: {
          active_projects: number
          activity_status: string
          availability_schedule: Json
          avatar_url: string
          bio: string
          cohort_year: number
          company: string
          completed_deliverables: number
          completion_rate: number
          email: string
          first_name: string
          job_title: string
          joined_at: string
          last_name: string
          last_payment_date: string
          linkedin_url: string
          location: string
          mentor_names: string[]
          monthly_credits_remaining: number
          next_payment_date: string
          organization_id: string
          payment_status: string
          phone: string
          program_type: string
          project_names: string[]
          purchased_credits_remaining: number
          subscription_amount: number
          subscription_days_overdue: number
          total_deliverables: number
          total_projects: number
          training_budget: number
          user_id: string
          user_role: string
          website: string
        }[]
      }
      get_organization_member_ids: {
        Args: { p_admin_user_id: string }
        Returns: {
          user_id: string
        }[]
      }
      get_organization_members: {
        Args: { org_id: string }
        Returns: {
          activity_status: string
          email: string
          first_name: string
          joined_at: string
          last_name: string
          membership_id: string
          project_count: number
          user_id: string
          user_role: string
        }[]
      }
      get_organization_mentors: {
        Args: { org_id: string }
        Returns: {
          active_assignments: number
          availability: Json
          avatar_url: string
          company: string
          completed_assignments: number
          created_at: string
          current_entrepreneurs: number
          email: string
          expertise: string[]
          first_name: string
          id: string
          job_title: string
          joined_at: string
          last_name: string
          location: string
          max_entrepreneurs: number
          max_projects: number
          mentor_bio: string
          mentor_linkedin_url: string
          organization_id: string
          phone: string
          profile_bio: string
          profile_linkedin_url: string
          rating: number
          recent_assignments: number
          status: string
          success_rate: number
          total_assignments: number
          total_entrepreneurs: number
          updated_at: string
          user_id: string
          user_role: string
          website: string
        }[]
      }
      get_organization_projects: {
        Args: { org_id: string }
        Returns: {
          created_at: string
          creator_email: string
          deliverables_count: number
          description: string
          id: string
          progress: number
          status: string
          title: string
        }[]
      }
      get_organization_stats: {
        Args: { org_id: string }
        Returns: Json
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
          id: string | null
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
          status_score_viabilite: string | null
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
      get_subscription_status: {
        Args: { org_id: string; user_id: string }
        Returns: {
          amount: number
          days_overdue: number
          is_active: boolean
          last_payment_date: string
          next_payment_date: string
          payment_status: string
        }[]
      }
      get_user_active_subscription: {
        Args: { p_user_id: string }
        Returns: {
          cancel_at_period_end: boolean
          current_period_end: string
          current_period_start: string
          status: string
          subscription_id: string
        }[]
      }
      get_user_admin_organizations: {
        Args: { p_user_id: string }
        Returns: {
          organization_id: string
        }[]
      }
      get_user_balance: {
        Args: { p_user_id: string }
        Returns: {
          monthly_credits: number
          purchased_credits: number
          total_credits: number
        }[]
      }
      get_user_credits_from_profiles: {
        Args: { p_user_id: string }
        Returns: Json
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
      increment_download_count: {
        Args: { resource_id: string }
        Returns: undefined
      }
      increment_tool_usage: {
        Args: { tool_id: string }
        Returns: undefined
      }
      increment_view_count: {
        Args: { resource_id: string }
        Returns: undefined
      }
      initialize_user_credits: {
        Args: { p_user_id: string }
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
      invite_collaborator: {
        Args: { p_email: string; p_project_id: string; p_role: string }
        Returns: Json
      }
      invite_collaborator_enhanced: {
        Args: { p_email: string; p_project_id: string; p_role: string }
        Returns: Json
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
      is_email_confirmed: {
        Args: Record<PropertyKey, never> | { p_user_id: string }
        Returns: boolean
      }
      is_organization_admin: {
        Args: { check_user_id: string; org_id: string }
        Returns: boolean
      }
      is_organization_member: {
        Args: { check_user_id: string; org_id: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: { p_user_id: string }
        Returns: boolean
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
      log_user_activity: {
        Args: {
          p_activity_type: string
          p_description?: string
          p_entity_id?: string
          p_entity_type?: string
          p_metadata?: Json
          p_organization_id: string
          p_user_id: string
        }
        Returns: string
      }
      map_ui_role_to_user_role: {
        Args: { ui_role: string }
        Returns: string
      }
      map_user_role_to_ui_role: {
        Args: { user_role: string }
        Returns: string
      }
      mark_subscription_paid: {
        Args: {
          p_amount?: number
          p_payment_date?: string
          p_payment_method?: string
          p_stripe_invoice_id?: string
          p_subscription_id: string
        }
        Returns: boolean
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
      process_accepted_invitations: {
        Args: { user_email: string; user_id: string }
        Returns: {
          projects_joined: number
        }[]
      }
      process_subscription_payment_success: {
        Args: { p_invoice_id?: string; p_stripe_subscription_id: string }
        Returns: boolean
      }
      remove_collaborator: {
        Args: { p_collaborator_id: string }
        Returns: Json
      }
      reset_credits_based_on_billing_cycle: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      reset_monthly_credits: {
        Args: { p_user_id: string }
        Returns: Json
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
      sync_user_metadata_to_profile: {
        Args: {
          p_email?: string
          p_first_name?: string
          p_last_name?: string
          p_location?: string
          p_phone?: string
          p_user_id: string
          p_user_role?: string
        }
        Returns: undefined
      }
      update_collaborator_role: {
        Args: { p_collaborator_id: string; p_new_role: string }
        Returns: Json
      }
      update_collaborator_status: {
        Args: { p_collaborator_id: string; p_new_status: string }
        Returns: Json
      }
      update_subscription_payment_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_subscription_status: {
        Args: {
          p_cancel_at_period_end?: boolean
          p_current_period_end?: string
          p_current_period_start?: string
          p_status: string
          p_stripe_subscription_id: string
        }
        Returns: boolean
      }
      update_user_avatar: {
        Args: { p_avatar_url: string; p_user_id: string }
        Returns: boolean
      }
      use_invitation_code_with_role_mapping: {
        Args: { p_code: string; p_user_id?: string }
        Returns: Json
      }
      user_has_project_access: {
        Args: { p_project_id: string } | { project_id: string; user_id: string }
        Returns: boolean
      }
      user_has_project_write_access: {
        Args: { p_project_id: string }
        Returns: boolean
      }
      validate_event_type_colors: {
        Args: { colors: Json }
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
      organization_plan: "free" | "starter" | "pro" | "max" | "custom"
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
      organization_plan: ["free", "starter", "pro", "max", "custom"],
      processing_status: ["pending", "processing", "summary", "livrable"],
      Statut: ["Formulaire Audit v1 remplit", "Attente retour Audit v1"],
    },
  },
} as const
