import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateQuestionDto {
    @ApiProperty()
    @IsString() @MinLength(5) @MaxLength(1000)
    content: string;
}