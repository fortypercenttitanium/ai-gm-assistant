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

      $('#aga-submit').prop('disabled', true);
      $('.aga-response-area').html(
        '<div class="loading-container"><div class="lds-default"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div><h4>Generating NPC...</h4></div>',
      );
      try {
        const result = await this.#aiService.createNPC(userMessage);

        const responseHtml = Object.entries(result)
          .map(([key, value]) => {
            return `<p class="aga-response-${key}"><strong>${Dashboard.capitalizeString(
              key,
            )}</strong>: ${Dashboard.parseHtmlFromValue(value)}</p>`;
          })
          .join('');

        $('.aga-response-area').html(responseHtml);

        $('.aga-response-items > strong').append(
          '<i class="fa-solid fa-circle-info" title="If you create this NPC as an actor, items with potency runes will be given to the actor but the potency run itself will need to be added manually."></i>',
        );

        $('.aga-create-npc')
          .show()
          .on('click', async () => {
            await Pf2eHelper.createNpc({
              ...result,
            });
          });
      } catch (error) {
        console.error(error);
        $('.aga-response-area').html(
          '<h3>An error occured, please try again</h3>',
        );
      } finally {
        $('#aga-submit').prop('disabled', false);
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
            `<div class='aga-object-indent'><strong>${Dashboard.capitalizeString(
              key,
            )}</strong>: ${Dashboard.parseHtmlFromValue(value)}</div>`,
        )
        .join('');

    return value;
  }

  private static capitalizeString(str: string): string {
    return str[0].toUpperCase() + str.slice(1);
  }
}
