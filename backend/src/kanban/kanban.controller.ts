import { Body, Controller, Delete, Param } from '@nestjs/common'
import { KanbanService } from './kanban.service'
import { Get, Post } from '@nestjs/common'
import { CreateKanbanDto } from './dto/create-kanban.dto'
import { KanbanGateway } from './kanban.gateway'

@Controller('kanban')
export class KanbanController {
  constructor (private readonly kanbanService: KanbanService, private readonly gateway: KanbanGateway) {}

  @Post()
  async create (@Body() dto: CreateKanbanDto) {
    const task = await this.kanbanService.createTask(dto)
    this.gateway.server.emit('taskCreated', task)
    return task
  }

  @Delete(':id')
  async remove (@Param('id') id: string) {
    await this.kanbanService.deleteTask(id)
    this.gateway.server.emit('taskDeleted', { taskId: id })
    return { ok: true }
  }

  @Get()
  async getAllTasks () {
    return this.kanbanService.getAllTasks()
  }

  @Delete(':id')
  async deleteTask (@Param('id') taskId: string) {
    return this.kanbanService.deleteTask(taskId)
  }

  @Post()
  async createTask (taskData: CreateKanbanDto) {
    return this.kanbanService.createTask(taskData)
  }
}
