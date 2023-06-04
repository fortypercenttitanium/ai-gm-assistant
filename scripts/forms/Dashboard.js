import { AiAssistantConfig } from '../config/AiAssistantConfig.js';
import { OpenAiService } from '../services/OpenAiService.js';

export class Dashboard extends FormApplication {
  #aiService;
  constructor() {
    super();
    this.#aiService = new OpenAiService();
  }

  static get defaultOptions() {
    const defaults = super.defaultOptions;

    const overrides = {
      height: 'auto',
      id: 'ai-assistant-dashboard',
      template: AiAssistantConfig.TEMPLATES.DASHBOARD,
      title: 'AI Assistant Dashboard',
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
      aiAssistant: 'ai-assistant',
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    $('#fetch-button').click(async () => {
      const userMessage = $('#user-message').val();
      if (!userMessage) return;
      console.log('USER MESSAGE | ', userMessage);
      const response = await this.#aiService.createNPC(userMessage);
      console.log('AI RESPONSE | ', response);
      $('#response-container').val(JSON.stringify(response));
    });
  }
}
