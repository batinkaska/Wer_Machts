import type { TFunction } from "i18next";
import type { ComponentType, SVGProps } from "react";
import {
  CameraIcon,
  DotsGridIcon,
  GraduationCapIcon,
  LeafIcon,
  MonitorIcon,
  ShieldIcon,
  SparkleIcon,
  TruckIcon,
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
    ],
  },
  {
    groupKey: "gartenAussenanlagen",
    categories: [
      { slug: "gaertner" },
      { slug: "rasenmaehen" },
      { slug: "landschaftsbau" },
      { slug: "baumpflege-schnitt" },
    ],
  },
  {
    groupKey: "reinigung",
    categories: [
      { slug: "haushaltsreinigung" },
      { slug: "baureinigung" },
      { slug: "bueroreinigung" },
      { slug: "teppich-polsterreinigung" },
    ],
  },
  {
    groupKey: "transportUmzug",
    categories: [{ slug: "umzuege" }, { slug: "kleintransporte" }, { slug: "kurierdienste" }],
  },
  {
    groupKey: "sicherheit",
    categories: [
      { slug: "personenschutz" },
      { slug: "sicherheitstechnik" },
      { slug: "veranstaltungsschutz" },
    ],
  },
  {
    groupKey: "itTechnik",
    categories: [
      { slug: "pc-smartphone-reparatur" },
      { slug: "web-app-entwicklung" },
      { slug: "netzwerk-wlan-einrichtung" },
    ],
  },
  {
    groupKey: "unterrichtNachhilfe",
    categories: [
      { slug: "schulnachhilfe" },
      { slug: "sprachunterricht" },
      { slug: "musikunterricht" },
    ],
  },
  {
    groupKey: "eventsFotografie",
    categories: [
      { slug: "catering-privatkoch" },
      { slug: "fotograf" },
      { slug: "musiker-dj" },
    ],
  },
  {
    groupKey: "sonstiges",
    categories: [{ slug: "sonstiges" }],
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
