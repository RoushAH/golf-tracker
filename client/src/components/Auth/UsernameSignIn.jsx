import { useState } from 'react';
import { authService } from '../../services/auth';
import './UsernameSignIn.css';

export default function UsernameSignIn({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();

    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await authService.signIn(username.trim());
      if (onSuccess) {
        onSuccess(user);
      }
    } catch (err) {
      console.error('Sign in failed:', err);
      setError('Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="username-signin" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="username">Choose a username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          disabled={loading}
          autoFocus
          autoComplete="off"
        />
        <p className="form-hint">
          Pick any name - no password needed. Your data will be saved to this username.
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button type="submit" className="btn-signin" disabled={loading || !username.trim()}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
