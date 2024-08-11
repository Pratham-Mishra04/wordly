export interface Word {
    _id: string;
    word: string;
    meaning: string;
    examples: string[];
    created_at: Date;
  }
  
  export interface Quiz {
    _id: string;
    score: number;
    length: number;
    created_at: Date;
  }
  
  export interface Option {
    value: string;
    isCorrect: boolean;
  }
  
  export interface Question {
    question: string;
    options: string[];
    correctAnswer:string;
  }
  
  export interface QuizResponse {
    questions: Question[];
  }
  
  export interface QuestionResult {
    question: string;
    correctAnswer: string;
    selectedAnswer: string;
    isCorrect: boolean;
  }
  
  export interface QuizResult {
    score: number;
    correctCount: number;
    incorrectCount: number;
    date: string;
    questions: QuestionResult[];
  }
  