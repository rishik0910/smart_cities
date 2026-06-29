import Sidebar from './Sidebar';
import DesktopTopbar from './DesktopTopbar';
 
export default function CitizenShell({ children }) {
  return (
    <>
      <Sidebar />
      <div className="citizen-shell-main">
        <DesktopTopbar />
        <div className="citizen-shell-content">{children}</div>
      </div>
    </>
  );
}
