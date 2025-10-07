'use client'
import { Task } from '@/app/entities/task/types'
import { getSocket } from '@/shared/lib/socket'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'
import { Field, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Spinner } from '@/shared/ui/spinner'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Pencil, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

function SortableItem({
  task,
  id
}: {
  task?: Task | undefined
  id: string | undefined
  handle?: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task?._id || id || '' })

  const [deleting, setDeleting] = useState(false)

  // --- edición ---
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [responsabilityStr, setResponsabilityStr] = useState(
    (task?.responsability ?? []).join(', ')
  )
  const [isPressed, setIsPressed] = useState(false)

  const handlePointerDown = () => setIsPressed(true)
  const handlePointerUp = () => setIsPressed(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  const handleDelete = () => {
    if (!task?._id) return
    const s = getSocket()
    setDeleting(true)
    s.emit('deleteTask', { taskId: task._id }, (ack?: { ok: boolean; message?: string }) => {
      setDeleting(false)
      if (!ack?.ok) {
        console.warn('deleteTask error:', ack?.message)
        toast.error(`Tarea ${task?.title} no se pudo eliminar`)
        return
      }
      toast.success(`Tarea ${task?.title} eliminada exitosamente`)
    })
  }

  const handleEditOpenChange = (open: boolean) => {
    setIsEditOpen(open)
    if (open) {
      setTitle(task?.title ?? '')
      setDescription(task?.description ?? '')
      setResponsabilityStr((task?.responsability ?? []).join(', '))
    }
  }

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!task?._id) return

    const newTitle = title.trim()
    if (!newTitle) {
      toast.error('El título es obligatorio')
      return
    }

    const updatedData = {
      title: newTitle,
      description: description.trim(),
      responsability: responsabilityStr
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
    }

    const s = getSocket()
    setSaving(true)
    s.emit('updateTask', { taskId: task._id, updatedData }, (ack?: { ok: boolean; message?: string }) => {
      setSaving(false)
      if (!ack?.ok) {
        console.warn('updateTask error:', ack?.message)
        toast.error('No se pudo actualizar la tarea')
        return
      }
      toast.success('Tarea actualizada')
      setIsEditOpen(false)
    })
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      key={task?._id}
      className={`p-2 mb-2 rounded shadow flex flex-col gap-3 
        transition-colors duration-200
        ${isDragging ? 'bg-gray-200 text-white' : 
          isPressed ? 'bg-primary/70 text-gray-100' : 'bg-primary text-gray-200'}
      `}
    >
      <div className="flex">
        {/* Task */}
        <Dialog>
          <DialogTrigger className='self-start w-full flex flex-col gap-3 p-2 hover:cursor-pointer'>
            <div className='flex flex-col gap-3'>
              <div className="flex justify-between">
                <h3 className='font-bold text-xl text-start'>{task?.title}</h3>
              </div>

              <div className='flex flex-col gap-2'>
                <p className='text-sm text-start'>{task?.description}</p>
                {task?.responsability?.map((responsability) => (
                  <div
                    className='block bg-accent px-3 rounded text-black w-fit text-xs font-semibold'
                    key={responsability}
                  >
                    <span>{responsability}</span>
                  </div>
                ))}
              </div>
            </div>
          </DialogTrigger>
          {/* Detalle del Task */}
          <DialogContent className='bg-[#2a2a2a] border-none text-white'>
            <DialogTitle>Detalles de la tarea</DialogTitle>
            <section className='flex flex-col gap-2'>
              <h2 className='text-md font-semibold'>Título:</h2>
              <p>{task?.title}</p>
            </section>
            <section className='flex flex-col gap-2'>
              <h2 className='text-md font-semibold'>Descripción:</h2>
              <p>{task?.description}</p>
            </section>

            {task?.responsability?.map((responsability) => (
              <section className='flex flex-col gap-2' key={responsability}>
                <h2 className='text-md font-semibold'>Responsabilidad:</h2>
                <div className='block bg-accent px-3 rounded text-black w-fit text-xs font-semibold'>
                  <span>{responsability}</span>
                </div>
              </section>
            ))}
          </DialogContent>
        </Dialog>

        {/* Acciones laterales */}
        <div className='flex flex-col items-center gap-1'>
          {/* Eliminar */}
          <Button
            variant='ghost'
            className='w-6 h-6 p-0 flex items-center rounded-sm hover:bg-white hover:text-black transition-all justify-center'
            onClick={handleDelete}
            title="Eliminar"
          >
            {deleting ? <Spinner /> : <X className='w-2' />}
          </Button>

          {/* Editar */}
          <Dialog open={isEditOpen} onOpenChange={handleEditOpenChange}>
            <DialogTrigger
              className='w-6 h-6 p-0 flex items-center rounded-sm hover:bg-white hover:text-black transition-all justify-center'
              title="Editar"
            >
              <Pencil className='w-4' />
            </DialogTrigger>
            <DialogContent className='bg-[#2a2a2a] border-none text-white'>
              <DialogTitle>Editar tarea</DialogTitle>

              <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
                <Field>
                  <FieldLabel>Título</FieldLabel>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título de la tarea"
                  />
                </Field>

                <Field>
                  <FieldLabel>Descripción</FieldLabel>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descripción"
                    className="border border-gray-300 rounded p-2 min-h-[90px] bg-transparent text-sm"
                  />
                </Field>

                <Field>
                  <FieldLabel>Responsabilidades (separadas por coma)</FieldLabel>
                  <Input
                    value={responsabilityStr}
                    onChange={(e) => setResponsabilityStr(e.target.value)}
                    placeholder="p.ej: backend, frontend, pruebas"
                  />
                </Field>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? <Spinner /> : 'Guardar cambios'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}

export default SortableItem
