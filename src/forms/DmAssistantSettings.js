import { DmAssistantConfig } from '../config/DmAssistantConfig';

export class DmAssistantSettings extends FormApplication {
  static get defaultOptions() {
    const defaults = super.defaultOptions;
    const overrides = {
      height: 'auto',
      width: 300,
      id: 'dm-assistant-settings',
      template: DmAssistantConfig.TEMPLATES.SETTINGS,
      title: 'DM Assistant Settings',
    };
    return foundry.utils.mergeObject(defaults, overrides);
  }

  async _updateObject(event, formData) {
    const data = expandObject(formData);
    console.log('DATA |', formData);
    game.settings.set(
      DmAssistantConfig.ID,
      DmAssistantConfig.SETTINGS.OPENAI_API_KEY,
      data,
    );
  }

  getData() {
    return {
      apiKey: game.settings.get(
        DmAssistantConfig.ID,
        DmAssistantConfig.SETTINGS.OPENAI_API_KEY,
      ),
    };
  }
}
