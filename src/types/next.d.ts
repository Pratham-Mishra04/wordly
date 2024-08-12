import { DefaultSession } from 'next-auth';

declare module 'next' {
  interface NextApiRequest {
    session: DefaultSession;
  }
}
