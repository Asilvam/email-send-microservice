import { Body, Controller, Post, Get, Logger } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/send-email.dto';
import { ApiHeader, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { InternalApiKey } from '../common/decorators/api-key.decorator';

@ApiTags('emails send')
@Controller('email') // Prefijo para este controlador (ej: /api/email)
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(private readonly emailService: EmailService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check for the microservice' })
  @ApiResponse({ status: 200, description: 'Service is running.' })
  healthCheck() {
    this.logger.log('Health check endpoint was hit.');
    return {
      status: 'OK',
      service: 'Email Send Microservice',
    };
  }

  @Post('send')
  @ApiOperation({
    summary: 'Send new email, protected by X-Internal-API-Key header.',
  })
  @ApiSecurity('InternalAuth')
  @ApiHeader({
    name: 'X-Internal-API-Key',
    description: 'Shared internal API key',
    required: true,
  })
  @InternalApiKey() // <-- El decorador ahora protege todo el método
  @ApiResponse({
    status: 201,
    description: 'The email has been sent successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request (Invalid DTO).' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized due to invalid or missing API Key.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error (e.g., SMTP Connection timeout).',
  })
  async sendEmail(@Body() sendEmailDto: SendEmailDto) {
    this.logger.log(`Received valid request to send email to: ${sendEmailDto.to}`);
    await this.emailService.sendEmail(sendEmailDto);
    return { message: 'Email sent successfully' };
  }
}
