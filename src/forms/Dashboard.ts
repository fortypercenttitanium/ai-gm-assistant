import { Config } from '../config/Config.js';
import { OpenAiService } from '../services/OpenAiService.js';
import { Pf2eHelper } from '../services/Pf2eHelper.js';
import { HtmlHelper } from '../services/HtmlHelper.js';
import { DashboardController } from '../services/DashboardController.js';
import { GeneratorSettingsForm } from './GeneratorSettingsForm.js';

export class Dashboard extends FormApplication {
  #aiService: OpenAiService;
  #apiKey: string;

  constructor() {
    super();
    this.#apiKey = game.settings.get(Config.ID, Config.SETTINGS.OPENAI_API_KEY);
    this.#aiService = new OpenAiService(this.#apiKey);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  static ID = 'aga-dashboard';

  static get defaultOptions() {
    const defaults = super.defaultOptions;

    const overrides = {
      height: 'auto',
      width: 'auto',
      id: this.ID,
      template: Config.TEMPLATES.DASHBOARD,
      title: 'AI GM Assistant Dashboard',
    };

    return foundry.utils.mergeObject(defaults, overrides);
  }

  async getData() {
    return {
      agaApiKey: game.settings.get(Config.ID, Config.SETTINGS.OPENAI_API_KEY),
      status: await this.#aiService.getCurrentStatus(),
    };
  }

  activateListeners(html: any) {
    super.activateListeners(html);

    $('#aga-submit').on('click', async () => {
      this.handleSubmit();
    });

    $('#aga-open-settings-dashboard').on('click', () => {
      new GeneratorSettingsForm().render(true);
    });
  }

  private async handleSubmit(): Promise<void> {
    const userMessage = HtmlHelper.getInput('#aga-user-message');
    if (!userMessage) return;

    const settings = DashboardController.getGeneratorSettings();

    HtmlHelper.setDisabled('#aga-submit', true);
    HtmlHelper.renderLoadingSpinner('.aga-response-area', 'Generating NPC...');

    try {
      const systemMessage = Pf2eHelper.createNPCSytemMessage(settings.pf2e.npc);
      const result = await this.#aiService.createNPC(
        userMessage,
        systemMessage,
      );

      HtmlHelper.renderLoadingSpinner(
        '.aga-response-area',
        'Generating NPC icons...',
      );

      if (settings.pf2e.npc.images.shouldGenerate) {
        const images = await this.#aiService.createActorIcons(
          result.race,
          result.class,
          result.appearance,
        );

        DashboardController.setNpcImages(images, result.name ?? 'unknown');
        const imageTags = HtmlHelper.createImagesFromBase64(
          DashboardController.npcImages,
        )
          .map((image, i) => {
            return `<div class="aga-single-image-container">${image}${HtmlHelper.createSaveIconBtn(
              'aga-image-save-btn',
              `data-imagesave="${i}"`,
            )}</div>`;
          })
          .join('');

        HtmlHelper.prependHtmlToSelector(
          '<h2>Icon Selection</h2>',
          '.aga-image-container',
        );
        HtmlHelper.renderHtmlToSelector(imageTags, '.aga-response-images');

        $('.aga-image-selector').on('click', (event) => {
          const imageId = $(event.currentTarget).data('imageid');
          if (DashboardController.selectedNpcImage === imageId) {
            DashboardController.selectedNpcImage = null;
            $(event.currentTarget).removeClass('selected');
          } else {
            DashboardController.selectedNpcImage = imageId;
            $('.aga-image-selector.selected').removeClass('selected');
            $(event.currentTarget).addClass('selected');
          }
        });

        $('.aga-image-save-btn').on('click', async (event) => {
          const imageId = $(event.currentTarget).data('imagesave');
          const image = DashboardController.npcImages[imageId];
          await Pf2eHelper.uploadPngBase64(
            image.url,
            Config.DEFAULTS.TOKEN_IMAGE_FOLDER,
            image.fileName,
          );
          image.uploaded = true;
          $(event.currentTarget).prop('disabled', true);
          $(event.currentTarget).html('<i class="fa-solid fa-check"></i>');
        });
      }

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
          const image = DashboardController.getSelectedImage();
          if (image && !image.uploaded) {
            await Pf2eHelper.uploadPngBase64(
              image.url,
              Config.DEFAULTS.TOKEN_IMAGE_FOLDER,
              image.fileName,
            );
          }
          await Pf2eHelper.createNpc(
            {
              ...result,
            },
            { image, privateNotes: responseHtml },
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
