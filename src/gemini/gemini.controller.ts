import {
  Body,
  Controller,
  Post
} from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { PromptDto } from './dto/prompt.dto';

@Controller({ version: '1', path: 'prompt' })
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('generate')
  public generate(@Body('prompt') prompt: PromptDto) {
    return this.geminiService.generate(prompt);
  }
}
