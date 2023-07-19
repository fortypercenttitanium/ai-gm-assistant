import { Config } from '../config/Config';
import { GeneratedImageData } from '../types/AgaTypes';
import {
  SkillLevel,
  Pf2eNpcOutputParams,
  Pf2eSkillsParams,
  Pf2eSkillInput,
  Pf2eAbilitiesParams,
  Pf2eAbilitiesInput,
  Pf2eSavesInput,
  Pf2eSavesParams,
} from '../types/Pf2eTypes';
import { FoundryHelper } from './FoundryHelper';

const SKILL_LEVEL_MAP: Record<SkillLevel, number> = {
  untrained: 0,
  trained: 3,
  expert: 5,
  master: 7,
  legendary: 9,
};

export class Pf2eHelper extends FoundryHelper {
  static async createNpc(
    params: Pf2eNpcOutputParams,
    image?: GeneratedImageData,
  ) {
    const { name } = params;

    const folder = await FoundryHelper.getFolder(
      { name: 'Generated', type: 'Actor' },
      true,
    );

    const traits = Pf2eHelper.mapTraitsInput(params);
    const details = Pf2eHelper.mapDetailsInput(params);
    const saves = Pf2eHelper.mapSavesInput(params.saves);
    const skills = Pf2eHelper.mapSkillsInput(params.skills);
    const abilities = Pf2eHelper.mapAbilitiesInput(params.abilities);
    const attributes = Pf2eHelper.mapAttributesInput(params);

    const actorData: any = {
      system: {
        traits,
        details,
        saves,
        skills,
        abilities,
        attributes,
      },
    };

    if (image)
      actorData.img = `${Config.DEFAULTS.TOKEN_IMAGE_FOLDER}/${image.fileName}`;

    const actor = await Pf2eHelper.createActor(
      {
        name,
        type: 'npc',
        folder: folder.id,
      },
      actorData,
    );

    // type pf2e items, then loop through and create them, adding characteristics as needed such as potency runes
    const itemsForActor = await Pf2eHelper.createNpcItems(params.items);
    actor.createEmbeddedDocuments('Item', itemsForActor);

    return actor;
  }

  private static CalcStatMod(stat?: number) {
    return ((stat ?? 10) - 10) / 2;
  }

  private static mapSkillsInput(skills?: Pf2eSkillsParams): Pf2eSkillInput {
    if (!skills) return {};
    return Object.entries(skills).reduce<Pf2eSkillInput>(
      (acc, [key, value]) => {
        acc[key as keyof Pf2eSkillInput] = { value: SKILL_LEVEL_MAP[value] };
        return acc;
      },
      {} as Pf2eSkillInput,
    );
  }

  private static mapAbilitiesInput(
    abilities?: Pf2eAbilitiesParams,
  ): Pf2eAbilitiesInput {
    if (!abilities) return {};
    return Object.entries(abilities).reduce<Pf2eAbilitiesInput>(
      (acc, [key, value]) => {
        acc[key as keyof Pf2eAbilitiesInput] = {
          mod: Pf2eHelper.CalcStatMod(value),
        };
        return acc;
      },
      {},
    );
  }

  private static mapAttributesInput(params: Partial<Pf2eNpcOutputParams>) {
    if (!params.hp && !params.ac) return {};

    const attributes: any = {
      ac: {
        base: params.ac ?? 10,
        value: params.ac ?? 10,
      },
      hp: {
        value: params.hp ?? 10,
        max: params.hp ?? 10,
        base: params.hp ?? 10,
      },
    };

    return attributes;
  }

  private static mapSavesInput(saves?: Pf2eSavesParams): Pf2eSavesInput {
    if (!saves) return {};
    return Object.entries(saves).reduce((acc, [key, value]) => {
      acc[key as keyof Pf2eSavesInput] = { value };
      return acc;
    }, {} as Pf2eSavesInput);
  }

  private static mapDetailsInput(details: Partial<Pf2eNpcOutputParams>): any {
    const alignment = { value: details.alignment?.toUpperCase() ?? 'n' };
    const publicNotes = `<p>${details.appearance}</p><hr /><p>${details.backstory}</p>`;
    const blurb = `Level ${details.level ?? 1} ${details.race ?? 'Unknown'} ${
      details.class ?? 'Commoner'
    }`;
    const level = {
      value: details.level ?? 1,
    };
    const source = {
      value: 'AI-Generated',
      author: 'AI GM Assistant',
    };

    return {
      alignment,
      publicNotes,
      blurb,
      level,
      source,
    };
  }

  private static mapTraitsInput(details: Partial<Pf2eNpcOutputParams>): any {
    const traits = [details.race, ...(details.traits ?? [])];
    const languages = {
      value: details.languages?.map((l) => l.toLowerCase()) ?? [],
    };
    const { rarity } = details;
    const size = {
      value: details.size?.toLowerCase() ?? 'med',
    };
    const senses = { value: details.senses?.join(', ') };

    return {
      value: traits,
      languages,
      rarity,
      size,
      senses,
    };
  }

  private static async createNpcItems(items?: string[]): Promise<any[]> {
    if (!items) return [];

    return await Promise.all(
      items?.map(
        async (item) =>
          Pf2eHelper.searchCompendium(item, 'pf2e.equipment-srd') ??
          (await Item.create({ name: item, type: 'equipment' })),
      ) ?? [],
    );
  }

  private static searchCompendium(term: string, packName: string): any {
    term = term.toLowerCase();
    const equipment = game.packs.get(packName).index.contents;

    let searchResult =
      equipment.find((x: any) => x.name.toLowerCase() === term) ||
      equipment.find((x: any) => x.name.toLowerCase().startsWith(term)) ||
      equipment
        .filter((x: any) => x.name.toLowerCase().includes(term))
        .reduce((acc: any, curr: any) => {
          return acc?.name.length < curr.name.length ? acc : curr;
        }, undefined);

    if (searchResult) return searchResult;

    // refactor to an array of search functions
    const kitRegex = /(\w+)'s kit/;
    const runeRegex = /\+(\d)/;
    const kitMatch = term.match(kitRegex);
    const runeMatch = term.match(runeRegex);
    if (kitMatch) {
      const className = kitMatch[1].toLowerCase();
      const modifiedInput = term.replace(kitRegex, `Class kit (${className})`);
      return Pf2eHelper.searchCompendium(modifiedInput, packName);
    }

    if (runeMatch) {
      const item: any = Pf2eHelper.searchCompendium(
        term.replace(runeRegex, '').trim(),
        packName,
      );

      // doesn't work
      // const bonus = Number.parseInt(runeMatch[1]);
      // if (item) {
      //   item.system.potencyRune.value = bonus;
      // }

      return item;
    }

    return searchResult;
  }

  public static async imageExists(url: string): Promise<boolean> {
    return await srcExists(url);
  }

  public static async uploadPngBase64(
    url: string,
    destinationFolder: string,
    fileName: string,
  ) {
    try {
      await FilePicker.browse('data', destinationFolder);
    } catch {
      await FilePicker.createDirectory('data', destinationFolder);
    } finally {
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        const file = new File([blob], fileName, { type: `image/png` });

        return await FilePicker.upload('data', destinationFolder, file);
      } catch (err) {
        ui.notifications?.error(err);
      }
    }
  }
}
