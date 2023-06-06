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
      width: 'auto',
      id: this.ID,
      template: AiGmAssistantConfig.TEMPLATES.DASHBOARD,
      title: 'AI GM Assistant Dashboard',
    };

    return foundry.utils.mergeObject(defaults, overrides);
  }

  async getData() {
    return {
      agaApiKey: game.settings.get(
        AiGmAssistantConfig.ID,
        AiGmAssistantConfig.SETTINGS.OPENAI_API_KEY,
      ),
      status: await this.#aiService.getCurrentStatus(),
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    $('#aga-submit').click(async () => {
      const userMessage = $('#aga-user-message').val();
      if (!userMessage) return;
      console.log('USER MESSAGE | ', userMessage);

      $('#aga-response-area').val('Loading...');
      try {
        const result = await this.#aiService.createNPC(userMessage);
        console.log('AI RESPONSE | ', result);
        $('#aga-response-area').val(JSON.stringify(result, null, 2));
      } catch (error) {
        console.error(error);
        $('#aga-response-area').val('An error occured, please try again');
      }
    });
  }
}
