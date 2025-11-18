import { Users, UserCheck, Clock, FolderOpen, TrendingUp, Activity } from 'lucide-react';

const CollaboratorStats = ({ stats, loading = false }) => {
  const statsCards = [
    {
      title: 'Total Collaborateurs',
      value: stats?.total || 0,
      icon: Users,
      color: 'text-blue-600',
      iconBg: 'bg-blue-50',
      description: 'Nombre total de collaborateurs'
    },
    {
      title: 'Collaborateurs Actifs',
      value: stats?.active || 0,
      icon: UserCheck,
      color: 'text-green-600',
      iconBg: 'bg-green-50',
      description: 'Collaborateurs actuellement actifs'
    },
    {
      title: 'Invitations en Attente',
      value: stats?.pending || 0,
      icon: Clock,
      color: 'text-yellow-600',
      iconBg: 'bg-yellow-50',
      description: 'Invitations non acceptées'
    },
    {
      title: 'Projets Collaboratifs',
      value: stats?.collaborativeProjects || 0,
      icon: FolderOpen,
      color: 'text-purple-600',
      iconBg: 'bg-purple-50',
      description: 'Projets avec des collaborateurs'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="card-static animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="card-static relative overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
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
              </div>

              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${stat.iconBg} ${stat.color} transition-transform hover:scale-105`}>
                <Icon size={24} />
              </div>
            </div>

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
          </div>
        );
      })}
    </div>
  );
};

export default CollaboratorStats;
