/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import * as bcrypt from 'bcrypt'
import { Model, Types } from 'mongoose'
import { SessionService } from 'src/session/session.service'
import { CreateUserDto } from './dto/create-user.dto'
import { User, UserDocument } from './schemas/user.schema'


// Servicio de usuario con la base de datos
@Injectable()
export class UserService {
  constructor (
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private sessionService: SessionService
  ) {}

  async create (createUserDto: CreateUserDto) {
    const { email, password } = createUserDto
    const hashPassword = await bcrypt.hash(password, 10)
    const user = new this.userModel({ email, password: hashPassword })
    return user.save()
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  findOne (id: string): Promise<User | null> {
    return this.userModel.findOne({ _id: id }).exec()
  }

  async validatePassword (password: string, hashed: string): Promise<boolean> {
    return await bcrypt.compare(password, hashed)
  }

  // validacion de usuario con passport

  async validateUser (email: string, pass: string): Promise<any> {
    const user = await this.findByEmail(email)
    if (user && (await this.validatePassword(pass, user.password))) {
      const { password, ...result } = user
      return result
    }
    return null
  }

  // login con passport

  async login(email: string, password: string, ua: string | undefined, ip: string | undefined) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
  
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) throw new UnauthorizedException('Credenciales inválidas');
  
  
    const payload = { email: user.email, sub: user._id };
  
    const token = this.jwtService.sign(payload);

    const decoded: any = this.jwtService.decode(token);
    const expMs = decoded?.exp ? decoded.exp * 1000 : undefined;
    const expiresAt = expMs ? new Date(expMs) : undefined;

    await this.sessionService.create({
      userId: user._id as Types.ObjectId,
      token,
      userAgent: ua,
      ip,
      expiresAt
    })
  
    return {
      access_token: token,
      user: {
        _id: user._id,
        email: user.email,
        ua,
        ip,
        expiresAt
      },
    };
  }

  remove (id: number) {
    return `This action removes a #${id} user`
  }
}
