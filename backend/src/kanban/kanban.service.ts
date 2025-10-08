/* eslint-disable prettier/prettier */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CreateKanbanDto } from './dto/create-kanban.dto'
import { UpdateKanbanDto } from './dto/update-kanban.dto'
import { Column } from './schemas/column.schema'
import { Task } from './schemas/task.schema'
import { EColumn } from './lib'
import { Types } from 'mongoose'

@Injectable()
export class KanbanService {
  constructor (
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(Column.name) private columnModel: Model<Column>,
  ) {}

  async moveTask (taskId: string, targetColumnId: string) {
    const updatedTask = await this.taskModel.findByIdAndUpdate(
      taskId,
      { columnId: targetColumnId },
      { new: true },
    )

    if (!updatedTask) throw new NotFoundException('Task not found')
    return updatedTask
  }

  async reorderColumn (
    columnId: string,
    items: { taskId: string; position: number }[],
  ) {
    if (!columnId) throw new BadRequestException('columnId required')
    if (!Array.isArray(items) || !items.length) {
      throw new BadRequestException('items required')
    }

    const ids = items.map(i => new Types.ObjectId(i.taskId))
    const tasks = await this.taskModel
      .find({ _id: { $in: ids } }, { columnId: 1 })
      .lean()
    if (tasks.some(t => t.columnId !== columnId)) {
      throw new BadRequestException(
        'All tasks must belong to the provided columnId',
      )
    }

    const ops = items.map(i => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(i.taskId) },
        update: { $set: { position: i.position } },
      },
    }))

    await this.taskModel.bulkWrite(ops, { ordered: true })

    return this.taskModel
      .find({ columnId })
      .sort({ position: 1, updatedAt: 1, _id: 1 })
      .lean()
  }

  async normalizePositions (columnId: string) {
    const tasks = await this.taskModel
      .find({ columnId })
      .sort({ position: 1, updatedAt: 1, _id: 1 })
    const ops = tasks.map((t, idx) => ({
      updateOne: {
        filter: { _id: t._id },
        update: { $set: { position: idx } },
      },
    }))
    if (ops.length) await this.taskModel.bulkWrite(ops)
    return this.taskModel.find({ columnId }).sort({ position: 1 }).lean()
  }

  async getAllTasks () {
    return await this.taskModel.find().exec()
  }

  async createTask (taskData: CreateKanbanDto) {
    const task = new this.taskModel(taskData)
    console.log(task)
    return await task.save()
  }

  async updateTask (taskId: string, updatedData: Partial<Task>) {
    const updated = await this.taskModel
      .findByIdAndUpdate(taskId, updatedData, { new: true })
      .lean()
    if (!updated) throw new BadRequestException('Task not found')
    return updated
  }

  async deleteTask (taskId: string) {
    const task = await this.taskModel.findByIdAndDelete(taskId)
    if (!task) throw new Error('Task not found')
    return task
  }

  async getTaskById (taskId: string) {
    const task = await this.taskModel.findById(taskId)
    if (!task) throw new Error('Task not found')
    return task
  }
}
