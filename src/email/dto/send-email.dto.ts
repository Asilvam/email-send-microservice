import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendEmailDto {
  @ApiProperty({
    description: 'The recipient email address',
    example: 'recipient@example.com',
  })
  @IsEmail()
  to: string;

  @ApiProperty({
    description: 'The subject of the email',
    example: 'Welcome to Our Service!',
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    description: 'The HTML body of the email',
    example: '<p>Thank you for signing up.</p>',
  })
  @IsString()
  @IsNotEmpty()
  html: string;

  @ApiPropertyOptional({
    description: 'Optional display name for the sender',
    example: 'Barber System',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Matches(/^[^\r\n]+$/, {
    message: 'fromName cannot contain line breaks',
  })
  fromName?: string;
}
