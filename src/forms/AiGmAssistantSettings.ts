import { AiGmAssistantConfig } from '../config/AiGmAssistantConfig';

export type AgaImage = {
  id: string;
  src: string;
  text: string;
};

export class AiGmAssistantSettings extends FormApplication {
  images: { [key: string]: AgaImage };

  constructor() {
    super();

    this.images = {
      step1: {
        id: 'step1',
        src: `modules/${AiGmAssistantConfig.ID}/assets/step1.png`,
        text: 'OpenAI signup page',
      },
      step2: {
        id: 'step2',
        src: `modules/${AiGmAssistantConfig.ID}/assets/step2.png`,
        text: 'OpenAI selection page',
      },
      step3: {
        id: 'step3',
        src: `modules/${AiGmAssistantConfig.ID}/assets/step3.png`,
        text: 'OpenAI profile icon',
      },
      step4: {
        id: 'step4',
        src: `modules/${AiGmAssistantConfig.ID}/assets/step4.png`,
        text: 'OpenAI API Keys',
      },
      step5: {
        id: 'step5',
        src: `modules/${AiGmAssistantConfig.ID}/assets/step5.png`,
        text: 'OpenAI create new secret key',
      },
      step6: {
        id: 'step6',
        src: `modules/${AiGmAssistantConfig.ID}/assets/step6.png`,
        text: 'OpenAI create secret key',
      },
    };
  }

  static ID = 'aga-assistant-settings';

  static get defaultOptions() {
    const defaults = super.defaultOptions;
    const overrides = {
      height: 'auto',
      width: 600,
      id: this.ID,
      template: AiGmAssistantConfig.TEMPLATES.SETTINGS,
      title: 'AI GM Assistant Settings',
      closeOnSubmit: false,
    };

    return foundry.utils.mergeObject(defaults, overrides);
  }

  async _updateObject(_: any, formData: any) {
    const { agaApiKey } = expandObject(formData);

    const confirmed = await Dialog.confirm({
      title: 'Change API Key',
      content: 'Are you sure you want to save this API key?',
      yes: () => true,
      no: () => false,
      defaultYes: false,
    });

    if (confirmed)
      game.settings.set(
        AiGmAssistantConfig.ID,
        AiGmAssistantConfig.SETTINGS.OPENAI_API_KEY,
        agaApiKey,
      );

    return this.render(true);
  }

  getData() {
    return {
      agaApiKey: game.settings.get(
        AiGmAssistantConfig.ID,
        AiGmAssistantConfig.SETTINGS.OPENAI_API_KEY,
      ),
      images: this.images,
    };
  }

  activateListeners(html: any) {
    super.activateListeners(html);

    $('.aga-toggle-api-visible').click(() => {
      var apiField = $('#agaApiKey');
      var eyeIcon = $('.aga-toggle-api-visible > i');

      if (apiField.attr('type') === 'password') {
        apiField.attr('type', 'text');
        eyeIcon.removeClass('fa-eye').addClass('fa-eye-slash');
      } else {
        apiField.attr('type', 'password');
        eyeIcon.removeClass('fa-eye-slash').addClass('fa-eye');
      }
    });

    Object.values(this.images).forEach((image) => {
      $(`#${image.id}`).click(() => {
        new ImagePopout(image.src, {
          title: image.text,
          shareable: false,
          uuid: image.id,
        }).render(true);
      });
    });
  }
}
