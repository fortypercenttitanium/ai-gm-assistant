import { Configuration, OpenAIApi } from 'openai';
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
      const regexJson = /```(json)?([^`]*)```/gm;
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
          role: 'assistant',
          content: `You are an assistant GM for a Pathfinder 2e Tabletop RPG. The GM will ask you to generate an NPC with certain qualities and you will return a response in JSON format, using the schema provided. Any fields that are not specified by the user's description should be generated intelligently. Here is the schema: ${JSON.stringify(
            schemas.npc,
          )}.`,
        },
        {
          role: 'user',
          content: userMessage,
        },
        {
          role: 'user',
          content:
            "Make sure the NPC's skill tiers are appropriate for their level. Legendary skills are rare, and should only exist on characters level 10 and above.",
        },
      ],
      model: this.model,
    });

    const messageResult = result.data.choices[0].message?.content;

    if (!messageResult)
      throw new Error('No message result returned from API call');

    return OpenAiService.tryParseJSONResponse(messageResult);
  }
}
