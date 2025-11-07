export interface DeliverableDefinition {
  whatIsIt: string;
  whyCrucial: string[];
  whenToUse: string;
  whatGoodContains: string[];
  commonPitfalls: Array<{
    mistake: string;
    solution: string;
  }>;
}

export type DeliverableType =
  | 'persona_express_b2c'
  | 'persona_express_b2b'
  | 'persona_express_organismes'
  | 'pitch'
  | 'concurrence'
  | 'marche'
  | 'proposition_valeur'
  | 'business_model'
  | 'ressources_requises'
  | 'vision_mission'
  | 'mini_swot'
  | 'cadre_juridique'
  | 'ma_success_story';
