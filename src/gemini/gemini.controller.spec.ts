import { GeminiController } from './gemini.controller';
import { GeminiService } from './gemini.service';
import { PromptDto } from './dto/prompt.dto';

describe('GeminiController', () => {
  let controller: GeminiController;
  let geminiService: jest.Mocked<Pick<GeminiService, 'generate'>>;

  beforeEach(() => {
    geminiService = {
      generate: jest.fn(),
    };
    controller = new GeminiController(geminiService as GeminiService);
  });

  it('passes the nested prompt to the Gemini service', async () => {
    const prompt: PromptDto = {
      questions: 'What is 2 + 2?',
      answerKeys: '',
    };
    const result = '{"xml":"<quiz></quiz>","preview":[]}';
    geminiService.generate.mockResolvedValue(result);

    await expect(controller.generate(prompt)).resolves.toBe(result);
    expect(geminiService.generate).toHaveBeenCalledWith(prompt);
  });
});
