import { Controller, Get, Req, Res } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request, Response } from 'express';

@Controller('csrf-token')
export class CsrfController {
  @Get()
  @ApiExcludeEndpoint()
  getCsrfToken(@Req() req: Request, @Res() res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    const token = req.csrfToken();

    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false,
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction,
    });

    res.json({ csrfToken: token });
  }
}
