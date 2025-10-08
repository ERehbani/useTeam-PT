/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from 'src/kanban/lib/jwt.strategy'
import { LocalStrategy } from 'src/kanban/lib/local.strategy'
import { SessionModule } from 'src/session/session.module'
import { User, UserSchema } from 'src/user/schemas/user.schema'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule,
    SessionModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [UserService, LocalStrategy, JwtStrategy],
})
export class UserModule {}
