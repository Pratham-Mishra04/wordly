import Word from '@/models/word';
import connectToDB from '@/server/db';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  success: boolean;
  data?: any;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { method } = req;
  const { wid } = req.query;

  const user = req.session?.user;
  if (!user) return res.status(403).json({ success: false, error: 'You are not logged in' });

  await connectToDB();

  switch (method) {
    case 'GET':
      try {
        const words = wid ? await Word.findById(wid) : await Word.find({});
        if (!words) {
          return res.status(404).json({ success: false, error: 'Word not found' });
        }
        res.status(200).json({ success: true, data: words });
      } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
      }
      break;

    case 'POST':
      try {
        const word = new Word(req.body);
        await word.save();
        res.status(201).json({ success: true, data: word });
      } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
      }
      break;

    case 'PATCH':
      try {
        if (!wid) {
          return res.status(400).json({ success: false, error: 'Word ID is required' });
        }
        const word = await Word.findByIdAndUpdate(wid, req.body, { new: true });
        if (!word) {
          return res.status(404).json({ success: false, error: 'Word not found' });
        }
        res.status(200).json({ success: true, data: word });
      } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
      }
      break;

    case 'DELETE':
      try {
        if (!wid) {
          return res.status(400).json({ success: false, error: 'Word ID is required' });
        }
        const word = await Word.findByIdAndDelete(wid);
        if (!word) {
          return res.status(404).json({ success: false, error: 'Word not found' });
        }
        res.status(200).json({ success: true, data: word });
      } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
      }
      break;

    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}
