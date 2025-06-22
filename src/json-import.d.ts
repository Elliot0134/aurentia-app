// Déclaration pour permettre l'import des fichiers JSON
declare module "*.json" {
  const value: any;
  export default value;
}
