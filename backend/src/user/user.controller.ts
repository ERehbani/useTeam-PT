/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UserService } from './user.service'
import { SessionService } from 'src/session/session.service'
import { ExtractJwt } from 'passport-jwt'
import { JwtAuthGuard } from 'src/kanban/lib/jwt.auth-guard'

type loginType = {
  _id: string
  email: string
}

@Controller('user')
export class UserController {
  constructor (
    private readonly userService: UserService,
    private sessionService: SessionService,
  ) {}

  @Post('register')
  async register (@Body() createUserDto: CreateUserDto) {
    const { email, password } = createUserDto
    const existingUser = await this.userService.findByEmail(email)
    if (existingUser) {
      throw new Error('User already exists')
    }

    const user = await this.userService.create({ email, password })
    const { password: pass, ...result } = user.toObject()
    return {
      message: 'Usuario creado satisfactoriamente',
      user: result,
    }
  }

  @Post('login')
  async login (
    @Body() body: { email: string; password: string },
    @Req() req: Request,
  ) {
    const ua = req.headers['user-agent'] as string | undefined
    const ip = (req.headers['x-forwarded-for'] as string) || undefined
    console.log(body)
    const result = await this.userService.login(
      body.email,
      body.password,
      ua,
      ip,
    )
    console.log(result)
    return result
  }

  @Post('logout')
  async logout (@Req() req: Request) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req)
    await this.sessionService.removeByToken(token)
    return { ok: true }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me (@Req() req: any) {
    return { _id: req.user.userId, email: req.user.email }
  }

  @Delete(':id')
  remove (@Param('id') id: string) {
    return this.userService.remove(+id)
  }
}
