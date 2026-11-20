import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { GeminiService } from './gemini.service';
import { PromptDto } from './dto/prompt.dto';

const mockGenerateContent = jest.fn();

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: mockGenerateContent,
    },
  })),
}));

describe('GeminiService', () => {
  let service: GeminiService;
  let config: jest.Mocked<Pick<ConfigService, 'get' | 'getOrThrow'>>;

  beforeEach(() => {
    mockGenerateContent.mockReset();
    config = {
      get: jest.fn().mockReturnValue('gemini-test'),
      getOrThrow: jest.fn().mockReturnValue('test-api-key'),
    };
    service = new GeminiService(config as ConfigService);
  });

  it('sends the generated Moodle prompt to the configured model', async () => {
    const prompt: PromptDto = {
      questions: 'What is 2 + 2?',
      answerKeys: '4',
    };
    const responseText = '{"xml":"<quiz></quiz>","preview":[]}';
    mockGenerateContent.mockResolvedValue({ text: responseText });

    await expect(service.generate(prompt)).resolves.toBe(responseText);

    expect(config.getOrThrow).toHaveBeenCalledWith('GEMINI_API_KEY');
    expect(mockGenerateContent).toHaveBeenCalledWith({
      model: 'gemini-test',
      contents: expect.stringContaining(prompt.questions),
    });
    expect(mockGenerateContent.mock.calls[0][0].contents).toContain(
      prompt.answerKeys,
    );
  });

  it('accepts an empty answer key and asks Gemini to infer a missing answer', async () => {
    mockGenerateContent.mockResolvedValue({ text: 'generated quiz' });

    await service.generate({
      questions: 'What is 2 + 2?',
      answerKeys: '',
    });

    const request = mockGenerateContent.mock.calls[0][0];
    expect(request.contents).toContain('If an answer key is missing');
    expect(request.contents).toContain('Answer Keys:');
  });

  it('rejects an empty prompt object without calling Gemini', async () => {
    await expect(service.generate({} as PromptDto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it('rejects an empty model response', async () => {
    mockGenerateContent.mockResolvedValue({ text: '' });

    await expect(
      service.generate({ questions: 'Question', answerKeys: '' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
