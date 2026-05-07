import React from 'react';
import { ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import './DataTable.css';

const DataTable = ({ columns, data, pagination, onPageChange }) => {
  return (
    <div className="data-table-container">
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index} style={{ width: col.width }}>{col.header}</th>
              ))}
              <th className="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                <td className="actions-column">
                  <button className="action-btn">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {pagination && (
        <div className="pagination">
          <div className="pagination-info">
            Showing <span>{(pagination.currentPage - 1) * pagination.pageSize + 1}</span> to <span>{Math.min(pagination.currentPage * pagination.pageSize, pagination.total)}</span> of <span>{pagination.total}</span> entries
          </div>
          <div className="pagination-controls">
            <button 
              disabled={pagination.currentPage === 1}
              onClick={() => onPageChange(pagination.currentPage - 1)}
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: Math.ceil(pagination.total / pagination.pageSize) }).map((_, i) => (
              <button 
                key={i}
                className={pagination.currentPage === i + 1 ? 'active' : ''}
                onClick={() => onPageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button 
              disabled={pagination.currentPage === Math.ceil(pagination.total / pagination.pageSize)}
              onClick={() => onPageChange(pagination.currentPage + 1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
