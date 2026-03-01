import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy-client-id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret',
    callbackURL: "/api/auth/google/callback"
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ where: { googleId: profile.id } });

            if (!user) {
                // Check if user with same email exists
                const email = profile.emails?.[0]?.value;
                if (email) {
                    user = await User.findOne({ where: { email } });
                    if (user) {
                        // Link google ID to existing user
                        user.googleId = profile.id;
                        await user.save();
                    } else {
                        // Create new user
                        user = await User.create({
                            email,
                            firstName: profile.name?.givenName || 'New',
                            lastName: profile.name?.familyName || 'User',
                            googleId: profile.id,
                            role: 'customer',
                            status: 'active',
                            passwordHash: '' // No password for social login
                        });
                    }
                }
            }

            if (!user) return done(null, false);
            return done(null, user);
        } catch (error) {
            return done(error as Error, undefined);
        }
    }
));

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: any, done) => {
    try {
        const user = await User.findByPk(id);
        if (!user) return done(null, false);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
