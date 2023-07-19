import { ImageSize } from '../services/OpenAiService';

export type GeneratedImageData = {
  url: string;
  fileName: string;
  uploaded: boolean;
};

export type Pf2eNpcSettings = {
  images: {
    shouldGenerate: boolean;
    count: number;
    size: ImageSize;
  };
  properties: {
    name: boolean;
    race: boolean;
    appearance: boolean;
    backstory: boolean;
    level: boolean;
    class: boolean;
    alignment: boolean;
    size: boolean;
    hp: boolean;
    ac: boolean;
    abilities: boolean;
    skills: boolean;
    saves: boolean;
    rarity: boolean;
    languages: boolean;
    senses: boolean;
    items: boolean;
  };
};

export type GeneratorSettings = {
  pf2e: Pf2eGeneratorSettings;
};

export type Pf2eGeneratorSettings = {
  npc: Pf2eNpcSettings;
};
