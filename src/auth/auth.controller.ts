import {
  Body,
  Controller,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthParamsDto, AuthResponseDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'User login',
    description:
      'Login user account. Returns success message and sets HTTP-only authentication cookie.',
  })
  @ApiBody({ type: AuthParamsDto })
  @ApiOkResponse({
    description:
      'User successfully logged. Authentication cookie set in response headers.',
    type: AuthResponseDto,
    headers: {
      'Set-Cookie': {
        description: 'HTTP-only authentication cookie containing JWT token',
        schema: {
          type: 'string',
          example:
            'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=None; Max-Age=3600',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(
    @Body() authPayload: AuthParamsDto,
    @Res({ passthrough: true }) res: Response,
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
  @ApiOperation({
    summary: 'User registration',
    description:
      'Create a new user account. Returns success message and sets HTTP-only authentication cookie.',
  })
  @ApiBody({ type: AuthParamsDto })
  @ApiCreatedResponse({
    description:
      'User successfully registered. Authentication cookie set in response headers.',
    type: AuthResponseDto,
    headers: {
      'Set-Cookie': {
        description: 'HTTP-only authentication cookie containing JWT token',
        schema: {
          type: 'string',
          example:
            'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=None; Max-Age=3600',
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Missing required fields' })
  @ApiConflictResponse({ description: 'Email is already in use' })
  async register(
    @Body() registerPayload: AuthParamsDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const authResult = await this.authService.register(registerPayload);
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('access_token', authResult.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: parseInt(process.env.JWT_EXPIRATION || '3600', 10) * 1000,
      path: '/',
    });

    return { message: 'User registered successfully' };
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'User logout',
    description:
      'Logs out the user by clearing the authentication cookie (access_token).',
  })
  @ApiOkResponse({
    description: 'User successfully logged out. Authentication cookie cleared.',
    schema: {
      example: {
        message: 'User logged out successfully',
      },
    },
    headers: {
      'Set-Cookie': {
        description: 'Clears the access_token HTTP-only cookie',
        schema: {
          type: 'string',
          example:
            'access_token=; HttpOnly; Secure; SameSite=None; Max-Age=0; Path=/',
        },
      },
    },
  })
  logout(@Res({ passthrough: true }) res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    });

    return { message: 'User logged out successfully' };
  }
}
