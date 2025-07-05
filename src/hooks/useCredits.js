import { useState, useEffect } from 'react';

export const useCredits = () => {
  const [credits, setCredits] = useState(100); // Crédits initiaux pour demo
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      type: 'purchase',
      amount: 50,
      description: 'Achat de crédits - Pack Starter',
      date: new Date(Date.now() - 86400000 * 2), // Il y a 2 jours
      status: 'completed'
    },
    {
      id: 2,
      type: 'usage',
      amount: -12,
      description: 'Activation - Génération de contrats',
      date: new Date(Date.now() - 86400000), // Hier
      status: 'completed',
      automationId: 1
    }
  ]);

  // Vérifier si l'utilisateur a suffisamment de crédits
  const hasEnoughCredits = (amount) => {
    return credits >= amount;
  };

  // Déduire des crédits (pour activation d'automatisation)
  const deductCredits = async (amount, description, automationId = null) => {
    if (!hasEnoughCredits(amount)) {
      throw new Error(`Crédits insuffisants. Vous avez ${credits} crédits, ${amount} requis.`);
    }

    setLoading(true);
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 800));

      const newCredits = credits - amount;
      setCredits(newCredits);

      // Ajouter la transaction
      const transaction = {
        id: Date.now(),
        type: 'usage',
        amount: -amount,
        description,
        date: new Date(),
        status: 'completed',
        automationId
      };

      setTransactions(prev => [transaction, ...prev]);

      return { 
        success: true, 
        newBalance: newCredits,
        transaction 
      };
    } catch (error) {
      console.error('Erreur lors de la déduction des crédits:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Ajouter des crédits (pour achat)
  const addCredits = async (amount, description, paymentMethod = null) => {
    setLoading(true);
    try {
      // Simulation d'un appel API de paiement
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newCredits = credits + amount;
      setCredits(newCredits);

      // Ajouter la transaction
      const transaction = {
        id: Date.now(),
        type: 'purchase',
        amount,
        description,
        date: new Date(),
        status: 'completed',
        paymentMethod
      };

      setTransactions(prev => [transaction, ...prev]);

      return { 
        success: true, 
        newBalance: newCredits,
        transaction 
      };
    } catch (error) {
      console.error('Erreur lors de l\'ajout des crédits:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Obtenir l'historique des transactions
  const getTransactionHistory = (limit = null) => {
    return limit ? transactions.slice(0, limit) : transactions;
  };

  // Obtenir les statistiques des crédits
  const getCreditStats = () => {
    const totalSpent = transactions
      .filter(t => t.type === 'usage')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalPurchased = transactions
      .filter(t => t.type === 'purchase')
      .reduce((sum, t) => sum + t.amount, 0);

    const thisMonthSpent = transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        const now = new Date();
        return t.type === 'usage' && 
               transactionDate.getMonth() === now.getMonth() &&
               transactionDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      currentBalance: credits,
      totalSpent,
      totalPurchased,
      thisMonthSpent,
      transactionCount: transactions.length
    };
  };

  // Packs de crédits disponibles
  const creditPacks = [
    {
      id: 'small',
      name: 'Pack Découverte',
      credits: 25,
      price: 9.99,
      bonus: 0,
      popular: false,
      description: 'Parfait pour tester nos automatisations'
    },
    {
      id: 'medium',
      name: 'Pack Standard',
      credits: 50,
      price: 19.99,
      bonus: 5,
      popular: true,
      description: 'Le plus populaire pour un usage régulier'
    },
    {
      id: 'large',
      name: 'Pack Premium',
      credits: 100,
      price: 34.99,
      bonus: 15,
      popular: false,
      description: 'Pour les utilisateurs intensifs'
    },
    {
      id: 'enterprise',
      name: 'Pack Entreprise',
      credits: 250,
      price: 79.99,
      bonus: 50,
      popular: false,
      description: 'Solution complète pour les entreprises'
    }
  ];

  // Calculer le prix par crédit pour chaque pack
  const getPackValue = (pack) => {
    const totalCredits = pack.credits + pack.bonus;
    return (pack.price / totalCredits).toFixed(3);
  };

  // Obtenir le meilleur pack en termes de valeur
  const getBestValuePack = () => {
    return creditPacks.reduce((best, current) => {
      const bestValue = parseFloat(getPackValue(best));
      const currentValue = parseFloat(getPackValue(current));
      return currentValue < bestValue ? current : best;
    });
  };

  return {
    // État
    credits,
    loading,
    transactions,
    creditPacks,

    // Actions
    deductCredits,
    addCredits,
    hasEnoughCredits,

    // Utilitaires
    getTransactionHistory,
    getCreditStats,
    getPackValue,
    getBestValuePack,

    // Constantes
    minimumCredits: 5, // Minimum requis pour utiliser les automatisations
    lowCreditThreshold: 20 // Seuil pour afficher un avertissement
  };
};

export default useCredits;