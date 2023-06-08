import { FoundryHelper } from './FoundryHelper';

export type Pf2eNpcParams = {
  name: string;
  race: string;
  appearance?: string;
  backstory?: string;
  class?: string;
  level?: number;
  alignment?: 'lg' | 'ng' | 'cg' | 'ln' | 'n' | 'cn' | 'le' | 'ne' | 'ce';
  rarity?: string;
  size?: 'tiny' | 'sm' | 'med' | 'lg' | 'huge' | 'grg';
  traits?: string[];
  perception?: number;
  senses?: string[];
  languages?: string[];
  items?: any[];
  stats?: Pf2eStatsParams;
  skills?: Pf2eSkillsParams;
  saves?: Pf2eSavesParams;
};

export type Pf2eStatsParams = {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
};

export type SkillLevel =
  | 'untrained'
  | 'trained'
  | 'expert'
  | 'master'
  | 'legendary';

export type Pf2eSkillsParams = {
  acrobatics: SkillLevel;
  arcana: SkillLevel;
  athletics: SkillLevel;
  crafting: SkillLevel;
  deception: SkillLevel;
  diplomacy: SkillLevel;
  intimidation: SkillLevel;
  medicine: SkillLevel;
  nature: SkillLevel;
  occultism: SkillLevel;
  performance: SkillLevel;
  religion: SkillLevel;
  society: SkillLevel;
  stealth: SkillLevel;
  survival: SkillLevel;
  thievery: SkillLevel;
};

export type Pf2eSavesParams = {
  fortitude: number;
  reflex: number;
  will: number;
};

const SKILL_LEVEL_MAP: Record<SkillLevel, number> = {
  untrained: 0,
  trained: 3,
  expert: 5,
  master: 7,
  legendary: 9,
};

export class Pf2eHelper extends FoundryHelper {
  static async createNpc(params: Pf2eNpcParams) {
    const {
      name,
      race,
      appearance,
      backstory,
      class: className,
      level,
      alignment,
      size,
      rarity,
      traits,
      senses,
      languages,
      items,
      stats,
      skills,
      saves,
    } = params;

    const folder = await FoundryHelper.getFolder(
      { name: 'Generated', type: 'Actor' },
      true,
    );

    const actor = await Pf2eHelper.createActor(
      {
        name,
        type: 'npc',
        folder: folder.id,
      },
      {
        system: {
          traits: {
            value: [race, ...(traits ?? [])],
            languages: {
              value: languages?.map((l) => l.toLowerCase()) ?? [],
            },
            rarity,
            size: {
              value: size,
            },
            senses: senses?.join(', '),
          },
          details: {
            alignment: {
              value: alignment?.toUpperCase(),
            },
            publicNotes: `<p>${appearance}</p><hr /><p>${backstory}</p>`,
            blurb: `Level ${level ?? 1} ${race ?? 'Unknown'} ${
              className ?? 'Commoner'
            }`,
            level: {
              value: level,
            },
          },
          saves: {
            fortitude: {
              value: saves?.fortitude ?? 0,
            },
            reflex: {
              value: saves?.reflex ?? 0,
            },
            will: {
              value: saves?.will ?? 0,
            },
          },
          skills: {
            acrobatics: {
              value: SKILL_LEVEL_MAP[skills?.acrobatics ?? 'untrained'],
            },
            arcana: {
              value: SKILL_LEVEL_MAP[skills?.arcana ?? 'untrained'],
            },
            athletics: {
              value: SKILL_LEVEL_MAP[skills?.athletics ?? 'untrained'],
            },
            crafting: {
              value: SKILL_LEVEL_MAP[skills?.crafting ?? 'untrained'],
            },
            deception: {
              value: SKILL_LEVEL_MAP[skills?.deception ?? 'untrained'],
            },
            diplomacy: {
              value: SKILL_LEVEL_MAP[skills?.diplomacy ?? 'untrained'],
            },
            intimidation: {
              value: SKILL_LEVEL_MAP[skills?.intimidation ?? 'untrained'],
            },
            medicine: {
              value: SKILL_LEVEL_MAP[skills?.medicine ?? 'untrained'],
            },
            nature: {
              value: SKILL_LEVEL_MAP[skills?.nature ?? 'untrained'],
            },
            occultism: {
              value: SKILL_LEVEL_MAP[skills?.occultism ?? 'untrained'],
            },
            performance: {
              value: SKILL_LEVEL_MAP[skills?.performance ?? 'untrained'],
            },
            religion: {
              value: SKILL_LEVEL_MAP[skills?.religion ?? 'untrained'],
            },
            society: {
              value: SKILL_LEVEL_MAP[skills?.society ?? 'untrained'],
            },
            stealth: {
              value: SKILL_LEVEL_MAP[skills?.stealth ?? 'untrained'],
            },
            survival: {
              value: SKILL_LEVEL_MAP[skills?.survival ?? 'untrained'],
            },
            thievery: {
              value: SKILL_LEVEL_MAP[skills?.thievery ?? 'untrained'],
            },
          },
          abilities: {
            cha: {
              mod: Pf2eHelper.CalcStatMod(stats?.cha),
            },
            con: {
              mod: Pf2eHelper.CalcStatMod(stats?.con),
            },
            dex: {
              mod: Pf2eHelper.CalcStatMod(stats?.dex),
            },
            int: {
              mod: Pf2eHelper.CalcStatMod(stats?.int),
            },
            str: {
              mod: Pf2eHelper.CalcStatMod(stats?.str),
            },
            wis: {
              mod: Pf2eHelper.CalcStatMod(stats?.wis),
            },
          },
        },
      },
    );

    const itemsForActor = await Promise.all(
      items?.map(
        async (item) =>
          Pf2eHelper.SearchForItem(item) ??
          (await Item.create({ name: item, type: 'equipment' })),
      ) ?? [],
    );

    actor.createEmbeddedDocuments('Item', itemsForActor);

    return actor;
  }

  private static CalcStatMod(stat?: number) {
    return ((stat ?? 10) - 10) / 2;
  }

  private static SearchForItem(term: string): any {
    term = term.toLowerCase();
    const equipment = game.packs.get('pf2e.equipment-srd').index.contents;

    let searchResult =
      equipment.find((x: any) => x.name.toLowerCase() === term) ||
      equipment.find((x: any) => x.name.toLowerCase().startsWith(term)) ||
      equipment.find((x: any) => x.name.toLowerCase().includes(term));

    if (searchResult) return searchResult;

    const kitRegex = /(\w+)'s kit/;
    const runeRegex = /\+(\d)/;
    const kitMatch = term.match(kitRegex);
    const runeMatch = term.match(runeRegex);
    if (kitMatch) {
      const className = kitMatch[1].toLowerCase();
      const modifiedInput = term.replace(kitRegex, `Class kit (${className})`);
      return Pf2eHelper.SearchForItem(modifiedInput);
    }

    if (runeMatch) {
      const bonus = Number.parseInt(runeMatch[1]);
      const item: any = Pf2eHelper.SearchForItem(term.replace(runeRegex, ''));

      if (item) {
        item.system.potencyRune.value = bonus;
      }

      return item;
    }
  }
}
