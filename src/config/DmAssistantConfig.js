import { Dashboard } from '../forms/Dashboard.js';
import { DmAssistantSettings } from '../forms/DmAssistantSettings.js';

export class DmAssistantConfig {
  static ID = 'dm-assistant';

  static FLAGS = {
    DM_ASSISTANT: 'dm-assistant',
  };

  static TEMPLATES = {
    DASHBOARD: `modules/${this.ID}/templates/dashboard.hbs`,
    SETTINGS: `modules/${this.ID}/templates/settings.hbs`,
  };

  static SETTINGS = {
    OPENAI_API_KEY: 'open-api-key',
    SETTINGS_MENU: 'assistant-dm-settings-menu',
  };

  static log(force, ...args) {
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
      type: DmAssistantSettings,
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

    Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
      registerPackageDebugFlag(DmAssistantConfig.ID);
    });

    Hooks.on('renderPlayerList', () => {
      // get gm user id
      const gm = game.users.find((u) => u.isGM && u.active);
      if (!gm) return;

      $(`li[data-user-id=${gm.id}]`).after(
        // `<button id="assistant-dm-button" type="button"><i class="fa-regular fa-user-robot"></i></button>`,
        `<li class="player gm assistant flexrow">
        <span class="player-active active" style="background: #84cc28; border: 1px solid #ffff50"></span>
        <span class="player-name self">
        <button type="button" id="assistant-dm-button">
        GM Assistant [AI]
        </button>
        </span>
        </li>`,
      );

      if (game.user.isGM) {
        const apiKey = localStorage.getItem('openai-api-key');
        $('#assistant-dm-button').on('click', () => {
          new Dashboard().render(true, { apiKey });
        });
      }
    });
  }
}
