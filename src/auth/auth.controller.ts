import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { AuthParamsDto, AuthResponseDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { ApiBadRequestResponse, ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'User login', description: 'Login user account. Returns success message and sets HTTP-only authentication cookie.' })
  @ApiBody({ type: AuthParamsDto })
  @ApiOkResponse({ 
    description: 'User successfully logged. Authentication cookie set in response headers.',
    type: AuthResponseDto,
    headers: {
      'Set-Cookie': {
        description: 'HTTP-only authentication cookie containing JWT token',
        schema: {
          type: 'string',
          example: 'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=None; Max-Age=3600'
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(
    @Body() authPayload: AuthParamsDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const authResult = await this.authService.validateUser(authPayload);
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('access_token', authResult.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: parseInt(process.env.JWT_EXPIRATION || '3600', 10) * 1000,
      path: '/',
    });

    return { message: 'User logged successfully' };
  }

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'User registration', description: 'Create a new user account. Returns success message and sets HTTP-only authentication cookie.' })
  @ApiBody({ type: AuthParamsDto })
  @ApiCreatedResponse({ 
    description: 'User successfully registered. Authentication cookie set in response headers.',
    type: AuthResponseDto,
    headers: {
      'Set-Cookie': {
        description: 'HTTP-only authentication cookie containing JWT token',
        schema: {
          type: 'string',
          example: 'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=None; Max-Age=3600'
        }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Missing required fields' })
  @ApiConflictResponse({ description: 'Email is already in use'})
  async register(
    @Body() registerPayload: AuthParamsDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const authResult = await this.authService.register(registerPayload);

    res.cookie('access_token', authResult.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: parseInt(process.env.JWT_EXPIRATION || '3600', 10) * 1000,
    });

    return { message: 'User registered successfully' };
  }
}
