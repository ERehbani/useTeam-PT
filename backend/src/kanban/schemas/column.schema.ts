import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Column extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ default: 0 })
  order: number;
}

export const ColumnSchema = SchemaFactory.createForClass(Column);
