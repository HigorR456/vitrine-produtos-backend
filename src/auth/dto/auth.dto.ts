import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class AuthParamsDto {
  @ApiProperty({
    description: 'The user email',
    example: 'john.doe@email.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The user password',
    example: '123456',
  })
  @IsString()
  @MinLength(6)
  password: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'User logged/registered successfully',
  })
  message: string;
}
