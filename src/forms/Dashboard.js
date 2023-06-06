import { AiGmAssistantConfig } from '../config/AiGmAssistantConfig.js';
import { OpenAiService } from '../services/OpenAiService.js';

export class Dashboard extends FormApplication {
  #aiService;
  #apiKey;
  constructor() {
    super();
    this.#apiKey = game.settings.get(
      AiGmAssistantConfig.ID,
      AiGmAssistantConfig.SETTINGS.OPENAI_API_KEY,
    );
    this.#aiService = new OpenAiService(this.#apiKey);
  }

  static ID = 'aga-dashboard';

  static get defaultOptions() {
    const defaults = super.defaultOptions;

    const overrides = {
      height: 'auto',
      id: this.ID,
      template: AiGmAssistantConfig.TEMPLATES.DASHBOARD,
      title: 'AI GM Assistant Dashboard',
    };

    return foundry.utils.mergeObject(defaults, overrides);
  }

  getData() {
    return {
      agaApiKey: game.settings.get(
        AiGmAssistantConfig.ID,
        AiGmAssistantConfig.SETTINGS.OPENAI_API_KEY,
      ),
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    $('#aga-submit').click(async () => {
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
