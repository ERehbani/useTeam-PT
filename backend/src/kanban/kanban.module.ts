import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KanbanController } from './kanban.controller';
import { KanbanGateway } from './kanban.gateway';
import { KanbanService } from './kanban.service';
import { Column, ColumnSchema } from './schemas/column.schema';
import { Task, TaskSchema } from './schemas/task.schema';

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
