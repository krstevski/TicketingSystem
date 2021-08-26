export interface Tag {
    id?: string;
    title?: string;
}

export interface Category {
    id?: number;
    name?: string;
}

export interface Partner {
    id?: number;
    firstName?: string;
    lastName?: string;
    role?: string;
}

export interface Task {
    id: string;
    type: 'task' | 'section';
    title: string;
    notes: string;
    completed: boolean;
    dueDate: string | null;
    priority: 0 | 1 | 2;
    tags: string[];
    partners: number[];
    categories: number[];
    workHours: number;
    order: number;
}
