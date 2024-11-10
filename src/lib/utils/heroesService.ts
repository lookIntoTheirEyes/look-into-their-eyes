import { Language } from "../model/language";

const heroes: Hero[] = [
  {
    id: 1,
    en: {
      name: "Inbar Haiman",
      description: "We miss her",
      longDescription:
        "There isn't a lot we can say that will explain how much we miss her",
    },
    he: {
      name: "ענבר היימן",
      description: "אנחנו מתגעגעים אליה מאוד",
      longDescription: "אין דרך אפילו לתאר עד כמה שיש לנו געגוע עצום",
    },
  },
  {
    id: 2,
    en: {
      name: "itzhak Elgarat",
      description: "We miss him",
      longDescription:
        "There isn't a lot we can say that will explain how much we miss him",
    },
    he: {
      name: "יצחק איציק אלגרט",
      description: "אנחנו מתגעגעים אליו מאוד",
      longDescription: "אין דרך אפילו לתאר עד כמה שיש לנו געגוע עצום",
    },
  },
];

export function getAllHeroes() {
  return heroes;
}

interface Hero {
  id: number;
  en: HeroDetails;
  he: HeroDetails;
}

interface HeroDetails {
  name: string;
  description: string;
  longDescription: string;
}

export function getHeroId(page: number) {
  return (+page - 1).toString();
}

export async function getHero(page: string, lang: Language) {
  const heroId = getHeroId(+page);
  const hero = heroes.find(({ id }) => id === +heroId)?.[lang];

  if (!hero) {
    throw Error("hero not found");
  }

  const { name, description, longDescription } = hero;

  return { name, description, longDescription };
}

export function getAllPages(lang: Language) {
  const heroes = getAllHeroes().map((hero) => {
    const { name: title, description, longDescription } = hero[lang];
    return { title, description, longDescription };
  });

  return lang === Language.he ? heroes.reverse() : heroes;
}

export function getFrontPage(lang: Language) {
  return lang === Language.he
    ? { title: "הסוף", description: "", longDescription: "" }
    : { title: "My Story", description: "", longDescription: "" };
}

export function getBackPage(lang: Language) {
  return lang === Language.he
    ? { title: "הסיפור שלנו", description: "", longDescription: "" }
    : { title: "This is the last page", description: "", longDescription: "" };
}

export interface Page {
  title: string;
  description: string;
  longDescription: string;
}
