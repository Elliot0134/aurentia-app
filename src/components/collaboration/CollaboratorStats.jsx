import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, Clock, FolderOpen, TrendingUp, Activity } from 'lucide-react';

const CollaboratorStats = ({ stats, loading = false }) => {
  const statsCards = [
    {
      title: 'Total Collaborateurs',
      value: stats?.total || 0,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      description: 'Nombre total de collaborateurs'
    },
    {
      title: 'Collaborateurs Actifs',
      value: stats?.active || 0,
      icon: UserCheck,
      color: 'bg-green-50 text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
      description: 'Collaborateurs actuellement actifs'
    },
    {
      title: 'Invitations en Attente',
      value: stats?.pending || 0,
      icon: Clock,
      color: 'bg-yellow-50 text-yellow-600',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      description: 'Invitations non acceptées'
    },
    {
      title: 'Projets Collaboratifs',
      value: stats?.collaborativeProjects || 0,
      icon: FolderOpen,
      color: 'bg-purple-50 text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
      description: 'Projets avec des collaborateurs'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <Card 
            key={stat.title}
            className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 ${stat.bgColor} border-0 animate-slide-up`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    {stat.title === 'Collaborateurs Actifs' && stats?.total > 0 && (
                      <span className="text-sm text-gray-500">
                        /{stats.total}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {stat.description}
                  </p>
                </div>
                
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${stat.color} transition-transform hover:scale-110`}>
                  <Icon size={24} />
                </div>
              </div>

              {/* Indicateur de progression pour les collaborateurs actifs */}
              {stat.title === 'Collaborateurs Actifs' && stats?.total > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Taux d'activité</span>
                    <span>{Math.round((stats.active / stats.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(stats.active / stats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Indicateur pour les invitations en attente */}
              {stat.title === 'Invitations en Attente' && stat.value > 0 && (
                <div className="mt-3 flex items-center text-xs text-yellow-600">
                  <Activity size={12} className="mr-1" />
                  <span>Nécessite une action</span>
                </div>
              )}

              {/* Tendance pour les projets collaboratifs */}
              {stat.title === 'Projets Collaboratifs' && stat.value > 0 && (
                <div className="mt-3 flex items-center text-xs text-purple-600">
                  <TrendingUp size={12} className="mr-1" />
                  <span>Collaboration active</span>
                </div>
              )}
            </CardContent>

            {/* Effet de brillance au survol */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-10 transform -skew-x-12 transition-all duration-700 hover:translate-x-full"></div>
          </Card>
        );
      })}
    </div>
  );
};

export default CollaboratorStats;
