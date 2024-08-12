import sessionCheck from '@/middlewares/session';
import WordModel from '@/models/word';
import connectToDB from '@/server/db';
import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
const cheerio = require('cheerio');

export interface Word {
  word: string;
  meaning: string;
  examples?: string[];
  partOfSpeech: string;
  synonyms?: string[];
  antonyms?: string[];
}

async function fetchFromDictionaryAPI(word: string) {
  try {
    const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    return response.data;
  } catch (error) {
    return null;
  }
}

async function fetchFromWeb(word: string) {
  try {
    const url = `https://www.dictionary.com/browse/${word}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    // Check if the response status is OK
    if (response.status !== 200) {
      throw new Error(`Failed to fetch data, status code: ${response.status}`);
    }

    const $ = cheerio.load(response.data);

    // Extract the word text
    const wordText = $(`.elMfuCTjKMwxtSEEnUsi`).first().text().trim();

    // Extract the part of speech and clean up the text
    const rawPartOfSpeech = $(`.S3nX0leWTGgcyInfTEbW`).first().text().trim();
    // Example regex to extract a common POS pattern like "noun", "verb", etc.
    const partOfSpeechMatch = rawPartOfSpeech.match(
      /\b(noun|verb|adjective|adverb|pronoun|preposition|conjunction|interjection)\b/i
    );
    const partOfSpeech = partOfSpeechMatch ? partOfSpeechMatch[0].toLowerCase() : '';

    // Extract the definition (first occurrence)
    const definitionElement = $(`.NZKOFkdkcvYgD3lqOIJw`).first();
    const definition = definitionElement.length > 0 ? definitionElement.text().trim() : '';

    // Extract all examples
    const examples: string[] = [];
    $(`.dkA1ih27tI9o0MHLDxKt p`).each((i: number, elem: any) => {
      const exampleText = $(elem).text().trim();
      if (exampleText) {
        examples.push(exampleText);
      }
    });

    return {
      word: wordText,
      partOfSpeech,
      definition,
      examples,
    };
  } catch (error) {
    return {
      word: '',
      partOfSpeech: '',
      definition: '',
      examples: [],
    };
  }
}

async function fetchAndCombineData(word: string): Promise<Word | null> {
  try {
    const [apiData, webData] = await Promise.all([fetchFromDictionaryAPI(word), fetchFromWeb(word)]);

    if (apiData && apiData.length > 0) {
      const wordData = apiData[0];
      const firstMeaning = wordData.meanings[0];

      const combinedExamples = [
        ...webData.examples,
        ...firstMeaning.definitions.flatMap((def: any) => (def.example ? [def.example] : [])),
      ];
      const combinedDefinition = webData.definition || firstMeaning.definitions[0]?.definition;

      const shapedWord: Word = {
        word: webData.word || wordData.word,
        meaning: combinedDefinition,
        partOfSpeech: webData.partOfSpeech || firstMeaning.partOfSpeech,
        examples: combinedExamples,
        synonyms: wordData.synonyms || [],
        antonyms: wordData.antonyms || [],
      };

      return shapedWord;
    } else {
      return null;
    }
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
