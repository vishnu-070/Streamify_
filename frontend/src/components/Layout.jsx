import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children, showSidebar = false, onThemeChange, currentTheme }) => {
  return (
    <div className="min-h-screen flex">
      {showSidebar && <Sidebar />}
      <div className="flex-1 flex flex-col">
        <Navbar onThemeChange={onThemeChange} currentTheme={currentTheme} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
