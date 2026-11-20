const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./authentication/User');

const callbackURL = process.env.NODE_ENV === 'production'
  ? 'https://fintrackai.onrender.com/api/auth/google/callback'
  : 'http://localhost:8000/api/auth/google/callback';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL,
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value.toLowerCase().trim() : null;
      if (!email) {
        return done(new Error('No email found in Google profile'), null);
      }

      // Check if user already exists
      let user = await User.findOne({ email });
      
      if (user) {
        // PRE-HIJACKING MITIGATION:
        // If the account previously had a local password, clear it so an attacker
        // who registered the victim's email beforehand cannot retain password access.
        if (user.password) {
          console.warn(`[SECURITY] Clearing local password for ${email} upon verified Google OAuth link to prevent pre-hijacking.`);
          user.password = undefined;
        }

        user.googleId = profile.id;
        user.isVerified = true;
        if (user.status !== 'Inactive') {
          user.status = 'Active';
        }
        await user.save();
        return done(null, user);
      } else {
        // Create new user (Google verified, no local password set)
        user = new User({
          name: profile.displayName || email.split('@')[0],
          email: email,
          googleId: profile.id,
          isVerified: true,
          status: 'Active',
          role: 'user',
          plan: 'Basic'
        });
        
        await user.save();
        return done(null, user);
      }
    } catch (error) {
      console.error('Google auth strategy error:', error.message);
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
