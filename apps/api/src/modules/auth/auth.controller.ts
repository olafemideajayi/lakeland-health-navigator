import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() body: { name: string; email: string; phone?: string }) {
    return this.authService.signUp(body.name, body.email, body.phone);
  }

  @Post('signin/staff')
  async signInStaff(@Body() body: { email: string; password: string }) {
    return this.authService.signInStaff(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req: any) {
    return this.authService.validateUser(req.user.sub);
  }
}
