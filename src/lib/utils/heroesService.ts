import { Language } from "../model/language";

const heroes: Hero[] = [
  {
    id: 1,
    imageUrls: [
      "v1731313087/456207074_3815139565409372_4521394713267543061_n_euu2qs.jpg",
      "v1731240476/Screen-Shot-2023-10-25-at-1.59.37-PM-e1698231614287-640x400_smp4xr.png",
    ],
    en: {
      name: "Inbar Haiman",
      description: "We miss her",
      longDescription:
        "There isn't a lot we can say that will explain how much we miss her",
    },
    he: {
      name: "ענבר היימן",
      description: "אנחנו מתגעגעים אליה מאוד",
      longDescription: "אין דרך אפילו לתאר עד כמה עצום הגעגוע",
    },
  },
  {
    id: 2,
    imageUrls: [
      "v1731240549/449519894_122166290984079173_8342929443094545662_n.jpg_rpeskl.jpg",
    ],
    en: {
      name: "Itzhak Elgarat",
      description: "We miss him",
      longDescription:
        "There isn't a lot we can say that will explain how much we miss him",
    },
    he: {
      name: "יצחק איציק אלגרט",
      description: "אנחנו מתגעגעים אליו מאוד",
      longDescription: "אין דרך אפילו לתאר עד כמה עצום הגעגוע",
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
  imageUrls: string[];
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
  const heroDetails = heroes.find(({ id }) => id === +heroId);
  const hero = heroDetails?.[lang];

  if (!hero) {
    throw Error("hero not found");
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

export function getAllPages(lang: Language) {
  const heroes = getAllHeroes().map((hero) => {
    const { name: title, description, longDescription } = hero[lang];
    return {
      title,
      description,
      longDescription,
      imageUrl: getImageUrl(hero.imageUrls[0]),
    };
  });

  return lang === Language.he ? heroes.reverse() : heroes;
}

export function getFrontPage(lang: Language) {
  return lang === Language.he
    ? { title: "הסוף", description: "", longDescription: "" }
    : {
        title: "Between the 6th and the 7th of October",
        author: "Benzi Brofman",
        description: "",
        longDescription: "",
      };
}

export function getBackPage(lang: Language) {
  return lang === Language.he
    ? {
        title: "בין השישי לשביעי באוקטובר",
        author: "בנצי ברופמן",
        description: "",
        longDescription: "",
      }
    : { title: "The end", description: "", longDescription: "" };
}

export interface Page {
  title: string;
  description: string;
  longDescription: string;
  imageUrl?: string;
}

export interface CoverPage extends Page {
  author?: string;
}

function getImageUrl(url: string) {
  const imageUrl = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  return `https://res.cloudinary.com/${imageUrl}/image/upload/${url}`;
}
