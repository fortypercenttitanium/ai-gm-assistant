import { ApiSettingsForm } from '../forms/ApiSettingsForm';
import { GeneratorSettingsForm } from '../forms/GeneratorSettingsForm';
import { GeneratorSettings } from '../types/AgaTypes';

export class GameSettings {
  static ApiKeySettings = {
    settingsOptions: {
      name: 'Open API Key',
      config: false,
      type: String,
      default: '',
    },
    menuOptions: {
      name: 'Open API Key',
      label: 'Set your OpenAI API Key',
      type: ApiSettingsForm,
      icon: 'fas fa-robot',
      restricted: true,
      scope: 'client',
      config: true,
    },
  };

  static GeneratorSettings = {
    settingsOptions: {
      name: 'Generator Settings',
      config: false,
      type: Object,
      default: {
        pf2e: {
          npc: {
            images: {
              shouldGenerate: false,
              count: 4,
              size: '256x256',
            },
            properties: {
              name: true,
              race: true,
              appearance: true,
              backstory: true,
              level: true,
              class: true,
              alignment: true,
              size: true,
              hp: true,
              ac: true,
              abilities: true,
              skills: true,
              saves: true,
              rarity: true,
              languages: true,
              senses: true,
              items: true,
            },
          },
        },
      } as GeneratorSettings,
    },
    menuOptions: {
      name: 'Generator Settings',
      label: 'Configuration',
      type: GeneratorSettingsForm,
      icon: 'fas fa-robot',
      restricted: true,
      scope: 'client',
      config: true,
    },
  };
}
