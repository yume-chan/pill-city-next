import { IncomingMessage, ServerResponse } from 'http';
import { applySession, Session } from 'next-iron-session';

export default async function getSession(req: IncomingMessage, res: ServerResponse) {
  await applySession(req, res, { cookieName: 'session', password: process.env.IRON_PASSWORD! });
  return (req as any).session as Session;
}
