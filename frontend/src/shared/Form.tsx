"use client";
import { useStore } from "@/app/features/kanban/store/taskStore";
import { getSocket } from "@/shared/lib/socket";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/shared/ui/dialog";
import { Field, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "./ui/spinner";

const Form = () => {
  const { task, setTask } = useStore();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const s = getSocket();
    const onCreated = (created: any) => {
      console.log("taskCreated (broadcast):", created);
    };
    s.on("taskCreated", onCreated);
    return () => {
      s.off("taskCreated", onCreated);
    };
  }, []);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const payload = {
      title: task.title?.trim(),
      description: task.description?.trim() ?? "",
      responsability: Array.isArray(task.responsability) ? task.responsability : [],
      columnId: task.columnId || "Por hacer",
    };
    console.log(payload)
    const s = getSocket();
    s.emit("createTask", payload, (ack?: any) => {
      setLoading(false);
      toast.success(`Tarea ${task?.title} creada exitosamente`)
      if (ack?.ok) {
        console.log("Task creada:", ack.task);
        setOpen(false);
        setTask({
          title: "",
          description: "",
          responsability: [],
          columnId: "Por hacer",
          position: 0,
        });
      } else {
        console.error("No se pudo crear la task:", ack);
        toast.error(`Tarea ${task?.title} no se pudo crear`)
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-full bg-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center rounded-md justify-center py-3">
        Agregar tarea <Plus className="ml-2" />
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Agregar tarea</DialogTitle>

        <form onSubmit={submit} className="space-y-4">
          <Field>
            <FieldLabel>Titulo</FieldLabel>
            <Input
              type="text"
              placeholder="Titulo"
              value={task.title}
              onChange={(e) => setTask({ ...task, title: e.target.value })}
              required
            />
          </Field>

          <Field>
            <FieldLabel>Descripcion</FieldLabel>
            <Input
              type="text"
              placeholder="Descripcion"
              value={task.description}
              onChange={(e) => setTask({ ...task, description: e.target.value })}
            />
          </Field>

          <Field>
            <FieldLabel>Estado</FieldLabel>
            <Select
              name="columnId"
              value={task.columnId}
              onValueChange={(value) => setTask({ ...task, columnId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Por hacer">
                  <div className="w-2 h-2 rounded-full bg-gray-600 inline-block mr-2" />Por hacer
                </SelectItem>
                <SelectItem value="En progreso">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 inline-block mr-2" />En progreso
                </SelectItem>
                <SelectItem value="Completado">
                  <div className="w-2 h-2 rounded-full bg-green-600 inline-block mr-2" />Completado
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Responsabilidad</FieldLabel>
            <Input
              type="text"
              placeholder="usuario1,usuario2"
              value={Array.isArray(task.responsability) ? task.responsability.join(",") : task.responsability}
              onChange={(e) =>
                setTask({
                  ...task,
                  responsability: e.target.value.split(",").map(t => t.trim()).filter(Boolean),
                })
              }
            />
          </Field>

          <Button type="submit" className="bg-blue-500 text-white mt-3" disabled={loading}>
            Agregar tarea {loading ? <Spinner /> : ""}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Form;
