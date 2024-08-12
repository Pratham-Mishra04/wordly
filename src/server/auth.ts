import User from '@/models/user';
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import connectToDB from './db';

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: 'https://accounts.google.com/o/oauth2/v2/auth?response_type=code',
    }),
  ],
  secret: process.env.SECRET || '',
  callbacks: {
    signIn: async ({ user }) => {
      try {
        await connectToDB();
        const dbUser = await User.findOne({ email: user.email });
        if (!dbUser) {
          const newUser = new User({ name: user.name, email: user.email, image: user.image });
          await newUser.save();
        }
        return true;
      } catch {
        return false;
      }
    },

    session: async ({ session }) => {
      await connectToDB();
      const user = await User.findOne({ email: session.user.email });
      return {
        ...session,
        user: {
          ...session.user,
          id: user?.id,
        },
      };
    },
  },
};

export default authOptions;
