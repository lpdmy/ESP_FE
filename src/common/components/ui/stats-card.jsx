import React from 'react';
import { cn } from '@/lib/utils';

const StatsCard = ({ title, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    blue: 'text-blue-600',
    red: 'text-red-600', 
    green: 'text-green-600',
    gray: 'text-gray-600',
    orange: 'text-orange-600'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className={cn("h-8 w-8", colorClasses[color] || colorClasses.blue)} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {trend && (
            <p className="text-xs text-gray-500 mt-1">{trend}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
