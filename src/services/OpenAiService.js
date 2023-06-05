import { Configuration, OpenAIApi } from 'openai';

export class OpenAiService {
  #MODEL = 'gpt-3.5-turbo';
  #openai;

  constructor(apiKey) {
    const config = new Configuration({
      apiKey,
    });

    delete config.baseOptions.headers['User-Agent'];

    this.#openai = new OpenAIApi(config);
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
      model: this.#MODEL,
    });
  }
}
