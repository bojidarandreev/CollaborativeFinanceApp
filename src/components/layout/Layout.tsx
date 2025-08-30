import { NavLink, Outlet } from "react-router-dom";
import { Button } from "../ui/button";

const Layout = () => {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 p-4 border-r">
        <h2 className="text-xl font-bold mb-4">Finance App</h2>
        <nav className="flex flex-col space-y-2">
          <Button asChild variant="ghost">
            <NavLink to="/" end>Dashboard</NavLink>
          </Button>
          <Button asChild variant="ghost">
            <NavLink to="/accounts">Accounts</NavLink>
          </Button>
          <Button asChild variant="ghost">
            <NavLink to="/transactions">Transactions</NavLink>
          </Button>
          <Button asChild variant="ghost">
            <NavLink to="/categories">Categories</NavLink>
          </Button>
          <Button asChild variant="ghost">
            <NavLink to="/budgets">Budgets</NavLink>
          </Button>
          <Button asChild variant="ghost">
            <NavLink to="/groups">Groups</NavLink>
          </Button>
          <Button asChild variant="ghost">
            <NavLink to="/ai-advisor">AI Advisor</NavLink>
          </Button>
          {/* Add other nav links here */}
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
