import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const CompanyContext = createContext();

export const CompanyProvider = ({ children }) => {
  const [company, setCompany] = useState(null);
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      setIsLoadingCompany(true);
      const user = await base44.auth.me();
      
      if (user?.company_id) {
        const companyData = await base44.entities.Company.get(user.company_id);
        setCompany(companyData);
      }
    } catch (error) {
      console.error('Failed to load company:', error);
    } finally {
      setIsLoadingCompany(false);
    }
  };

  const switchCompany = async (companyId) => {
    try {
      const companyData = await base44.entities.Company.get(companyId);
      setCompany(companyData);
      localStorage.setItem('selected_company_id', companyId);
    } catch (error) {
      console.error('Failed to switch company:', error);
    }
  };

  const getTerminology = (key) => {
    return company?.custom_terminology?.[key] || getDefaultTerminology(key);
  };

  const getDefaultTerminology = (key) => {
    const defaults = {
      project_term: 'Project',
      task_term: 'Task',
      crew_term: 'Crew',
      material_term: 'Material',
      equipment_term: 'Equipment',
    };
    return defaults[key] || key;
  };

  return (
    <CompanyContext.Provider value={{
      company,
      isLoadingCompany,
      loadCompany,
      switchCompany,
      getTerminology,
    }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within CompanyProvider');
  }
  return context;
};