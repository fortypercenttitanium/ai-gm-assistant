import { DmAssistantConfig } from '../config/DmAssistantConfig.js';
import { OpenAiService } from '../services/OpenAiService.js';

export class Dashboard extends FormApplication {
  #aiService;
  #apiKey;
  constructor() {
    super();
    this.#apiKey = game.settings.get(
      DmAssistantConfig.ID,
      DmAssistantConfig.SETTINGS.OPENAI_API_KEY,
    );
    this.#aiService = new OpenAiService(this.#apiKey);
  }

  static get defaultOptions() {
    const defaults = super.defaultOptions;

    const overrides = {
      height: 'auto',
      id: 'dm-assistant-dashboard',
      template: DmAssistantConfig.TEMPLATES.DASHBOARD,
      title: 'DM Assistant Dashboard',
    };

    return foundry.utils.mergeObject(defaults, overrides);
  }

  async _updateObject(event, formData) {
    console.log('Update object called');
    console.log(event);
    console.log(formData);
    return;
  }

  getData() {
    return {
      dmAssistant: 'dm-assistant',
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    $('#fetch-button').click(async () => {
      const userMessage = $('#user-message').val();
      if (!userMessage) return;
      console.log('USER MESSAGE | ', userMessage);
      const response = await this.#aiService.createNPC(userMessage);
      const npcJson = JSON.parse(response.data.choices[0].message.content);
      console.log('AI RESPONSE | ', npcJson);
      $('#response-container').val(JSON.stringify(npcJson, null, 2));
    });
  }
}
