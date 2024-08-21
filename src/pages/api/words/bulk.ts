import sessionCheck from '@/middlewares/session';
import WordModel from '@/models/word';
import connectToDB from '@/server/db';
import { fetchFromDictionaryAPI, fetchFromWeb } from '@/server/fetchers';
import type { NextApiRequest, NextApiResponse } from 'next';

export interface Word {
  word: string;
  meaning: string;
  examples?: string[];
  partOfSpeech: string;
  synonyms?: string[];
  antonyms?: string[];
}

async function fetchAndCombineData(word: string): Promise<Word | null> {
  try {
    const [apiData, webData] = await Promise.all([fetchFromDictionaryAPI(word), fetchFromWeb(word)]);

    if (!apiData.word && !webData.word) return null;

    const combinedExamples = [...(webData.examples || []), ...(apiData.examples || [])];

    return {
      word,
      meaning: webData.meaning || apiData.meaning,
      partOfSpeech: webData.partOfSpeech || apiData.partOfSpeech,
      examples: combinedExamples,
      synonyms: apiData.synonyms || [],
      antonyms: apiData.antonyms || [],
    };
  } catch (error) {
    return null;
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { words }: { words: string[] } = req.body;

    if (!Array.isArray(words) || words.length === 0) {
      return res.status(400).json({ success: false, error: 'No words provided' });
    }

    await connectToDB();

    const savedWords: Word[] = [];
    const failedWords: string[] = [];

    try {
      const wordPromises = words.map(async word => {
        const shapedWord = await fetchAndCombineData(word);
        if (shapedWord) {
          try {
            const word = await WordModel.findOneAndUpdate(
              { userId: req.session.user.id, word: shapedWord.word },
              shapedWord,
              {
                upsert: true,
                new: true,
              }
            );
            savedWords.push(word);
          } catch (dbError) {
            failedWords.push(word);
          }
        } else {
          failedWords.push(word);
        }
      });

      await Promise.all(wordPromises);

      res.status(200).json({
        success: true,
        savedWords,
        failedWords,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error processing words', savedWords, failedWords });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default sessionCheck(handler);
