import React, { useState } from 'react';
import { Plus, MessageCircle, Phone, Search, Filter } from 'lucide-react';

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: Search,
      label: 'Quick Search',
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => console.log('Quick search')
    },
    {
      icon: Filter,
      label: 'Advanced Filter',
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => console.log('Advanced filter')
    },
    {
      icon: MessageCircle,
      label: 'Chat Support',
      color: 'bg-green-500 hover:bg-green-600',
      action: () => console.log('Chat support')
    },
    {
      icon: Phone,
      label: 'Call Agent',
      color: 'bg-orange-500 hover:bg-orange-600',
      action: () => console.log('Call agent')
    }
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Action buttons */}
      <div className={`flex flex-col space-y-3 mb-4 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        {actions.map((action, index) => (
          <div key={index} className="flex items-center space-x-3">
            <span className="bg-white text-slate-700 px-3 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap">
              {action.label}
            </span>
            <button
              onClick={action.action}
              className={`w-12 h-12 ${action.color} text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110`}
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <action.icon className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fab ${isOpen ? 'rotate-45' : ''} transition-transform duration-300`}
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
};

export default FloatingActionButton;