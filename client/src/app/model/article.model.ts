
export interface Article {
  id: number;
  sourceName: string;
  url: string;
  title: string;
  text: string;
  lastUpdated: Date;
  scrapedAt: Date;
  spiderName: string;
  parseFunction: string;
  result: string;
  error: string;
  errorDetails: string;
}
