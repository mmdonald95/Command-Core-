import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext.jsx';
import { hasPermission, hasRole } from '@/lib/roles.js';

const Welcome = lazy(() => import('@/pages/Welcome.jsx'));
const SignIn = lazy(() => import('@/pages/SignIn.jsx'));
const Dashboard = lazy(() => import('@/pages/Dashboard.jsx'));
const CompanySelector = lazy(() => import('@/pages/CompanySelector.jsx'));
const VerifyCompanySignIn = lazy(() => import('@/pages/VerifyCompanySignIn.jsx'));
const Onboarding = lazy(() => import('@/pages/Onboarding.jsx'));
const DemoMode = lazy(() => import('@/pages/DemoMode.jsx'));
const NewProject = lazy(() => import('@/pages/NewProject.jsx'));
const ProjectDetails = lazy(() => import('@/pages/ProjectDetails.jsx'));
const EditProject = lazy(() => import('@/pages/EditProject.jsx'));
const ProjectDailyReports = lazy(() => import('@/pages/ProjectDailyReports.jsx'));
const NewDailyReport = lazy(() => import('@/pages/NewDailyReport.jsx'));
const NewDailyReportPhoto = lazy(() => import('@/pages/NewDailyReportPhoto.jsx'));
const ProjectTimeTracking = lazy(() => import('@/pages/ProjectTimeTracking.jsx'));
const NewTimeEntry = lazy(() => import('@/pages/NewTimeEntry.jsx'));
const Employees = lazy(() => import('@/pages/Employees.jsx'));
const NewEmployee = lazy(() => import('@/pages/NewEmployee.jsx'));
const EmployeeDetails = lazy(() => import('@/pages/EmployeeDetails.jsx'));
const EditEmployee = lazy(() => import('@/pages/EditEmployee.jsx'));
const ProjectEmployees = lazy(() => import('@/pages/ProjectEmployees.jsx'));
const ProjectPhotos = lazy(() => import('@/pages/ProjectPhotos.jsx'));
const NewProjectPhoto = lazy(() => import('@/pages/NewProjectPhoto.jsx'));
const Equipment = lazy(() => import('@/pages/Equipment.jsx'));
const NewEquipment = lazy(() => import('@/pages/NewEquipment.jsx'));
const EquipmentDetails = lazy(() => import('@/pages/EquipmentDetails.jsx'));
const EditEquipment = lazy(() => import('@/pages/EditEquipment.jsx'));
const ProjectEquipmentOperations = lazy(() => import('@/pages/ProjectEquipmentOperations.jsx'));
const ProjectVehicleOperations = lazy(() => import('@/pages/ProjectVehicleOperations.jsx'));
const Project811Tracking = lazy(() => import('@/pages/Project811Tracking.jsx'));
const ProjectMaterialInventory = lazy(() => import('@/pages/ProjectMaterialInventory.jsx'));
const ProjectMapProgress = lazy(() => import('@/pages/ProjectMapProgress.jsx'));
const ProjectUpToDateReports = lazy(() => import('@/pages/ProjectUpToDateReports.jsx'));
const ProjectPermits = lazy(() => import('@/pages/ProjectPermits.jsx'));
const ProjectBlueprints = lazy(() => import('@/pages/ProjectBlueprints.jsx'));
const ProjectSafetyMeetings = lazy(() => import('@/pages/ProjectSafetyMeetings.jsx'));
const ProjectVoiceNotes = lazy(() => import('@/pages/ProjectVoiceNotes.jsx'));
const TimeCards = lazy(() => import('@/pages/TimeCards.jsx'));
const TimeApproval = lazy(() => import('@/pages/TimeApproval.jsx'));
const Management = lazy(() => import('@/pages/Management.jsx'));

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-600">Loading...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <FullScreenLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/SignIn" replace />;
  }

  return children;
}

function RoleProtectedRoute({ children, allowedRoles, permissionKey }) {
  const { isAuthenticated, isLoadingAuth, profile, user, company } = useAuth();

  if (isLoadingAuth) {
    return <FullScreenLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/SignIn" replace />;
  }

  const context = { profile, user, company };
  const allowedByRole = Array.isArray(allowedRoles) ? hasRole(context, allowedRoles) : true;
  const allowedByPermission = permissionKey ? hasPermission(context, permissionKey) : true;

  if (!allowedByRole || !allowedByPermission) {
    return <Navigate to="/Dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<FullScreenLoader />}>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/Welcome" element={<Welcome />} />
            <Route path="/SignIn" element={<SignIn />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/demo" element={<DemoMode />} />
            <Route path="/DemoMode" element={<DemoMode />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/Onboarding" element={<Onboarding />} />
            <Route path="/verify-company-signin" element={<VerifyCompanySignIn />} />

            <Route
              path="/CompanySelector"
              element={
                <ProtectedRoute>
                  <CompanySelector />
                </ProtectedRoute>
              }
            />

            <Route
              path="/Dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/employees"
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'manager']} permissionKey="manage_employees">
                  <Employees />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/employees/new"
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'manager']} permissionKey="manage_employees">
                  <NewEmployee />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/employees/:employeeId"
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'manager']} permissionKey="manage_employees">
                  <EmployeeDetails />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/employees/:employeeId/edit"
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'manager']} permissionKey="manage_employees">
                  <EditEmployee />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/equipment"
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'manager']} permissionKey="manage_equipment">
                  <Equipment />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/equipment/new"
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'manager']} permissionKey="manage_equipment">
                  <NewEquipment />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/equipment/:equipmentId"
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'manager']} permissionKey="manage_equipment">
                  <EquipmentDetails />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/equipment/:equipmentId/edit"
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'manager']} permissionKey="manage_equipment">
                  <EditEquipment />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/projects/new"
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'manager']} permissionKey="manage_projects">
                  <NewProject />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/projects/:projectId"
              element={
                <ProtectedRoute>
                  <ProjectDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects/:projectId/job-progress"
              element={
                <ProtectedRoute>
                  <ProjectDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects/:projectId/811-tracking"
              element={
                <ProtectedRoute>
                  <Project811Tracking />
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects/:projectId/materials"
              element={
                <ProtectedRoute>
                  <ProjectMaterialInventory />
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects/:projectId/map-progress"
              element={
                <ProtectedRoute>
                  <ProjectMapProgress />
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects/:projectId/safety-meetings"
              element={
                <ProtectedRoute>
                  <ProjectSafetyMeetings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects/:projectId/permits"
              element={
                <ProtectedRoute>
                  <ProjectPermits />
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects/:projectId/blueprints"
              element={
                <ProtectedRoute>
                  <ProjectBlueprints />
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects/:projectId/voice-notes"
              element={
                <ProtectedRoute>
                  <ProjectVoiceNotes />
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects/:projectId/equipment"
              element={
                <ProtectedRoute>
                  <ProjectEquipmentOperations />
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects/:projectId/vehicles"
              element={
                <ProtectedRoute>
                  <ProjectVehicleOperations />
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects/:projectId/edit"
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'manager']} permissionKey="manage_projects">
                  <EditProject />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/projects/:projectId/employees"
              element={
                <ProtectedRoute>
                  <ProjectEmployees />
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects/:projectId/photos"
              element={
                <ProtectedRoute>
                  <ProjectPhotos />
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects/:projectId/photos/new"
              element={
                <ProtectedRoute>
                  <NewProjectPhoto />
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects/:projectId/daily-reports"
              element={
                <ProtectedRoute>
                  <ProjectDailyReports />
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects/:projectId/reports"
              element={
                <ProtectedRoute>
                  <ProjectUpToDateReports />
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects/:projectId/daily-reports/new"
              element={
                <ProtectedRoute>
                  <NewDailyReport />
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects/:projectId/daily-reports/:reportId/photos/new"
              element={
                <ProtectedRoute>
                  <NewDailyReportPhoto />
                </ProtectedRoute>
              }
            />

            <Route
              path="/management"
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'manager']} permissionKey="manage_company_workspace">
                  <Management />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/timecards"
              element={
                <RoleProtectedRoute allowedRoles={['admin']} permissionKey="manage_timecards">
                  <TimeCards />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/time-approval"
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'manager']} permissionKey="approve_time">
                  <TimeApproval />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/projects/:projectId/time-tracking"
              element={
                <ProtectedRoute>
                  <ProjectTimeTracking />
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects/:projectId/time-tracking/new"
              element={
                <ProtectedRoute>
                  <NewTimeEntry />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
