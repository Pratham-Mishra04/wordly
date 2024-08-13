import sessionCheck from '@/middlewares/session';
import Word from '@/models/word';
import connectToDB from '@/server/db';
import moment from 'moment-timezone';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  success: boolean;
  data?: Record<string, number>;
  error?: string;
};

const timezone = 'Asia/Kolkata';

const calculateTimestampRange = (timestamp: string): { start: moment.Moment | null; end: moment.Moment | null } => {
  switch (timestamp) {
    case 'today':
      return { start: moment.tz(timezone).startOf('day'), end: moment.tz(timezone).endOf('day') };
    case 'yesterday':
      return {
        start: moment.tz(timezone).subtract(1, 'days').startOf('day'),
        end: moment.tz(timezone).subtract(1, 'days').endOf('day'),
      };
    case 'last 3 days':
      return { start: moment.tz(timezone).subtract(3, 'days').startOf('day'), end: moment.tz(timezone).endOf('day') };
    case 'last week':
      return { start: moment.tz(timezone).subtract(7, 'days').startOf('day'), end: moment.tz(timezone).endOf('day') };
    case 'last month':
      return {
        start: moment.tz(timezone).subtract(1, 'months').startOf('day'),
        end: moment.tz(timezone).endOf('day'),
      };
    case 'all time':
    default:
      return { start: null, end: null };
  }
};

async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { method } = req;

  await connectToDB();

  switch (method) {
    case 'GET':
      try {
        const timestamps = ['today', 'yesterday', 'last 3 days', 'last week', 'last month', 'all time'];

        const counts = await Promise.all(
          timestamps.map(async timestamp => {
            const { start, end } = calculateTimestampRange(timestamp);

            const query: Record<string, any> = { userId: req.session.user.id };

            if (start && end) {
              query.created_at = {
                $gte: start.toDate(),
                $lt: end.toDate(),
              };
            }

            const count = await Word.countDocuments(query);
            return { timestamp, count };
          })
        );

        const data = counts.reduce((acc, { timestamp, count }) => {
          acc[timestamp] = count;
          return acc;
        }, {} as Record<string, number>);

        res.status(200).json({ success: true, data });
      } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
      }
      break;

    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}

export default sessionCheck(handler);
