import React, { useState } from 'react';
import './App.css';
import HealthForm from './components/HealthForm';
import Dashboard from './components/Dashboard';
import Header from './components/Header';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [refreshDashboard, setRefreshDashboard] = useState(0);
  const [editRecord, setEditRecord] = useState(null);

  const handleFormSuccess = () => {
    setActiveView('dashboard');
    setRefreshDashboard(prev => prev + 1);
    setEditRecord(null);
  };

  const handleEdit = (record) => {
    setEditRecord(record);
    setActiveView('add');
  };

  const handleCancel = () => {
    setActiveView('dashboard');
    setEditRecord(null);
  };

  return (
    <div className="App">
      <Header activeView={activeView} setActiveView={setActiveView} />
      
      <main className="main-content">
        {activeView === 'dashboard' && (
          <Dashboard 
            key={refreshDashboard}
            onAddNew={() => {
              setEditRecord(null);
              setActiveView('add');
            }}
            onEdit={handleEdit}
          />
        )}
        
        {activeView === 'add' && (
          <HealthForm 
            editRecord={editRecord}
            onSuccess={handleFormSuccess}
            onCancel={handleCancel}
          />
        )}
      </main>
    </div>
  );
}

export default App;
