# Google OAuth Setup

To enable user sign-in with Google, you'll need to set up a Google OAuth 2.0 client.

## Steps

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it "Golf Tracker" (or any name you prefer)
4. Click "Create"

### 2. Enable Google+ API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and click "Enable"

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" (unless you have a Google Workspace)
   - App name: "Golf Tracker"
   - User support email: your email
   - Developer contact: your email
   - Click "Save and Continue"
   - Skip scopes (default is fine)
   - Add your email as a test user
   - Click "Save and Continue"

4. Back to "Create OAuth client ID":
   - Application type: "Web application"
   - Name: "Golf Tracker Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - `http://YOUR_MACHINE_IP:5173` (replace with your actual IP for phone access)
   - Authorized redirect URIs:
     - `http://localhost:5173`
     - `http://YOUR_MACHINE_IP:5173`
   - Click "Create"

5. Copy your **Client ID** (it looks like `xxxxx.apps.googleusercontent.com`)

### 4. Configure Your App

#### Server Configuration

1. In the root folder, create a `.env` file:
   ```bash
   GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
   ```

#### Client Configuration

2. In the `client/` folder, create a `.env` file:
   ```bash
   VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
   ```

### 5. Restart the App

Stop and restart the app with `start.bat`. The "Sign In" button should now work!

## Usage

- **Without Sign In**: Data is saved locally on your device only
- **With Sign In**: Data is synced to the server and accessible from any device where you sign in with the same Google account

## Troubleshooting

### "Sign-in failed" error
- Make sure your Client ID is correct in both `.env` files
- Make sure you added your machine's IP to "Authorized JavaScript origins" in Google Cloud Console
- Clear your browser cache and try again

### "origin_mismatch" error
- The URL you're accessing the app from isn't in the "Authorized JavaScript origins" list
- Add it in Google Cloud Console → Credentials → Your OAuth client → Edit

## Security Note

- Keep your `.env` files private (they're already in `.gitignore`)
- Never commit your Client ID to a public repository
- The Client ID itself isn't highly sensitive, but it's best practice to keep it private
