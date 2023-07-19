import { Config } from '../config/Config';
import { FoundryHelper } from '../services/FoundryHelper';

export type AgaImage = {
  id: string;
  src: string;
  text: string;
};

export class GeneratorSettingsForm extends FormApplication {
  static ID = 'aga-assistant-generator-settings';

  static get defaultOptions() {
    const defaults = super.defaultOptions;
    const overrides = {
      height: 'auto',
      width: 560,
      id: this.ID,
      template: Config.TEMPLATES.GENERATOR_SETTINGS,
      title: 'AI GM Assistant Generator Settings',
      closeOnSubmit: true,
    };

    return foundry.utils.mergeObject(defaults, overrides);
  }

  async _updateObject(_: any, formData: any) {
    const data = expandObject(formData);
    const {
      npcAbilities,
      npcAc,
      npcAlignment,
      npcAppearance,
      npcBackstory,
      npcClass,
      npcHp,
      npcImageCount,
      npcImageSize,
      npcItems,
      npcLanguages,
      npcLevel,
      npcName,
      npcRace,
      npcRarity,
      npcSaves,
      npcSenses,
      npcShouldGenerateImages,
      npcSize,
      npcSkills,
    } = data;

    const npcSettings = {
      images: {
        count: npcImageCount,
        size: npcImageSize,
        shouldGenerate: npcShouldGenerateImages,
      },
      properties: {
        abilities: npcAbilities,
        ac: npcAc,
        alignment: npcAlignment,
        appearance: npcAppearance,
        backstory: npcBackstory,
        class: npcClass,
        hp: npcHp,
        items: npcItems,
        languages: npcLanguages,
        level: npcLevel,
        name: npcName,
        race: npcRace,
        rarity: npcRarity,
        saves: npcSaves,
        senses: npcSenses,
        size: npcSize,
        skills: npcSkills,
      },
    };

    const settings = game.settings.get(
      Config.ID,
      Config.SETTINGS.GENERATOR_SETTINGS,
      {
        [Config.SYSTEM.id]: {
          npc: npcSettings,
        },
      },
    );

    game.settings.set(Config.ID, Config.SETTINGS.GENERATOR_SETTINGS, {
      ...settings,
      current: {
        ...settings.current,
        [Config.SYSTEM.id]: {
          ...settings.current?.[Config.SYSTEM.id],
          npc: npcSettings,
        },
      },
    });

    FoundryHelper.notify('Settings saved!');
    this.close();
  }

  getData() {
    const settings = game.settings.get(
      Config.ID,
      Config.SETTINGS.GENERATOR_SETTINGS,
    );

    return (
      settings.current?.[Config.SYSTEM.id] ?? settings.default[Config.SYSTEM.id]
    );
  }

  activateListeners(html: any) {
    super.activateListeners(html);

    const settings = this.getData();

    const imageSizeSelection = settings.npc.images.size;
    const shouldGenerateImages = settings.npc.images.shouldGenerate;
    const imageSizeRadios = document.querySelectorAll(
      'input[name="npcImageSize"]',
    );
    const imageCostSpan = document.querySelector('.aga-image-cost');
    const imageOptionsContainer = document.querySelector('.aga-image-options');

    const selectedSize = document.querySelector(
      `input[name="npcImageSize"][value="${imageSizeSelection}"]`,
    );
    selectedSize?.setAttribute('checked', '');

    if (shouldGenerateImages) {
      const shouldGenerateCheckbox = document.querySelector(
        "input[name='npcShouldGenerateImages']",
      );
      shouldGenerateCheckbox?.setAttribute('checked', '');
      toggleImageInputs(true);
    } else {
      toggleImageInputs(false);
      imageOptionsContainer?.classList.add('hidden');
    }

    document
      .querySelector('input[name="npcShouldGenerateImages"]')
      ?.addEventListener('change', function (e) {
        toggleImageInputs((e.currentTarget as HTMLInputElement)?.checked);
      });

    function toggleImageInputs(enabled: boolean) {
      imageOptionsContainer?.classList.toggle('hidden', !enabled);
      const imageInputs = document.querySelectorAll('input[name^="npcImage"]');
      imageInputs.forEach(function (input) {
        if (enabled) {
          input.removeAttribute('disabled');
          input.setAttribute('required', 'true');
        } else {
          input.setAttribute('disabled', 'disabled');
          input.removeAttribute('required');
        }
      });
    }

    function updateImageCost() {
      const selectedValue = document
        .querySelector('input[name="npcImageSize"]:checked')
        ?.getAttribute('value');

      let costText = '';

      if (selectedValue === '256x256') {
        costText = '($0.016 / image)';
      } else if (selectedValue === '512x512') {
        costText = '($0.018 / image)';
      } else if (selectedValue === '1024x1024') {
        costText = '($0.02 / image)';
      }

      if (imageCostSpan) imageCostSpan.textContent = costText;
    }

    // Initially update the image cost
    updateImageCost();

    // Add event listeners to radio inputs
    imageSizeRadios.forEach(function (radio) {
      radio.addEventListener('change', updateImageCost);
    });
  }
}
