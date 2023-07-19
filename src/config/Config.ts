import { Dashboard } from '../forms/Dashboard.js';
import { GameSystem } from '../types/FoundryTypes.js';
import { GameSettings } from './GameSettings.js';

export class Config {
  static ID = 'ai-gm-assistant';

  static TEMPLATES = {
    DASHBOARD: `modules/${this.ID}/templates/dashboard.hbs`,
    API_SETTINGS: `modules/${this.ID}/templates/apisettings.hbs`,
    GENERATOR_SETTINGS: `modules/${this.ID}/templates/generatorsettings.hbs`,
  };

  static SETTINGS = {
    OPENAI_API_KEY: 'open-api-key',
    API_SETTINGS_MENU: 'ai-gm-api-settings-menu',
    GENERATOR_SETTINGS_MENU: 'ai-gm-generator-settings-menu',
    GENERATOR_SETTINGS: 'ai-gm-generator-settings',
  };

  static DEFAULTS = {
    ACTOR_FOLDER: 'Generated',
    TOKEN_IMAGE_FOLDER: 'generated-tokens',
  };

  static SYSTEM: GameSystem = {
    id: '',
    title: '',
  };

  static log(force: any, ...args: any[]) {
    const shouldLog =
      force ||
      game.modules.get('_dev-mode')?.api?.getPackageDebugValue(this.ID);

    if (shouldLog) {
      console.log(this.ID, '|', ...args);
    }
  }

  static initialize() {
    const { id, title } = game.system;
    this.SYSTEM = { id, title };
    this.registerSettings();
    this.registerHandlebarsHelpers();
  }

  static registerSettings() {
    game.settings.registerMenu(
      this.ID,
      this.SETTINGS.API_SETTINGS_MENU,
      GameSettings.ApiKeySettings.menuOptions,
    );

    game.settings.register(
      this.ID,
      this.SETTINGS.OPENAI_API_KEY,
      GameSettings.ApiKeySettings.settingsOptions,
    );

    game.settings.registerMenu(
      this.ID,
      this.SETTINGS.GENERATOR_SETTINGS_MENU,
      GameSettings.GeneratorSettings.menuOptions,
    );

    game.settings.register(
      this.ID,
      this.SETTINGS.GENERATOR_SETTINGS,
      GameSettings.GeneratorSettings.settingsOptions,
    );
  }

  static registerHooks() {
    Hooks.once('init', () => this.initialize());

    Hooks.once('devModeReady', ({ registerPackageDebugFlag }: any) => {
      registerPackageDebugFlag(this.ID);
    });

    Hooks.on('renderPlayerList', () => {
      // get gm user id
      const gm = game.users.find((u: any) => u.isGM && u.active);
      if (!gm) return;

      $(`li[data-user-id=${gm.id}]`).after(
        `<li class="player gm aga-assistant-player-bar flexrow">
        <span class="player-active active" style="background: #84cc28; border: 1px solid #ffff50"></span>
        <span class="player-name self">
        <button type="button" class="aga-no-style-button" id="aga-assistant-button">
          GM Assistant
          <i id="aga-robot-icon" class="fa-regular fa-user-robot"></i>
        </button>
        </span>
        </li>`,
      );

      if (game.user.isGM) {
        $('#aga-assistant-button').on('click', () => {
          new Dashboard().render(true);
        });
      }
    });
  }

  static registerHandlebarsHelpers() {
    Handlebars.registerHelper('capitalize', function (value: any) {
      // Check if the value is a string
      if (typeof value === 'string') {
        // Capitalize the first letter
        return value.charAt(0).toUpperCase() + value.slice(1);
      }

      return value;
    });
  }
}
