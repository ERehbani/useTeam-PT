/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  columnId: string;

  @Prop({ type: Number, required: true, default: 0 })
  position: number;

  @Prop()
  responsability: string[];

  @Prop({ required: true })
  collaboratorId: string[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);
TaskSchema.index({ columnId: 1, position: 1 });
