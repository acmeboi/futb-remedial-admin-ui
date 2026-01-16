import { useState } from 'react';
import { ProgramsManagement } from './ProgramsManagement';
import { StatesManagement } from './StatesManagement';
import { DocumentTypesManagement } from './DocumentTypesManagement';

type SettingsTab = 'programs' | 'states' | 'documents';

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('programs');

  const tabs = [
    { id: 'programs' as SettingsTab, name: 'Programs' },
    { id: 'states' as SettingsTab, name: 'States & LGAs' },
    { id: 'documents' as SettingsTab, name: 'Document Types' },
  ];

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Settings</h1>

      <div className="border-b border-gray-200 mb-4 sm:mb-6 overflow-x-auto">
        <nav className="-mb-px flex space-x-4 sm:space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm flex-shrink-0`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === 'programs' && <ProgramsManagement />}
        {activeTab === 'states' && <StatesManagement />}
        {activeTab === 'documents' && <DocumentTypesManagement />}
      </div>
    </div>
  );
}

