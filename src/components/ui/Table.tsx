import { ReactNode, useState } from 'react';
import { Collapse } from 'antd';

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  keyExtractor?: (row: T) => string | number;
  collapsible?: boolean; // Enable collapsible mobile view
}

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
}

export function Table<T extends { id?: string | number }>({
  data,
  columns,
  onRowClick,
  keyExtractor = (row) => row.id || Math.random(),
  collapsible = false,
}: TableProps<T>) {
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  // Get the header value for the collapse panel (SN and Name)
  const getHeaderValue = (row: T) => {
    const firstColumn = columns[0];
    const secondColumn = columns[1];
    
    // Get SN (first column - usually ID)
    let sn = '';
    if (firstColumn) {
      if (typeof firstColumn.accessor === 'function') {
        sn = String(firstColumn.accessor(row));
      } else {
        sn = String(row[firstColumn.accessor] ?? '');
      }
    }
    
    // Get Name (second column - usually Name or Applicant)
    let name = '';
    if (secondColumn) {
      if (typeof secondColumn.accessor === 'function') {
        name = String(secondColumn.accessor(row));
      } else {
        name = String(row[secondColumn.accessor] ?? '');
      }
    }
    
    // Return formatted: "SN. Name" or just "SN" if no name
    if (sn && name) {
      return `${sn}. ${name}`;
    } else if (sn) {
      return sn;
    } else if (name) {
      return name;
    }
    return `Item ${keyExtractor(row)}`;
  };

  const handlePanelChange = (keys: string | string[]) => {
    const keysArray = Array.isArray(keys) ? keys : [keys];
    setActiveKeys(keysArray);
  };

  const handleRowClick = (row: T) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.className || ''
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 sm:px-4 md:px-6 py-4 text-center text-gray-500 text-sm">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={() => handleRowClick(row)}
                  className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                >
                  {columns.map((column, idx) => (
                    <td
                      key={idx}
                      className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 ${
                        column.className || ''
                      }`}
                    >
                      {typeof column.accessor === 'function'
                        ? column.accessor(row)
                        : String(row[column.accessor] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm bg-white rounded-lg shadow">
            No data available
          </div>
        ) : collapsible ? (
          // Collapsible Accordion View
          <Collapse
            accordion
            activeKey={activeKeys}
            onChange={handlePanelChange}
            items={data.map((row) => {
              const rowKey = String(keyExtractor(row));
              return {
                key: rowKey,
                label: (
                  <div 
                    className="flex items-center justify-between pr-4"
                    onClick={(e) => {
                      // Allow clicking on the row content to navigate
                      if (onRowClick && e.target === e.currentTarget) {
                        handleRowClick(row);
                      }
                    }}
                  >
                    <span className="font-medium text-gray-900 truncate flex-1">
                      {getHeaderValue(row)}
                    </span>
                    {onRowClick && (
                      <span 
                        className="text-primary-600 text-xs ml-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(row);
                        }}
                      >
                        View →
                      </span>
                    )}
                  </div>
                ),
                children: (
                  <div 
                    className={`space-y-2 ${onRowClick ? 'cursor-pointer' : ''}`}
                    onClick={() => handleRowClick(row)}
                  >
                    {columns.slice(2).map((column, idx) => (
                      <div key={idx} className="flex flex-col gap-1 py-1 border-b border-gray-100 last:border-0">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {column.header}
                        </span>
                        <span className="text-sm text-gray-900 break-words">
                          {typeof column.accessor === 'function'
                            ? column.accessor(row)
                            : String(row[column.accessor] ?? '')}
                        </span>
                      </div>
                    ))}
                  </div>
                ),
              };
            })}
            className="bg-white rounded-lg shadow"
          />
        ) : (
          // Regular Card View (non-collapsible)
          <div className="space-y-3">
            {data.map((row) => (
              <div
                key={keyExtractor(row)}
                onClick={() => handleRowClick(row)}
                className={`bg-white rounded-lg shadow p-4 space-y-2 ${
                  onRowClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
                }`}
              >
                {columns.map((column, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {column.header}
                    </span>
                    <span className="text-sm text-gray-900 break-words">
                      {typeof column.accessor === 'function'
                        ? column.accessor(row)
                        : String(row[column.accessor] ?? '')}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

