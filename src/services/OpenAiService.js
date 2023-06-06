import { Configuration, OpenAIApi } from 'openai';

export class OpenAiService {
  #openai;

  constructor(apiKey) {
    const config = new Configuration({
      apiKey: 'foo',
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
      return this.STATUS.READY;
    } catch (error) {
      if (error.message?.toLowerCase().includes('status code 401'))
        return this.STATUS.API_KEY_INVALID;

      return this.STATUS.ERROR;
    }
  }

  async createNPC(userMessage) {
    return await this.#openai.createChatCompletion({
      messages: [
        {
          role: 'assistant',
          content:
            'You are an assistant GM for a Pathfinder 2e RPG. The GM will ask you to generate an NPC with certain qualities and you will return a response in JSON format, filling out these properties: name, shortDescription, race, age, backstory',
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      model: this.model,
    });
  }
}
