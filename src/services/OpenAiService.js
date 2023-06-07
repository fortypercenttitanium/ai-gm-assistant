import { Configuration, OpenAIApi } from 'openai';
import schemas from './schemas.json';

export class OpenAiService {
  #openai;

  constructor(apiKey) {
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
    } catch (error) {
      if (error.message?.toLowerCase().includes('status code 401'))
        return OpenAiService.STATUS.API_KEY_INVALID;

      return OpenAiService.STATUS.ERROR;
    }
  }

  static tryParseJSONResponse(json) {
    try {
      const result = JSON.parse(json);
      return result;
    } catch (error) {
      // try to get the string between ```json and ```
      const regex1 = /```(json)?([^`]*)```/gm;
      const matches1 = regex1.exec(json);
      if (matches1?.length > 1) return JSON.parse(matches1[2]);

      // try to get the string between ``` and ```
      const regex2 = /```([^`]*)```/gm;
      const matches2 = regex2.exec(json);
      if (matches2?.length > 1) return JSON.parse(matches2[1]);

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

  async createNPC(userMessage) {
    const result = await this.#openai.createChatCompletion({
      messages: [
        {
          role: 'assistant',
          content: `You are an assistant GM for a Pathfinder 2e RPG. The GM will ask you to generate an NPC with certain qualities and you will return a response in JSON format, using the schema provided. The GM may provide some of these fields, but any that are not provided should be generated. Take special care to ensure the skill levels are appropriate for the NPC's level, for example, no character below 5 should be legendary in any skill, and no character below 15 should be legendary in more than one skill. Here is the schema: ${JSON.stringify(
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

    return OpenAiService.tryParseJSONResponse(
      result.data.choices[0].message.content,
    );
  }
}
