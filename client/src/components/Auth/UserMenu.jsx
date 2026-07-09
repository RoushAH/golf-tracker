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

  return (
    <div className="user-menu">
      <button
        className="user-avatar"
        onClick={() => setShowMenu(!showMenu)}
        title={user.email}
      >
        {user.picture ? (
          <img src={user.picture} alt={user.name || user.email} />
        ) : (
          <div className="avatar-placeholder">
            {(user.name || user.email).charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      {showMenu && (
        <>
          <div className="menu-overlay" onClick={() => setShowMenu(false)} />
          <div className="menu-dropdown">
            <div className="menu-header">
              <div className="menu-name">{user.name || 'User'}</div>
              <div className="menu-email">{user.email}</div>
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
