export type Pf2eSaves = 'fortitude' | 'reflex' | 'will';
export type Pf2eAbilities = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
export type Pf2eSkills =
  | 'acrobatics'
  | 'arcana'
  | 'athletics'
  | 'crafting'
  | 'deception'
  | 'diplomacy'
  | 'intimidation'
  | 'medicine'
  | 'nature'
  | 'occultism'
  | 'performance'
  | 'religion'
  | 'society'
  | 'stealth'
  | 'survival'
  | 'thievery';
export type Pf2eAlignment =
  | 'lg'
  | 'ng'
  | 'cg'
  | 'ln'
  | 'n'
  | 'cn'
  | 'le'
  | 'ne'
  | 'ce';
export type Pf2eSize = 'tiny' | 'sm' | 'med' | 'lg' | 'huge' | 'grg';
export type SkillLevel =
  | 'untrained'
  | 'trained'
  | 'expert'
  | 'master'
  | 'legendary';

export type Pf2eAbilitiesParams = {
  [key in Pf2eAbilities]?: number;
};

export type Pf2eSkillsParams = {
  [key in Pf2eSkills]?: SkillLevel;
};

export type Pf2eSavesParams = {
  [key in Pf2eSaves]?: number;
};

export type Pf2eSkillInput = {
  [key in Pf2eSkills]?: { value: number };
};

export type Pf2eAbilitiesInput = {
  [key in Pf2eAbilities]?: { mod: number };
};

export type Pf2eSavesInput = {
  [key in Pf2eSaves]?: { value: number };
};

export type Pf2eNpcOutputParams = {
  name: string;
  race: string;
  appearance?: string;
  backstory?: string;
  class?: string;
  level?: number;
  alignment?: Pf2eAlignment;
  rarity?: string;
  size?: Pf2eSize;
  traits?: string[];
  perception?: number;
  senses?: string[];
  languages?: string[];
  items?: any[];
  abilities?: Pf2eAbilitiesParams;
  skills?: Pf2eSkillsParams;
  saves?: Pf2eSavesParams;
};
