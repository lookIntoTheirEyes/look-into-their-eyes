import { Language } from "../model/language";
import heroesData from "@/books/heroes.json";
import commentsData from "@/books/comments.json";
import familiesData from "@/books/families.json";
import { IPage } from "../model/book";
import { getImageUrl } from "./utils";

const BOOK_NO_CONTENT_PAGES = 3;

const heroes = heroesData as BookPage[];

export function getAllHeroes() {
  return heroes;
}

export interface BookPage {
  id: number;
  en: PageDetails;
  he: PageDetails;
  imageUrls?: string[];
}

interface PageDetails {
  name: string;
  description: string;
  longDescription?: string;
}

export function getHeroId(page: number) {
  return (+page - BOOK_NO_CONTENT_PAGES + 1).toString();
}

export async function getHero(page: string, lang: Language) {
  page = page == "2" ? "3" : page;
  const heroId = getHeroId(+page);
  const heroDetails = heroes.find(({ id }) => id === +heroId);
  const hero = heroDetails?.[lang];

  if (!hero) {
    throw new Error(`hero not found - page - ${page}, heroId - ${heroId}`);
  }

  const { name, description, longDescription } = hero;

  const imageUrls = (heroDetails.imageUrls || []).map((url) =>
    getImageUrl(url)
  );
  return {
    name,
    description,
    longDescription,
    imageUrls,
  };
}

export function getAllPages(lang: Language, type: DataType): IPage[] {
  const pages = getData(type).map((page) => {
    const { name: title, description, longDescription } = page[lang];
    return {
      id: page.id,
      title,
      description,
      longDescription,
      imageUrl: getImageUrl(page.imageUrls?.[0]),
    };
  });

  return pages;
}

function getData(type: DataType): BookPage[] {
  if (type === "family") {
    return familiesData;
  }

  if (type === "visitor") {
    return commentsData;
  }

  return heroesData;
}

type DataType = "family" | "visitor" | "heroes";
