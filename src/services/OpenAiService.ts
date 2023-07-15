import {
  Configuration,
  CreateImageRequestResponseFormatEnum,
  OpenAIApi,
} from 'openai';
import schemas from './schemas.json';

export class OpenAiService {
  #openai;
  public model: string;
  public apiKeyIsValid: boolean;

  constructor(apiKey: string) {
    const config = new Configuration({
      apiKey,
    });

    this.model = 'gpt-3.5-turbo';
    this.apiKeyIsValid = false;

    delete config.baseOptions.headers['User-Agent'];

    this.#openai = new OpenAIApi(config);
  }

  static STATUS = {
    READY: 'ready',
    ERROR: 'error',
    API_KEY_INVALID: 'api_key_invalid',
  };

  async getCurrentStatus() {
    try {
      await this.#openai.retrieveModel(this.model);
      return OpenAiService.STATUS.READY;
    } catch (error: any) {
      if (error.message?.toLowerCase().includes('status code 401'))
        return OpenAiService.STATUS.API_KEY_INVALID;

      return OpenAiService.STATUS.ERROR;
    }
  }

  static tryParseJSONResponse(json: string) {
    try {
      const result = JSON.parse(json);
      return result;
    } catch (error) {
      // try to get the string between ```json and ```
      const regexJson = /```(json)?([^`]*)```/gim;
      const matchesJson = regexJson.exec(json);
      if (matchesJson?.[2]) return JSON.parse(matchesJson[2].trim());

      // try to get the string between ``` and ```
      const regexNoJson = /```([^`]*)```/gm;
      const matchesNoJson = regexNoJson.exec(json);
      if (matchesNoJson?.[1]) return JSON.parse(matchesNoJson[1].trim());

      // look for the first { and last }
      const first = json.indexOf('{');
      const last = json.lastIndexOf('}');
      if (first !== -1 && last !== -1) {
        const jsonString = json.substring(first, last + 1);
        return JSON.parse(jsonString);
      }

      throw new Error(`Unable to parse JSON from response: ${json}`);
    }
  }

  async createNPC(userMessage: string) {
    const result = await this.#openai.createChatCompletion({
      messages: [
        {
          role: 'system',
          content: `You are an assistant GM for a Pathfinder 2e Tabletop RPG. The GM will ask you to generate an NPC with certain qualities and you will return a response in JSON format, using the schema provided. Any fields that are not specified by the user's description should be generated intelligently. MOST IMPORTANTLY - an NPC's skills should be appropriate for their level. For example, an NPC below level 10 should not have ANY legendary skills. Try to avoid giving the characters names that already exist in popular works. Here is the schema: ${JSON.stringify(
            schemas.npc,
          )}.`,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      model: this.model,
    });

    const messageResult = result.data.choices[0].message?.content;

    if (!messageResult)
      throw new Error('No message result returned from API call');

    return OpenAiService.tryParseJSONResponse(messageResult);
  }

  async createActorIcons(
    race: string,
    className: string,
    appearance: string,
    numberOfImages: number = 4,
    size: ImageSize = '256x256',
  ): Promise<string[]> {
    const prompt = `A Pathfinder2e ${race ?? 'Human'} ${
      className ?? 'Commoner'
    } with the following description: ${appearance ?? 'Average in every way.'}`;

    const images = await this.#openai.createImage({
      prompt,
      n: numberOfImages,
      size,
      response_format: CreateImageRequestResponseFormatEnum.B64Json,
    });

    return images.data.data.map((d) => `data:image/png;base64,${d.b64_json}`);
  }
}

type ImageSize = '256x256' | '512x512' | '1024x1024';
