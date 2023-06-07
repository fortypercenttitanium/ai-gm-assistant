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

  activateListeners(html) {
    super.activateListeners(html);
    $('#aga-submit').click(async () => {
      const userMessage = $('#aga-user-message').val();
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
          .click(async () => {
            const folder =
              game.folders.find((f) => f.name === Dashboard.FOLDER_NAME) ??
              (await Folder.create({
                name: Dashboard.FOLDER_NAME,
                type: 'Actor',
                parent: null,
              }));
            const actor = await Actor.create(
              {
                name: result.name,
                type: 'npc',
                folder: folder.id,
              },
              {
                render: true,
                renderSheet: true,
              },
            );
            // await actor.createEmbeddedDocuments('Item', result.items);
          });
      } catch (error) {
        console.error(error);
        $('#aga-response-area').val('An error occured, please try again');
      }
    });
  }

  static parseHtmlFromValue(value) {
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
