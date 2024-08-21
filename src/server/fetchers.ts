import axios from 'axios';
const cheerio = require('cheerio');

interface Word {
  word: string;
  meaning: string;
  examples?: string[];
  partOfSpeech: string;
  synonyms?: string[];
  antonyms?: string[];
}

export async function fetchFromDictionaryAPI(word: string): Promise<Word> {
  try {
    const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const apiData = response.data[0];

    const firstMeaning = apiData.meanings[0] || {
      definitions: [],
      partOfSpeech: '',
    };

    return {
      word: apiData.word,
      meaning: firstMeaning.definitions[0]?.definition || '',
      examples: firstMeaning.definitions.flatMap((def: any) => (def.example ? [def.example] : [])),
      partOfSpeech: firstMeaning.partOfSpeech || '',
      synonyms: apiData.synonyms || [],
      antonyms: apiData.antonyms || [],
    };
  } catch (error) {
    return {
      word: '',
      meaning: '',
      examples: [],
      partOfSpeech: '',
      synonyms: [],
      antonyms: [],
    };
  }
}

export async function fetchFromWeb(word: string): Promise<Word> {
  try {
    const url = `https://www.dictionary.com/browse/${word}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const $ = cheerio.load(response.data);
    const wordText = $(`.elMfuCTjKMwxtSEEnUsi`).first().text().trim();

    const rawPartOfSpeech = $(`.S3nX0leWTGgcyInfTEbW`).first().text().trim();
    const partOfSpeechMatch = rawPartOfSpeech.match(
      /\b(noun|verb|adjective|adverb|pronoun|preposition|conjunction|interjection)\b/i
    );
    const partOfSpeech = partOfSpeechMatch ? partOfSpeechMatch[0].toLowerCase() : '';

    const definitionElements = $(`.NZKOFkdkcvYgD3lqOIJw`);
    const meaning = definitionElements
      .filter((index: Number, element: any) => $(element).find('div').text().trim().length > 0)
      .first()
      .text()
      .trim()
      .replace(':', '');

    const examples: string[] = [];
    $(`.dkA1ih27tI9o0MHLDxKt p`).each((i: Number, elem: any) => {
      const exampleText = $(elem).text().trim();
      if (exampleText) examples.push(exampleText);
    });

    return {
      word: wordText || '',
      meaning,
      examples,
      partOfSpeech,
      synonyms: [],
      antonyms: [],
    };
  } catch (error) {
    return {
      word: '',
      meaning: '',
      examples: [],
      partOfSpeech: '',
      synonyms: [],
      antonyms: [],
    };
  }
}
