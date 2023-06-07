import { Dashboard } from '../forms/Dashboard.js';
import { AiGmAssistantSettings } from '../forms/AiGmAssistantSettings.js';

export class AiGmAssistantConfig {
  static ID = 'ai-gm-assistant';

  static TEMPLATES = {
    DASHBOARD: `modules/${this.ID}/templates/dashboard.hbs`,
    SETTINGS: `modules/${this.ID}/templates/settings.hbs`,
  };

  static SETTINGS = {
    OPENAI_API_KEY: 'open-api-key',
    SETTINGS_MENU: 'ai-gm-settings-menu',
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
    this.registerSettings();
  }

  static registerSettings() {
    game.settings.registerMenu(this.ID, this.SETTINGS.SETTINGS_MENU, {
      name: 'Open API Key',
      label: 'Set your OpenAI API Key',
      type: AiGmAssistantSettings,
      icon: 'fas fa-robot',
      restricted: true,
      scope: 'client',
      config: true,
    });

    game.settings.register(this.ID, this.SETTINGS.OPENAI_API_KEY, {
      name: 'Open API Key',
      config: false,
      type: String,
      default: '',
    });
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
        <button type="button" id="aga-assistant-button">
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
}
