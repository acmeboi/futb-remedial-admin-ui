import { useState } from 'react';
import { useStates, useLgas } from '../../hooks/useStates';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import type { State, Lga } from '../../lib/types';

export function StatesManagement() {
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const { data: statesData } = useStates();
  const { data: lgasData } = useLgas(selectedStateId || undefined);

  const states = statesData?.['hydra:member'] || [];
  const lgas = lgasData?.['hydra:member'] || [];

  const stateColumns = [
    { header: 'ID', accessor: 'id' as keyof State },
    { header: 'Name', accessor: 'name' as keyof State },
    {
      header: 'Actions',
      accessor: (row: State) => (
        <button
          onClick={() => setSelectedStateId(row.id === selectedStateId ? null : row.id!)}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          {row.id === selectedStateId ? 'Hide LGAs' : 'View LGAs'}
        </button>
      ),
    },
  ];

  const lgaColumns = [
    { header: 'ID', accessor: 'id' as keyof Lga },
    { header: 'Name', accessor: 'name' as keyof Lga },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">States & LGAs Management</h2>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <Card title="States">
          <Table data={states} columns={stateColumns} />
        </Card>

        {selectedStateId && (
          <Card title={`LGAs for ${states.find(s => s.id === selectedStateId)?.name || 'Selected State'}`}>
            {lgas.length > 0 ? (
              <Table data={lgas} columns={lgaColumns} />
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No LGAs found</p>
            )}
          </Card>
        )}
      </div>

      {!selectedStateId && (
        <Card>
          <p className="text-sm text-gray-500 text-center py-4">
            Select a state to view its LGAs
          </p>
        </Card>
      )}
    </div>
  );
}

