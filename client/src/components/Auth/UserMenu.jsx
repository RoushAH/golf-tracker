import { useState } from 'react';
import { authService } from '../../services/auth';
import './UserMenu.css';

export default function UserMenu({ user }) {
  const [showMenu, setShowMenu] = useState(false);

  function handleSignOut() {
    if (confirm('Sign out? Your offline data will remain on this device.')) {
      authService.signOut();
    }
  }

  const displayName = user.name || user.username || 'User';
  const displayId = user.username || user.email || user.id;

  return (
    <div className="user-menu">
      <button
        className="user-avatar"
        onClick={() => setShowMenu(!showMenu)}
        title={displayId}
      >
        {user.picture ? (
          <img src={user.picture} alt={displayName} />
        ) : (
          <div className="avatar-placeholder">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      {showMenu && (
        <>
          <div className="menu-overlay" onClick={() => setShowMenu(false)} />
          <div className="menu-dropdown">
            <div className="menu-header">
              <div className="menu-name">{displayName}</div>
              <div className="menu-email">{displayId}</div>
            </div>
            <button className="menu-item sign-out-btn" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
