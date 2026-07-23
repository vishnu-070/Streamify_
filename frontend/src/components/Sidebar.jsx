import { Link, useLocation } from 'react-router';
import { BellIcon, HomeIcon, UsersIcon, ShipWheelIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getAvatarUrl } from '../lib/avatars';

const Sidebar = () => {
  const { authUser } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: '/', icon: HomeIcon, label: 'Home' },
    { to: '/friends', icon: UsersIcon, label: 'Friends' },
    { to: '/notifications', icon: BellIcon, label: 'Notifications' },
  ];

  return (
    <aside className="w-64 bg-base-200 border-r border-base-300 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-5 border-b border-base-300">
        <Link to="/" className="flex items-center gap-2.5">
          <ShipWheelIcon className="size-9 text-primary" />
          <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
            Streamify
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navLinks.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200 ${
                isActive
                  ? 'bg-neutral text-primary font-bold'
                  : 'text-base-content/70 hover:bg-neutral/40 hover:text-base-content'
              }`}
            >
              <Icon className="size-5 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User profile at bottom */}
      {authUser && (
        <div className="p-4 border-t border-base-300">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 rounded-full">
                <img src={getAvatarUrl(authUser.profilePic, authUser.fullName)} alt={authUser.fullName} />
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{authUser.fullName}</p>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-success"></span>
                Online
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
