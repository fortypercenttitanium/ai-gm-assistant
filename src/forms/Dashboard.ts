import { AiGmAssistantConfig } from '../config/AiGmAssistantConfig.js';
import { OpenAiService } from '../services/OpenAiService.js';
import { Pf2eHelper } from '../services/Pf2eHelper.js';

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
  static FOLDER_NAME = 'Generated';

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

  activateListeners(html: any) {
    super.activateListeners(html);
    $('#aga-submit').on('click', async () => {
      const userMessage = $('#aga-user-message').val() as string;
      if (!userMessage) return;
      console.log('USER MESSAGE | ', userMessage);

      $('#aga-response-area').text('Loading...');
      try {
        const result = await this.#aiService.createNPC(userMessage);
        console.log('AI RESPONSE | ', result);
        const responseHtml = Object.entries(result)
          .map(([key, value]) => {
            return `<p><strong>${key}</strong>: ${Dashboard.parseHtmlFromValue(
              value,
            )}</p>`;
          })
          .join('');

        $('#aga-response-area').html(responseHtml);
        $('.aga-create-npc')
          .show()
          .on('click', async () => {
            await Pf2eHelper.createNpc({
              ...result,
            });
            // await actor.createEmbeddedDocuments('Item', result.items);
          });
      } catch (error) {
        console.error(error);
        $('#aga-response-area').val('An error occured, please try again');
      }
    });
  }

  static parseHtmlFromValue(value: any): string {
    if (Array.isArray(value))
      return value.map((v) => Dashboard.parseHtmlFromValue(v)).join(', ');
    if (typeof value === 'object')
      return Object.entries(value)
        .map(
          ([key, value]) =>
            `<div class='aga-object-indent'><strong>${key}</strong>: ${Dashboard.parseHtmlFromValue(
              value,
            )}</div>`,
        )
        .join('');

    return value;
  }
}
