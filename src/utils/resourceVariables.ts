/**
 * Utility functions for dynamic variables in resources
 * Support variables like {{nom_organisation}}, {{nom_membre}}, etc.
 */

export interface VariableContext {
  nom_organisation?: string;
  nom_membre?: string;
  email_membre?: string;
  date_actuelle?: string;
  annee_actuelle?: string;
  [key: string]: string | undefined;
}

/**
 * Replace all variables in a text with their actual values
 * @param text Text containing variables like {{variable_name}}
 * @param context Object containing variable values
 * @returns Text with variables replaced
 */
export function replaceVariables(text: string, context: VariableContext): string {
  if (!text) return text;

  // Add default variables
  const fullContext: VariableContext = {
    date_actuelle: new Date().toLocaleDateString('fr-FR'),
    annee_actuelle: new Date().getFullYear().toString(),
    ...context,
  };

  // Replace all {{variable}} patterns
  return text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
    const trimmedName = variableName.trim();
    return fullContext[trimmedName] || match; // Keep original if not found
  });
}

/**
 * Extract all variables used in a text
 * @param text Text containing variables
 * @returns Array of variable names found
 */
export function extractVariables(text: string): string[] {
  if (!text) return [];

  const variables: string[] = [];
  const regex = /\{\{([^}]+)\}\}/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const variableName = match[1].trim();
    if (!variables.includes(variableName)) {
      variables.push(variableName);
    }
  }

  return variables;
}

/**
 * Get available variables with their descriptions
 */
export function getAvailableVariables(): Array<{ name: string; description: string; example: string }> {
  return [
    {
      name: 'nom_organisation',
      description: 'Nom de l\'organisation',
      example: 'Mon Entreprise SAS'
    },
    {
      name: 'nom_membre',
      description: 'Nom du membre consultant la ressource',
      example: 'Jean Dupont'
    },
    {
      name: 'email_membre',
      description: 'Email du membre',
      example: 'jean.dupont@example.com'
    },
    {
      name: 'date_actuelle',
      description: 'Date du jour',
      example: new Date().toLocaleDateString('fr-FR')
    },
    {
      name: 'annee_actuelle',
      description: 'Année en cours',
      example: new Date().getFullYear().toString()
    }
  ];
}

/**
 * Validate if a variable name is valid
 */
export function isValidVariableName(name: string): boolean {
  // Variable names should only contain letters, numbers, and underscores
  return /^[a-z_][a-z0-9_]*$/i.test(name);
}

/**
 * Format a variable for display in the UI
 */
export function formatVariable(name: string): string {
  return `{{${name}}}`;
}
