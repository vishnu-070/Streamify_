import { Link } from 'react-router';
import { BellIcon, ShipWheelIcon, LogOutIcon, Palette } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLogout } from '../hooks/useLogout';
import { getAvatarUrl } from '../lib/avatars';

const CURATED_THEMES = [
  { id: 'emerald', name: 'Emerald Green', color: '#10B981' },
  { id: 'night', name: 'Ocean Blue', color: '#3B82F6' },
  { id: 'dracula', name: 'Royal Purple', color: '#8B5CF6' },
  { id: 'bumblebee', name: 'Autumn Gold', color: '#F59E0B' },
  { id: 'sunset', name: 'Sunset Rose', color: '#EF4444' },
  { id: 'dark', name: 'Charcoal Dark', color: '#1F2937' },
  { id: 'light', name: 'Classic Light', color: '#F3F4F6' },
];

const Navbar = ({ onThemeChange, currentTheme }) => {
  const { authUser } = useAuth();
  const { logout } = useLogout();

  return (
    <header className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 flex items-center justify-between w-full">
        {/* Logo (mobile only) */}
        <Link to="/" className="flex items-center gap-2.5 lg:hidden">
          <ShipWheelIcon className="size-7 text-primary" />
          <span className="text-xl font-bold font-mono text-primary">Streamify</span>
        </Link>

        {/* Right side controls */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Notifications */}
          <Link to="/notifications" className="btn btn-ghost btn-circle btn-sm">
            <BellIcon className="size-5 text-base-content/70" />
          </Link>

          {/* Theme Picker */}
          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-ghost btn-circle btn-sm">
              <Palette className="size-5 text-base-content/70" />
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-200 border border-base-300 rounded-box w-56 shadow-2xl mt-2 p-2 z-50 space-y-1"
            >
              <div className="px-3 py-1.5 text-xs font-semibold text-base-content/50 uppercase tracking-wider text-left">
                Select Theme Color
              </div>
              {CURATED_THEMES.map((theme) => (
                <li key={theme.id}>
                  <button
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg w-full ${
                      currentTheme === theme.id ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-base-300'
                    }`}
                    onClick={() => onThemeChange(theme.id)}
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-base-content/10 shrink-0 shadow-inner"
                      style={{ backgroundColor: theme.color }}
                    />
                    <span className="text-sm font-medium">{theme.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Avatar */}
          {authUser && (
            <div className="avatar">
              <div className="w-9 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1">
                <img src={getAvatarUrl(authUser.profilePic, authUser.fullName)} alt={authUser.fullName} />
              </div>
            </div>
          )}

          {/* Logout */}
          <button onClick={logout} className="btn btn-ghost btn-circle btn-sm" title="Logout">
            <LogOutIcon className="size-5 text-base-content/70" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
