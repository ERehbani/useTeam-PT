import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import { CreateKanbanDto } from './dto/create-kanban.dto'
import { KanbanService } from './kanban.service'

@WebSocketGateway({
  namespace: '/kanban',
  cors: {
    origin: '*',
  },
})
export class KanbanGateway {
  @WebSocketServer()
  server: Server
  constructor (private readonly kanbanService: KanbanService) {}

  handleConnection (client: any) {
    console.log(`Client connected: ${client.id}`)
    client.emit('connected', 'You are connected')
  }

  handleDisconnect (client: any) {
    console.log(`Client disconnected: ${client.id}`)
  }

  @SubscribeMessage('createTask')
  async onCreateTask (@MessageBody() dto: any) {
    const task = await this.kanbanService.createTask(dto)

    this.server.emit('taskCreated', task)
    return { ok: true, task }
  }

  @SubscribeMessage('subscribeToConnected')
  async handleSubscribeToConnected () {
    this.server.emit('connected', this.server.sockets.sockets.size)
    console.log(this.server.sockets.sockets.size)
  }

  @SubscribeMessage('reorderColumn')
  async handleReorderColumn (
    @MessageBody()
    data: {
      columnId: string
      items: { taskId: string; position: number }[]
    },
  ) {
    const { columnId, items } = data
    const ordered = await this.kanbanService.reorderColumn(columnId, items)

    this.server.emit('columnReordered', { columnId, tasks: ordered })
    return { ok: true }
  }

  @SubscribeMessage('updateTask')
  async handleUpdateTask (
    @MessageBody() data: { taskId: string; updatedData: any },
  ) {
    const updatedTask = await this.kanbanService.updateTask(
      data.taskId,
      data.updatedData,
    )
    this.server.emit('taskUpdated', updatedTask)
    return { ok: true }
  }

  @SubscribeMessage('deleteTask')
  onDeleteTask (@MessageBody() { taskId }: { taskId: string }) {
    this.kanbanService.deleteTask(taskId)
    this.server.emit('taskDeleted', { taskId })
    return { ok: true }
  }
}
