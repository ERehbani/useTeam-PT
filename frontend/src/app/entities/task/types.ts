export interface Task {
    _id?: string;
    title: string;
    description: string;
    position: number;
    responsability: string[];
    columnId: string;
    createdAt?: Date;
}

export type ColumnData = Record<string, Task[]>;