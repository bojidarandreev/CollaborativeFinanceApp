import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useAuthStore } from './store/authStore';
import AccountsPage from './pages/AccountsPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import TransactionsPage from './pages/TransactionsPage';
import CategoriesPage from './pages/CategoriesPage';
import BudgetsPage from './pages/BudgetsPage';
import GroupsPage from './pages/GroupsPage';
import AiAdvisorPage from './pages/AiAdvisorPage';
import Layout from './components/layout/Layout';

// A component to protect routes that require authentication
const ProtectedRoute = () => {
  const { session } = useAuth();

  // Using Outlet to render child routes if authenticated
  // Using Navigate to redirect if not authenticated
  return session ? <Outlet /> : <Navigate to="/login" replace />;
};

// A component to redirect authenticated users away from login/signup
const AuthRedirect = () => {
    const { session } = useAuth();
    return session ? <Navigate to="/" replace /> : <Outlet />;
}

function App() {
  const { isInitialized } = useAuthStore()

  // This will show a loading state while the session is being fetched.
  if (!isInitialized) {
    return <div>Loading application...</div>
  }

  return (
    <Router>
      <Routes>
        {/* Public routes that redirect if logged in */}
        <Route element={<AuthRedirect />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/budgets" element={<BudgetsPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/ai-advisor" element={<AiAdvisorPage />} />
            {/* Add other protected routes here */}
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
