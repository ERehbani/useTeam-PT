import { PartialType } from '@nestjs/mapped-types';
import { CreateKanbanDto } from './create-kanban.dto';
import { ObjectId } from 'mongoose';
import { EColumn } from '../lib';

export class UpdateKanbanDto extends PartialType(CreateKanbanDto) {
  id: ObjectId;
  title: string;
  description: string;
  columnId: string;
  collaboratorId?: string[] | undefined;
}
