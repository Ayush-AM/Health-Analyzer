import React, { useState, useEffect } from 'react';
import { healthAPI } from '../services/api';
import HealthRecordCard from './HealthRecordCard';
import SearchBar from './SearchBar';
import HealthStats from './HealthStats';
import './Dashboard.css';

const Dashboard = ({ onAddNew, onEdit }) => {
  const [healthRecords, setHealthRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 6;

  useEffect(() => {
    loadHealthRecords();
    loadStats();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [healthRecords, searchTerm, sortBy, sortOrder]);

  const loadHealthRecords = async () => {
    try {
      setLoading(true);
      const response = await healthAPI.getAll({
        limit: 100, // Load more records for client-side filtering
        sortBy,
        order: sortOrder
      });
      setHealthRecords(response.data || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load health records');
      setHealthRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await healthAPI.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const filterRecords = () => {
    let filtered = [...healthRecords];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.bmi.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'age':
          aValue = a.age;
          bValue = b.age;
          break;
        case 'bmi':
          aValue = a.bmi.value;
          bValue = b.bmi.value;
          break;
        case 'healthScore':
          aValue = a.healthScore;
          bValue = b.healthScore;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

    setFilteredRecords(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleDelete = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this health record?')) {
      try {
        await healthAPI.delete(recordId);
        setHealthRecords(prev => prev.filter(record => record._id !== recordId));
        loadStats(); // Refresh stats after deletion
      } catch (err) {
        setError(err.message || 'Failed to delete health record');
      }
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading health records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h1>Health Records Dashboard</h1>
          <p className="dashboard-subtitle">
            Manage and monitor health records with comprehensive analytics
          </p>
        </div>
        <button 
          className="btn btn-primary add-record-btn"
          onClick={onAddNew}
        >
          <span className="btn-icon">➕</span>
          Add New Record
        </button>
      </div>

      {stats && <HealthStats stats={stats} />}

      <div className="dashboard-controls">
        <SearchBar onSearch={handleSearch} />
        
        <div className="sort-controls">
          <label htmlFor="sort-select">Sort by:</label>
          <select 
            id="sort-select"
            value={sortBy} 
            onChange={(e) => handleSort(e.target.value)}
            className="sort-select"
          >
            <option value="createdAt">Date Created</option>
            <option value="name">Name</option>
            <option value="age">Age</option>
            <option value="bmi">BMI</option>
            <option value="healthScore">Health Score</option>
          </select>
          
          <button 
            className="sort-order-btn"
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="records-info">
        <p>
          Showing {currentRecords.length} of {filteredRecords.length} records
          {searchTerm && ` (filtered by "${searchTerm}")`}
        </p>
      </div>

      {currentRecords.length > 0 ? (
        <div className="records-grid">
          {currentRecords.map(record => (
            <HealthRecordCard
              key={record._id}
              record={record}
              onDelete={() => handleDelete(record._id)}
              onEdit={() => onEdit(record)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          {healthRecords.length === 0 ? (
            <div className="empty-content">
              <div className="empty-icon">🏥</div>
              <h3>No Health Records Found</h3>
              <p>Start by creating your first health record to track your health journey.</p>
              <button 
                className="btn btn-primary"
                onClick={onAddNew}
              >
                Add First Record
              </button>
            </div>
          ) : (
            <div className="empty-content">
              <div className="empty-icon">🔍</div>
              <h3>No Records Match Your Search</h3>
              <p>Try adjusting your search terms or filters.</p>
              <button 
                className="btn btn-secondary"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          
          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                className={`pagination-number ${currentPage === number ? 'active' : ''}`}
                onClick={() => paginate(number)}
              >
                {number}
              </button>
            ))}
          </div>
          
          <button
            className="pagination-btn"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
