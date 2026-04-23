/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import CheckIn from './pages/CheckIn';
import Crew from './pages/Crew';
import CrewLocations from './pages/CrewLocations';
import DailyReports from './pages/DailyReports';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Home from './pages/Home';
import Inbox from './pages/Inbox';
import MaterialUsageReport from './pages/MaterialUsageReport';
import MobileReceiptUpload from './pages/MobileReceiptUpload';
import MyProfile from './pages/MyProfile';
import PasswordReset from './pages/PasswordReset';
import Payroll from './pages/Payroll';
import ProjectDetails from './pages/ProjectDetails';
import Projects from './pages/Projects';
import ReceiptUploads from './pages/ReceiptUploads';
import Reports from './pages/Reports';
import SafetyMeetings from './pages/SafetyMeetings';
import TimeApproval from './pages/TimeApproval';
import TimeCards from './pages/TimeCards';
import Users from './pages/Users';
import resetPassword from './pages/reset-password';
import __Layout from './Layout.jsx';


export const PAGES = {
    "CheckIn": CheckIn,
    "Crew": Crew,
    "CrewLocations": CrewLocations,
    "DailyReports": DailyReports,
    "Dashboard": Dashboard,
    "Expenses": Expenses,
    "Home": Home,
    "Inbox": Inbox,
    "MaterialUsageReport": MaterialUsageReport,
    "MobileReceiptUpload": MobileReceiptUpload,
    "MyProfile": MyProfile,
    "PasswordReset": PasswordReset,
    "Payroll": Payroll,
    "ProjectDetails": ProjectDetails,
    "Projects": Projects,
    "ReceiptUploads": ReceiptUploads,
    "Reports": Reports,
    "SafetyMeetings": SafetyMeetings,
    "TimeApproval": TimeApproval,
    "TimeCards": TimeCards,
    "Users": Users,
    "reset-password": resetPassword,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};