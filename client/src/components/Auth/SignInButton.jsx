import { GoogleLogin } from '@react-oauth/google';
import { authService } from '../../services/auth';
import './SignInButton.css';

export default function SignInButton({ onSuccess }) {
  async function handleSuccess(credentialResponse) {
    try {
      const user = await authService.signInWithGoogle(credentialResponse.credential);
      if (onSuccess) {
        onSuccess(user);
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      alert('Failed to sign in. Please try again.');
    }
  }

  function handleError() {
    console.error('Google Sign-In failed');
    alert('Failed to sign in with Google. Please try again.');
  }

  return (
    <div className="sign-in-button">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false}
        theme="outline"
        size="large"
        text="continue_with"
      />
    </div>
  );
}
