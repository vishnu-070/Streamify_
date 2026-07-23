import { Link } from 'react-router';
import { BellIcon, ShipWheelIcon, LogOutIcon, Palette } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLogout } from '../hooks/useLogout';
import { getAvatarUrl } from '../lib/avatars';

const THEMES = [
  'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate',
  'synthwave', 'retro', 'cyberpunk', 'valentine', 'halloween', 'garden',
  'forest', 'aqua', 'lofi', 'pastel', 'fantasy', 'wireframe', 'black',
  'luxury', 'dracula', 'cmyk', 'autumn', 'business', 'acid', 'lemonade',
  'night', 'coffee', 'winter', 'dim', 'nord', 'sunset',
];

const THEME_PREVIEW_COLORS = {
  light: ['#570df8', '#f000b8', '#37cdbe', '#3d4451'],
  dark: ['#661ae6', '#d926a9', '#1fb2a6', '#a6adba'],
  cupcake: ['#65c3c8', '#ef9fbc', '#eeaf3a', '#291334'],
  bumblebee: ['#e0a82e', '#f9d72f', '#181830', '#0d102b'],
  emerald: ['#66cc8a', '#377cfb', '#ea5234', '#333c4d'],
  corporate: ['#4b6bfb', '#7b92b2', '#67cba0', '#181a2a'],
  synthwave: ['#e779c1', '#58c7f3', '#f3cc30', '#2d1b69'],
  retro: ['#ef9900', '#dc2626', '#65c3c8', '#282425'],
  cyberpunk: ['#ff7598', '#75d1f0', '#c07eec', '#423f00'],
  pastel: ['#d1c1d7', '#f6cbd1', '#b4e9d6', '#70acc7'],
  fantasy: ['#6e0b75', '#007ebd', '#4ada89', '#1f2937'],
  wireframe: ['#b8b8b8', '#b8b8b8', '#b8b8b8', '#b8b8b8'],
  black: ['#343232', '#343232', '#343232', '#cdcdcd'],
  luxury: ['#ffffff', '#152747', '#513448', '#aaaaaa'],
  dracula: ['#ff79c6', '#bd93f9', '#ffb86c', '#f8f8f2'],
  cmyk: ['#45ade5', '#e8488a', '#ffe01b', '#00c2cb'],
  night: ['#38bdf8', '#818cf8', '#fb7185', '#94a3b8'],
};

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
              className="dropdown-content menu bg-base-200 border border-base-300 rounded-box w-56 shadow-2xl mt-2 p-2 max-h-80 overflow-y-auto z-50"
            >
              {THEMES.map((theme) => {
                const colors = THEME_PREVIEW_COLORS[theme] || ['#888', '#888', '#888', '#888'];
                return (
                  <li key={theme}>
                    <button
                      className={`flex items-center justify-between px-3 py-2 rounded-lg w-full ${
                        currentTheme === theme ? 'bg-base-300 font-medium' : 'hover:bg-base-300'
                      }`}
                      onClick={() => onThemeChange(theme)}
                    >
                      <span className="capitalize text-sm">{theme}</span>
                      <div className="flex gap-1">
                        {colors.slice(0, 4).map((color, i) => (
                          <span
                            key={i}
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </button>
                  </li>
                );
              })}
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
