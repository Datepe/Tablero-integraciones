export interface TaskItem {
  text: string;
  date?: string;
  isPlatform?: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
}

export interface Requirement {
  id: string;
  code: string;
  title: string;
  requester: string;
  status: string;
  todo: TaskItem[];
  done: TaskItem[];
  recurring: (string | TaskItem)[];
  dates: Milestone[];
}

export interface BannerItem {
  type: 'todo' | 'date';
  reqId: string;
  reqCode: string;
  index: number;
  text: string;
  date?: string;
  isPlatform?: boolean;
}

export type SyncState = 'connecting' | 'synced' | 'saving' | 'offline' | 'error';

export interface SyncStatus {
  state: SyncState;
  message: string;
  colorVar: string;
}

export type WorkspaceColumnId = 'todo' | 'done' | 'recurring' | 'dates';
