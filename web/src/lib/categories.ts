import type { TFunction } from "i18next";
import type { ComponentType, SVGProps } from "react";
import {
  CameraIcon,
  CarIcon,
  DotsGridIcon,
  GraduationCapIcon,
  LeafIcon,
  MonitorIcon,
  ShieldIcon,
  SmartphoneIcon,
  SparkleIcon,
  TruckIcon,
  UserIcon,
  UtensilsIcon,
  WrenchIcon,
} from "../components/icons";

export interface Category {
  slug: string;
}

export interface CategoryGroup {
  groupKey: string;
  categories: Category[];
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    groupKey: "hausHandwerk",
    categories: [
      { slug: "maler-tapezierer" },
      { slug: "elektriker" },
      { slug: "klempner-sanitaer" },
      { slug: "moebelmontage" },
      { slug: "schreiner" },
      { slug: "hausHandwerk-weiteres" },
    ],
  },
  {
    groupKey: "gartenAussenanlagen",
    categories: [
      { slug: "gaertner" },
      { slug: "rasenmaehen" },
      { slug: "landschaftsbau" },
      { slug: "baumpflege-schnitt" },
      { slug: "gartenAussenanlagen-weiteres" },
    ],
  },
  {
    groupKey: "reinigung",
    categories: [
      { slug: "haushaltsreinigung" },
      { slug: "baureinigung" },
      { slug: "bueroreinigung" },
      { slug: "teppich-polsterreinigung" },
      { slug: "reinigung-weiteres" },
    ],
  },
  {
    groupKey: "transportUmzug",
    categories: [
      { slug: "umzuege" },
      { slug: "kleintransporte" },
      { slug: "kurierdienste" },
      { slug: "transportUmzug-weiteres" },
    ],
  },
  {
    groupKey: "sicherheit",
    categories: [
      { slug: "personenschutz" },
      { slug: "sicherheitstechnik" },
      { slug: "veranstaltungsschutz" },
      { slug: "sicherheit-weiteres" },
    ],
  },
  {
    groupKey: "itTechnik",
    categories: [
      { slug: "pc-smartphone-reparatur" },
      { slug: "web-app-entwicklung" },
      { slug: "netzwerk-wlan-einrichtung" },
      { slug: "itTechnik-weiteres" },
    ],
  },
  {
    groupKey: "unterrichtNachhilfe",
    categories: [
      { slug: "schulnachhilfe" },
      { slug: "sprachunterricht" },
      { slug: "musikunterricht" },
      { slug: "unterrichtNachhilfe-weiteres" },
    ],
  },
  {
    groupKey: "eventsFotografie",
    categories: [
      { slug: "catering-privatkoch" },
      { slug: "fotograf" },
      { slug: "musiker-dj" },
      { slug: "tickets-reise-event" },
      { slug: "eventsFotografie-weiteres" },
    ],
  },
  {
    groupKey: "gastronomie",
    categories: [
      { slug: "catering-grossbestellung" },
      { slug: "koch" },
      { slug: "servicekraft" },
      { slug: "aushilfe" },
      { slug: "gastronomie-weiteres" },
    ],
  },
  {
    groupKey: "autoRadBoot",
    categories: [
      { slug: "reparaturen" },
      { slug: "auto" },
      { slug: "autoteile-reifen" },
      { slug: "fahrraeder" },
      { slug: "motorraeder" },
      { slug: "autoRadBoot-weiteres" },
    ],
  },
  {
    groupKey: "dienstleistungen",
    categories: [
      { slug: "altenpflege" },
      { slug: "babysitter-kinderbetreuung" },
      { slug: "kuenstler-musiker" },
      { slug: "reise-event" },
      { slug: "tierbetreuung-training" },
      { slug: "dienstleistungen-weiteres" },
    ],
  },
  {
    groupKey: "elektronik",
    categories: [
      { slug: "audio-hifi" },
      { slug: "dienstleistung-elektronik" },
      { slug: "foto" },
      { slug: "handy-telefon" },
      { slug: "haushaltsgeraete" },
      { slug: "konsolen" },
      { slug: "laptops" },
      { slug: "pcs" },
      { slug: "software" },
      { slug: "tablets" },
      { slug: "tv-video" },
      { slug: "videospiele" },
      { slug: "elektronik-weiteres" },
    ],
  },
  {
    groupKey: "sonstiges",
    categories: [{ slug: "sonstiges" }, { slug: "sonstiges-weiteres" }],
  },
];

export const CATEGORIES: Category[] = CATEGORY_GROUPS.flatMap((group) => group.categories);

export const CATEGORY_GROUP_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  hausHandwerk: WrenchIcon,
  gartenAussenanlagen: LeafIcon,
  reinigung: SparkleIcon,
  transportUmzug: TruckIcon,
  sicherheit: ShieldIcon,
  itTechnik: MonitorIcon,
  unterrichtNachhilfe: GraduationCapIcon,
  eventsFotografie: CameraIcon,
  gastronomie: UtensilsIcon,
  autoRadBoot: CarIcon,
  dienstleistungen: UserIcon,
  elektronik: SmartphoneIcon,
  sonstiges: DotsGridIcon,
};

export const SONSTIGES_SLUG = "sonstiges";

export function categoryLabel(t: TFunction, slug: string): string {
  return t(`categories.${slug}`, { defaultValue: slug });
}

export function categoryLabels(t: TFunction, slugs: string[]): string {
  return slugs.map((slug) => categoryLabel(t, slug)).join(", ");
}

export function categoryGroupName(t: TFunction, groupKey: string): string {
  return t(`categoryGroups.${groupKey}`, { defaultValue: groupKey });
}
