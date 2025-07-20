import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserResponseDto } from './dto/user.dto';
import { UserEntity } from './entities/user.entity';
import { User } from '../shared/decorators/user.decorator';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get authenticated user profile',
    description: 'Retrieve profile information of the authenticated user',
  })
  @ApiCookieAuth('access_token')
  @ApiOkResponse({
    description: 'User profile information',
    type: UserResponseDto,
    example: UserResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  async getProfile(@User() user: UserEntity) {
    return this.userService.getProfile(user.id);
  }
}
