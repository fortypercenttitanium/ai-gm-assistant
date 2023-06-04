import { Configuration, OpenAIApi } from 'openai';

export class OpenAiService {
  #openai;

  constructor() {
    const config = new Configuration({
      apiKey: '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',
      model: 'gpt-3.5-turbo',
    });

    this.#openai = new OpenAIApi(config);
  }

  async createNPC(userMessage) {
    return await this.#openai.createCompletion({
      prompt: [
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
    });
  }
}
