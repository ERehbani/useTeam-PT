/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'
import * as crypto from 'crypto'

export type SessionDocument = HydratedDocument<Session>

@Schema({ timestamps: true })
export class Session {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId

  @Prop({ required: true, index: true })
  tokenHash: string

  @Prop()
  userAgent?: string

  @Prop()
  ip?: string

  @Prop({ type: Date, index: { expireAfterSeconds: 0 }, required: false })
  expiresAt?: Date

  @Prop({ default: true })
  isActive: boolean
}

export const SessionSchema = SchemaFactory.createForClass(Session)

export function hashToken (token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}
