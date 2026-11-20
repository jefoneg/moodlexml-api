import { IsString } from "class-validator";

export class PromptDto {
  @IsString()
  questions: string;

  @IsString()
  answerKeys: string;
}
