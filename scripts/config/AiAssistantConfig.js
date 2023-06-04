import { Dashboard } from '../forms/Dashboard.js';

export class AiAssistantConfig {
  static ID = 'dm-assistant';
  static FLAGS = {
    DM_ASSISTANT: 'dm-assistant',
  };
  static TEMPLATES = {
    DASHBOARD: `modules/${this.ID}/templates/dashboard.hbs`,
  };

  static log(force, ...args) {
    const shouldLog =
      force ||
      game.modules.get('_dev-mode')?.api?.getPackageDebugValue(this.ID);

    if (shouldLog) {
      console.log(this.ID, '|', ...args);
    }
  }

  static registerHooks() {
    Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
      registerPackageDebugFlag(AiAssistantConfig.ID);
    });

    Hooks.on('renderPlayerList', () => {
      // get gm user id
      const gm = game.users.find((u) => u.isGM && u.active);
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
      $('#assistant-dm-button').on('click', () => {
        new Dashboard().render(true);
      });
    });
  }
}
