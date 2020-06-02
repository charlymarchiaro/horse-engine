
export class ArticleSource {
  id: string;
  name: string;
  country: string;
  url: string;
  category: string;
  tier: number;
  reach: number;
  adValueBase: number;
  adValue500: number;
  adValue300: number;
  adValue180: number;
  adValue100: number;

  constructor(r: ArticleSourceResponse) {
    this.id = r.id;
    this.name = r.name;
    this.country = r.country;
    this.url = r.url;
    this.category = r.category;
    this.tier = parseInt(r.tier, 10);
    this.reach = parseInt(r.reach, 10);
    this.adValueBase = parseInt(r.adValueBase, 10);
    this.adValue500 = parseInt(r.adValue500, 10);
    this.adValue300 = parseInt(r.adValue300, 10);
    this.adValue180 = parseInt(r.adValue180, 10);
    this.adValue100 = parseInt(r.adValue100, 10);
  }
}


export interface ArticleSourceResponse {
  id: string;
  name: string;
  country: string;
  url: string;
  category: string;
  tier: string;
  reach: string;
  adValueBase: string;
  adValue500: string;
  adValue300: string;
  adValue180: string;
  adValue100: string;
}

