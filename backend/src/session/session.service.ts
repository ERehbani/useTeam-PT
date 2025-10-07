/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Session, SessionDocument, hashToken } from './schemas/session.schema';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
  ) {}

  async create(opts: {
    userId: Types.ObjectId;
    token: string;
    userAgent?: string;
    ip?: string;
    expiresAt?: Date;
  }) {
    const tokenHash = hashToken(opts.token);
    return this.sessionModel.create({
      userId: opts.userId,
      tokenHash,
      userAgent: opts.userAgent,
      ip: opts.ip,
      expiresAt: opts.expiresAt,
      isActive: true,
    });
  }

  async findByToken(token: string) {
    return this.sessionModel.findOne({ tokenHash: hashToken(token) }).exec();
  }

  async deactivateByToken(token: string) {
    return this.sessionModel.updateOne(
      { tokenHash: hashToken(token) },
      { $set: { isActive: false } },
    ).exec();
  }

  async removeByToken(token: string) {
    return this.sessionModel.deleteOne({ tokenHash: hashToken(token) }).exec();
  }
}
