// src/config/passport.config.ts

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { User, UserRole } from '../models/user.model';
import OAuthAccount, { OAuthProvider } from '../models/oauth-account.model';
import { randomUUID } from 'crypto';

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email provided from Google'), undefined);
        }

        // Check if OAuth account exists
        let oauthAccount = await OAuthAccount.findOne({
          where: {
            provider: OAuthProvider.GOOGLE,
            provider_user_id: profile.id,
          },
        });

        let user: User | null = null;

        if (oauthAccount) {
          // OAuth account exists - get the user
          user = await User.findByPk(oauthAccount.user_id);
          if (!user) {
            return done(new Error('User not found for OAuth account'), undefined);
          }

          // Update last used
          await oauthAccount.update({ updated_at: new Date() });
        } else {
          // Check if user exists with this email
          user = await User.findOne({ where: { email } });

          if (!user) {
            // Create new user
            user = await User.create({
              email,
              password: randomUUID(), // Random password
              role: UserRole.USER,
              is_active: true,
              email_verified_at: new Date(),
            });
          }

          // Create OAuth account link
          oauthAccount = await OAuthAccount.create({
            user_id: user.id,
            provider: OAuthProvider.GOOGLE,
            provider_user_id: profile.id,
            provider_email: email,
          });
        }

        // Pass user info along with OAuth tokens
        (user as any).accessToken = accessToken;
        (user as any).refreshToken = refreshToken;

        return done(null, user);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL!,
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Get primary email from GitHub
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email provided from GitHub'), undefined);
        }

        // Check if OAuth account exists
        let oauthAccount = await OAuthAccount.findOne({
          where: {
            provider: OAuthProvider.GITHUB,
            provider_user_id: profile.id,
          },
        });

        let user: User | null = null;

        if (oauthAccount) {
          // OAuth account exists - get the user
          user = await User.findByPk(oauthAccount.user_id);
          if (!user) {
            return done(new Error('User not found for OAuth account'), undefined);
          }

          // Update last used
          await oauthAccount.update({ updated_at: new Date() });
        } else {
          // Check if user exists with this email
          user = await User.findOne({ where: { email } });

          if (!user) {
            // Create new user
            user = await User.create({
              email,
              password: randomUUID(), // Random password
              role: UserRole.USER,
              is_active: true,
              email_verified_at: new Date(),
            });
          }

          // Create OAuth account link
          oauthAccount = await OAuthAccount.create({
            user_id: user.id,
            provider: OAuthProvider.GITHUB,
            provider_user_id: profile.id,
            provider_email: email,
          });
        }

        // Pass user info along with OAuth tokens
        (user as any).accessToken = accessToken;
        (user as any).refreshToken = refreshToken;

        return done(null, user);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);

export default passport;
