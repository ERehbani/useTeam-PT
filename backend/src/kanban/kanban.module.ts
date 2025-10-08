import { Module } from '@nestjs/common';
import { KanbanService } from './kanban.service';
import { KanbanGateway } from './kanban.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schemas/task.schema';
import { Column, ColumnSchema } from './schemas/column.schema';
import { KanbanController } from './kanban.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Task.name, schema: TaskSchema},
      {name: Column.name, schema: ColumnSchema},
    ])
  ],
  providers: [KanbanGateway, KanbanService],
  exports: [KanbanGateway, KanbanService],
  controllers: [KanbanController],
})
export class KanbanModule {}
