import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import { getDatabase, saveDatabase } from '../db/schema.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    if (!CLIENT_ID) {
      return res.status(500).json({ error: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID environment variable.' });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    const db = await getDatabase();
    const now = Date.now();

    // Check if user exists
    const result = db.exec(
      'SELECT id, google_id, email, name, picture FROM users WHERE google_id = ?',
      [googleId]
    );

    let userId;
    let user;

    if (result.length > 0 && result[0].values.length > 0) {
      // Existing user - update last login
      const row = result[0].values[0];
      userId = row[0];
      user = {
        id: row[0],
        google_id: row[1],
        email: row[2],
        name: row[3],
        picture: row[4]
      };

      db.run(
        'UPDATE users SET last_login_at = ? WHERE id = ?',
        [now, userId]
      );
    } else {
      // New user - create account
      userId = uuidv4();
      user = {
        id: userId,
        google_id: googleId,
        email,
        name,
        picture
      };

      db.run(
        'INSERT INTO users (id, google_id, email, name, picture, created_at, last_login_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, googleId, email, name, picture, now, now]
      );
    }

    saveDatabase();

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const db = await getDatabase();
    const result = db.exec(
      'SELECT id, google_id, email, name, picture FROM users WHERE id = ?',
      [userId]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const row = result[0].values[0];
    const user = {
      id: row[0],
      google_id: row[1],
      email: row[2],
      name: row[3],
      picture: row[4]
    };

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
