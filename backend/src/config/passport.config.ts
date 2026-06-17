// src/config/passport.config.ts
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';

const baseUrl = process.env.APP_URL || 'http://localhost:3000';

// ==================== Google OAuth Strategy ====================
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${baseUrl}/api/auth/google/callback`,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email provided from Google'), undefined);
        }

        // Pass the user info along with tokens
        const user = {
          id: profile.id,
          email: email,
          displayName: profile.displayName,
          photos: profile.photos,
          accessToken: accessToken,
          refreshToken: refreshToken,
        };

        return done(null, user);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);

// ==================== GitHub OAuth Strategy ====================
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: `${baseUrl}/api/auth/github/callback`,
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email provided from GitHub'), undefined);
        }

        const user = {
          id: profile.id,
          email: email,
          displayName: profile.displayName || profile.username,
          photos: profile.photos,
          accessToken: accessToken,
          refreshToken: refreshToken,
        };

        return done(null, user);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);

// ==================== Serialization ====================
passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((obj: any, done) => {
  done(null, obj);
});

console.log('✅ Passport strategies registered: google, github');

export default passport;
