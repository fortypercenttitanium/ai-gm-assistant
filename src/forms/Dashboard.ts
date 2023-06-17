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
    HtmlHelper.renderLoadingSpinner('.aga-response-area', 'Generating NPC...');

    try {
      const result = await this.#aiService.createNPC(userMessage);

      HtmlHelper.renderLoadingSpinner(
        '.aga-response-area',
        'Generating NPC icons...',
      );

      const imagePrompt = `A Pathfinder2e ${result.race ?? 'Human'} ${
        result.class ?? 'Commoner'
      } with the following description: ${result.appearance}`;

      const imagesData = await this.#aiService.createActorIcons(imagePrompt);
      const images = imagesData?.data.data.map(
        (d: any) => `data:image/png;base64,${d.b64_json}`,
      );
      const imageTags = HtmlHelper.createImageTagsFromBase64(images);

      const responseHtml = HtmlHelper.parseHtmlFromValue(
        result,
        'aga-response',
      );
      HtmlHelper.renderHtmlToSelector(responseHtml, '.aga-response-area');
      HtmlHelper.prependHtmlToSelector(
        '<h2>Icon Selection</h2>',
        '.aga-image-container',
      );
      HtmlHelper.renderHtmlToSelector(imageTags, '.aga-response-images');
      HtmlHelper.prependHtmlToSelector(
        HtmlHelper.createInfoIcon(
          `If you create this NPC as an actor, items with potency runes will
              be given to the actor but the potency run itself will need to be added manually.
              Items not found in the compendium will be created as items with no data.`,
        ),
        '.aga-response-items > strong',
      );

      let selectedImageId: null | number = null;

      $('.aga-image-selector').on('click', (event) => {
        const imageId = $(event.currentTarget).data('imageid');
        if (selectedImageId === imageId) {
          selectedImageId = null;
          $(event.currentTarget).removeClass('selected');
        } else {
          selectedImageId = imageId;
          $('.aga-image-selector.selected').removeClass('selected');
          $(event.currentTarget).addClass('selected');
        }
      });

      $('.aga-create-npc')
        .show()
        .on('click', async () => {
          const imageBase64 =
            selectedImageId !== null ? images?.[selectedImageId] : undefined;

          await Pf2eHelper.createNpc(
            {
              ...result,
            },
            imageBase64,
          );
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
