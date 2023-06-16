import { AiGmAssistantConfig } from '../config/AiGmAssistantConfig.js';
import { OpenAiService } from '../services/OpenAiService.js';
import { Pf2eHelper } from '../services/Pf2eHelper.js';
import { HtmlHelper } from '../services/HtmlHelper.js';

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
    this.handleSubmit = this.handleSubmit.bind(this);
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
      this.handleSubmit();
    });
  }

  private async handleSubmit(): Promise<void> {
    const userMessage = HtmlHelper.getInput('#aga-user-message');
    if (!userMessage) return;

    HtmlHelper.setDisabled('#aga-submit', true);
    HtmlHelper.renderHtmlToSelector(
      HtmlHelper.loadingSpinner,
      '.aga-response-area',
    );

    try {
      const result = await this.#aiService.createNPC(userMessage);

      // const imagePrompt = `A Pathfinder2e ${result.race ?? 'Human'} ${
      //   result.class ?? 'Commoner'
      // } with the following description: ${result.appearance}`;

      // await this.#aiService.createActorIcon(imagePrompt);

      const responseHtml = HtmlHelper.parseHtmlFromValue(
        result,
        'aga-response',
      );
      HtmlHelper.renderHtmlToSelector(responseHtml, '.aga-response-area');
      HtmlHelper.prependHtmlToSelector(
        HtmlHelper.createInfoIcon(
          `If you create this NPC as an actor, items with potency runes will
              be given to the actor but the potency run itself will need to be added manually.
              Items not found in the compendium will be created as items with no data.`,
        ),
        '.aga-response-items > strong',
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
      HtmlHelper.renderHtmlToSelector(
        HtmlHelper.genericErrorMessage,
        '.aga-response-area',
      );
    } finally {
      HtmlHelper.setDisabled('#aga-submit', false);
    }
  }
}
