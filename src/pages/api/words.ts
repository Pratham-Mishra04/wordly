import sessionCheck from '@/middlewares/session';
import Word from '@/models/word';
import connectToDB from '@/server/db';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  success: boolean;
  data?: any;
  error?: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { method } = req;
  const { wid } = req.query;

  await connectToDB();

  switch (method) {
    case 'GET':
      try {
        const words = wid
          ? await Word.findById(wid)
          : await Word.find({ userId: req.session.user.id }).sort({ created_at: -1 });
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
        const word = new Word({
          userId: req.session.user.id,
          word: req.body.word,
          meaning: req.body.meaning,
          examples: req.body.examples,
          partOfSpeech: req.body.partOfSpeech,
          synonyms: req.body.synonyms,
          antonyms: req.body.antonyms,
        });
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
        const word = await Word.findOneAndUpdate({ userId: req.session.user.id, _id: wid }, req.body, { new: true });
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
        const word = await Word.findOneAndDelete({ userId: req.session.user.id, _id: wid });
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

export default sessionCheck(handler);
