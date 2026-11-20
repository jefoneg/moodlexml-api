import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { PromptDto } from './dto/prompt.dto';
import { PromptHelper } from '../helpers/prompt.helper';

@Injectable()
export class GeminiService {
  private readonly client: GoogleGenAI;
  private readonly model: string;

  constructor(config: ConfigService) {
    this.client = new GoogleGenAI({
      apiKey: config.getOrThrow<string>('GEMINI_API_KEY'),
    });
    this.model = config.get<string>('GEMINI_MODEL', 'gemini-3.8-flash');
  }

  public async generate(prompt: PromptDto): Promise<any> {
    if ('object' !== typeof prompt || 0 === Object.entries(prompt).length) {
      throw new BadRequestException(
        'Request body must include a non-empty "prompt".',
      );
    }
    const response = await this.client.models.generateContent({
      model: this.model,
      contents: PromptHelper.generateMoodleXMLPrompt(prompt.questions, prompt.answerKeys),
    });

    if (!response.text) {
      throw new BadRequestException("There's something wrong with our AI model. Please try again.")
    }

    return response.text ?? '';
  }
}
