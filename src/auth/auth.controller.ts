import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthParamsDto, AuthResponseDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { ApiBadRequestResponse, ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'User login', description: 'Authenticate user and return JWT token' })
  @ApiBody({ type: AuthParamsDto })
  @ApiOkResponse({ description: 'Access token', type: AuthResponseDto, example: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(@Body() authPayload: AuthParamsDto) {
    return this.authService.validateUser(authPayload);
  }

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'User registration', description: 'Create user and return JWT token' })
  @ApiBody({ type: AuthParamsDto })
  @ApiCreatedResponse({ description: 'Access token', type: AuthResponseDto, example: AuthResponseDto })
  @ApiBadRequestResponse({ description: 'Missing required fields' })
  @ApiConflictResponse({ description: 'Email is already in use'})
  async register(@Body() registerPayload: AuthParamsDto) {
    return this.authService.register(registerPayload);
  }
}
