import { Language } from "../model/language";
import heroesData from "@/books/heroes.json";
import { Page } from "../model/book";
import { getImageUrl } from "./utils";

const BOOK_NO_CONTENT_PAGES = 3;

const heroes = heroesData as Hero[];

export function getAllHeroes() {
  return heroes;
}

if (heroes.length % 2 === 0) {
  throw new Error("Heroes amount must be uneven due to styling issues");
}

interface Hero {
  id: number;
  en: HeroDetails;
  he: HeroDetails;
  imageUrls: string[];
}

interface HeroDetails {
  name: string;
  description: string;
  longDescription: string;
}

export function getHeroId(page: number) {
  return (+page - BOOK_NO_CONTENT_PAGES + 1).toString();
}

export async function getHero(page: string, lang: Language) {
  const heroId = getHeroId(+page);
  const heroDetails = heroes.find(({ id }) => id === +heroId);
  const hero = heroDetails?.[lang];

  if (!hero) {
    throw new Error("hero not found");
  }

  const { name, description, longDescription } = hero;

  const imageUrls = heroDetails.imageUrls.map((url) => getImageUrl(url));
  return {
    name,
    description,
    longDescription,
    imageUrls,
  };
}

export function getAllPages(lang: Language): Page[] {
  const pages = heroes.map((hero) => {
    const { name: title, description, longDescription } = hero[lang];
    return {
      title,
      description,
      longDescription,
      imageUrl: getImageUrl(hero.imageUrls[0]),
    };
  });

  return pages;
}
