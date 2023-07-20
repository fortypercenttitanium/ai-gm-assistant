import { Config } from '../config/Config';
import { GeneratedImageData, GeneratorSettings } from '../types/AgaTypes';

export class DashboardController {
  public static selectedNpcImage: number | null = null;
  public static npcImages: GeneratedImageData[] = [];

  public static setNpcImages(imageUrls: string[], characterName: string) {
    DashboardController.npcImages = imageUrls.map((url, index) => ({
      url,
      fileName: DashboardController.generateImageFileName(index, characterName),
      uploaded: false,
    }));
  }

  public static generateImageFileName(
    imageId: number,
    characterName: string,
  ): string {
    return `${characterName}-${imageId}.png`;
  }

  public static getSelectedImage(): GeneratedImageData | undefined {
    if (DashboardController.selectedNpcImage == null) return undefined;
    return DashboardController.npcImages[DashboardController.selectedNpcImage];
  }

  public static getGeneratorSettings(): GeneratorSettings {
    const settings = game.settings.get(
      Config.ID,
      Config.SETTINGS.GENERATOR_SETTINGS,
    );
    return settings.current ?? settings.default;
  }
}
