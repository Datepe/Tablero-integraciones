import { Injectable, computed, signal } from '@angular/core';
import {
  BannerItem,
  Milestone,
  Requirement,
  SyncStatus,
  TaskItem,
  WorkspaceColumnId
} from '../models/requirement.model';

@Injectable({
  providedIn: 'root'
})
export class RequirementService {
  private readonly DRIVE_API_URL =
    'https://script.google.com/macros/s/AKfycbx5xLh6B0PC0jI2FvVIajZvUAzO7lEkEXEabE1hUg5B5_6gpdYB1ZzhTuihvOqs4r98/exec';
  private readonly CACHE_KEY = 'tablero_reqs_cache_v2';

  // Reactive State Signals
  readonly requirements = signal<Requirement[]>([]);
  readonly masterRecurringTasks = signal<string[]>([]);
  readonly activeReqId = signal<string | null>(null);
  readonly searchQuery = signal<string>('');
  readonly syncStatus = signal<SyncStatus>({
    state: 'connecting',
    message: '● Conectando a Google Drive...',
    colorVar: 'var(--warning)'
  });

  private debounceTimer: any = null;

  // Computed Values
  readonly activeRequirement = computed(() => {
    const id = this.activeReqId();
    if (!id) return null;
    return this.requirements().find((r) => r.id === id) || null;
  });

  readonly filteredRequirements = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const list = this.requirements();
    if (!query) return list;

    return list.filter((r) => {
      return (
        (r.code || '').toLowerCase().includes(query) ||
        (r.title || '').toLowerCase().includes(query) ||
        (r.requester || '').toLowerCase().includes(query) ||
        (r.status || '').toLowerCase().includes(query)
      );
    });
  });

  readonly tomorrowISODate = computed(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  readonly tomorrowTasks = computed<BannerItem[]>(() => {
    const tomorrow = this.tomorrowISODate();
    const items: BannerItem[] = [];

    for (const req of this.requirements()) {
      (req.todo || []).forEach((t, idx) => {
        const item = this.normalizeTask(t);
        if (item.date === tomorrow) {
          items.push({
            type: 'todo',
            reqId: req.id,
            reqCode: req.code,
            index: idx,
            text: item.text,
            date: item.date,
            isPlatform: item.isPlatform
          });
        }
      });

      (req.dates || []).forEach((d, idx) => {
        if (d.date === tomorrow) {
          items.push({
            type: 'date',
            reqId: req.id,
            reqCode: req.code,
            index: idx,
            text: d.title,
            date: d.date
          });
        }
      });
    }

    return items;
  });

  readonly platformTasks = computed<BannerItem[]>(() => {
    const items: BannerItem[] = [];

    for (const req of this.requirements()) {
      (req.todo || []).forEach((t, idx) => {
        const item = this.normalizeTask(t);
        if (item.isPlatform) {
          items.push({
            type: 'todo',
            reqId: req.id,
            reqCode: req.code,
            index: idx,
            text: item.text,
            date: item.date,
            isPlatform: true
          });
        }
      });
    }

    return items;
  });

  constructor() {
    this.loadData();
  }

  normalizeTask(item: any): TaskItem {
    if (typeof item === 'string') {
      return { text: item, date: '', isPlatform: false };
    }
    return {
      text: item?.text || '',
      date: item?.date || '',
      isPlatform: Boolean(item?.isPlatform)
    };
  }

  async loadData() {
    this.syncStatus.set({
      state: 'connecting',
      message: '● Conectando a Google Drive...',
      colorVar: 'var(--warning)'
    });

    try {
      const resReqs = await fetch(this.DRIVE_API_URL, {
        method: 'GET',
        redirect: 'follow'
      });
      const dataReqs = await resReqs.json();
      const loadedReqs = Array.isArray(dataReqs)
        ? dataReqs.map((r) => this.sanitizeRequirement(r))
        : [];
      this.requirements.set(loadedReqs);
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(loadedReqs));

      try {
        const resRec = await fetch(`${this.DRIVE_API_URL}?type=recurring`, {
          method: 'GET',
          redirect: 'follow'
        });
        const recurring = await resRec.json();
        this.masterRecurringTasks.set(Array.isArray(recurring) ? recurring : []);
      } catch (e) {
        console.warn('No se pudo cargar la plantilla de recurrentes', e);
      }

      this.syncStatus.set({
        state: 'synced',
        message: '● Sincronizado con Google Drive',
        colorVar: 'var(--success)'
      });
    } catch (err) {
      console.error(err);
      this.syncStatus.set({
        state: 'offline',
        message: '⚠ Sin conexión a Drive (usando copia local)',
        colorVar: 'var(--danger)'
      });
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          this.requirements.set(
            Array.isArray(parsed) ? parsed.map((r) => this.sanitizeRequirement(r)) : []
          );
        } catch {
          this.requirements.set([]);
        }
      }
    }
  }

  private sanitizeRequirement(r: any): Requirement {
    return {
      id: String(r.id || Date.now()),
      code: r.code || 'REQ-000',
      title: r.title || 'Sin Título',
      requester: r.requester || 'General',
      status: r.status || 'En Análisis',
      todo: Array.isArray(r.todo) ? r.todo.map((t: any) => this.normalizeTask(t)) : [],
      done: Array.isArray(r.done) ? r.done.map((t: any) => this.normalizeTask(t)) : [],
      recurring: Array.isArray(r.recurring) ? [...r.recurring] : [],
      dates: Array.isArray(r.dates) ? [...r.dates] : []
    };
  }

  syncToDrive() {
    const state = this.requirements();
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(state));

    this.syncStatus.set({
      state: 'saving',
      message: '● Guardando en Drive...',
      colorVar: 'var(--warning)'
    });

    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(async () => {
      try {
        await fetch(this.DRIVE_API_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(state)
        });
        this.syncStatus.set({
          state: 'synced',
          message: '● Guardado en Google Drive',
          colorVar: 'var(--success)'
        });
      } catch (err) {
        console.error(err);
        this.syncStatus.set({
          state: 'error',
          message: '⚠ Error al guardar en Drive',
          colorVar: 'var(--danger)'
        });
      }
    }, 400);
  }

  async syncMasterRecurringToDrive() {
    const list = this.masterRecurringTasks();
    try {
      await fetch(`${this.DRIVE_API_URL}?type=recurring`, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(list)
      });
    } catch (err) {
      console.error('Error guardando plantilla recurrente:', err);
    }
  }

  setSearchQuery(q: string) {
    this.searchQuery.set(q);
  }

  setActiveRequirement(id: string | null) {
    this.activeReqId.set(id);
  }

  createRequirement(code: string, title: string, requester: string, status: string): Requirement {
    const newReq: Requirement = {
      id: Date.now().toString(),
      code: code || `REQ-${this.requirements().length + 1}`,
      title,
      requester: requester || 'General',
      status: status || 'En Análisis',
      todo: [],
      done: [],
      recurring: [...this.masterRecurringTasks()],
      dates: []
    };

    this.requirements.update((list) => [newReq, ...list]);
    this.syncToDrive();
    return newReq;
  }

  deleteRequirement(id: string) {
    this.requirements.update((list) => list.filter((r) => r.id !== id));
    if (this.activeReqId() === id) {
      this.activeReqId.set(null);
    }
    this.syncToDrive();
  }

  updateRequirementStatus(reqId: string, status: string) {
    this.requirements.update((list) =>
      list.map((r) => (r.id === reqId ? { ...r, status: status.trim() || 'En Análisis' } : r))
    );
    this.syncToDrive();
  }

  addTodo(reqId: string, text: string, date: string, isPlatform: boolean) {
    if (!text.trim()) return;
    this.requirements.update((list) =>
      list.map((r) => {
        if (r.id === reqId) {
          return {
            ...r,
            todo: [...r.todo, { text: text.trim(), date, isPlatform }]
          };
        }
        return r;
      })
    );
    this.syncToDrive();
  }

  removeTodo(reqId: string, idx: number) {
    this.requirements.update((list) =>
      list.map((r) => {
        if (r.id === reqId) {
          const updated = [...r.todo];
          updated.splice(idx, 1);
          return { ...r, todo: updated };
        }
        return r;
      })
    );
    this.syncToDrive();
  }

  removeDone(reqId: string, idx: number) {
    this.requirements.update((list) =>
      list.map((r) => {
        if (r.id === reqId) {
          const updated = [...r.done];
          updated.splice(idx, 1);
          return { ...r, done: updated };
        }
        return r;
      })
    );
    this.syncToDrive();
  }

  addRecurring(reqId: string, text: string) {
    const val = text.trim();
    if (!val) return;

    if (!this.masterRecurringTasks().includes(val)) {
      this.masterRecurringTasks.update((t) => [...t, val]);
      this.syncMasterRecurringToDrive();
    }

    this.requirements.update((list) =>
      list.map((r) => {
        const exists = r.recurring.some(
          (t) => (typeof t === 'string' ? t : t.text) === val
        );
        if (!exists) {
          return { ...r, recurring: [...r.recurring, val] };
        }
        return r;
      })
    );
    this.syncToDrive();
  }

  removeRecurring(reqId: string, idx: number) {
    this.requirements.update((list) =>
      list.map((r) => {
        if (r.id === reqId) {
          const updated = [...r.recurring];
          updated.splice(idx, 1);
          return { ...r, recurring: updated };
        }
        return r;
      })
    );
    this.syncToDrive();
  }

  addMilestone(reqId: string, title: string, date: string) {
    if (!title.trim()) return;
    const milestone: Milestone = {
      id: Date.now().toString(),
      title: title.trim(),
      date: date || 'Pendiente'
    };

    this.requirements.update((list) =>
      list.map((r) => {
        if (r.id === reqId) {
          return { ...r, dates: [...r.dates, milestone] };
        }
        return r;
      })
    );
    this.syncToDrive();
  }

  removeMilestone(reqId: string, idx: number) {
    this.requirements.update((list) =>
      list.map((r) => {
        if (r.id === reqId) {
          const updated = [...r.dates];
          updated.splice(idx, 1);
          return { ...r, dates: updated };
        }
        return r;
      })
    );
    this.syncToDrive();
  }

  completeTaskFromBanner(reqId: string, index: number) {
    this.requirements.update((list) =>
      list.map((r) => {
        if (r.id === reqId && r.todo[index]) {
          const todo = [...r.todo];
          const [completed] = todo.splice(index, 1);
          return {
            ...r,
            todo,
            done: [completed, ...r.done]
          };
        }
        return r;
      })
    );
    this.syncToDrive();
  }

  moveTask(reqId: string, fromCol: WorkspaceColumnId, idx: number, toCol: WorkspaceColumnId) {
    if (fromCol === toCol) return;

    this.requirements.update((list) =>
      list.map((r) => {
        if (r.id !== reqId) return r;

        let itemObj: TaskItem = { text: '', date: '', isPlatform: false };
        let todo = [...r.todo];
        let done = [...r.done];
        let recurring = [...r.recurring];
        let dates = [...r.dates];

        if (fromCol === 'dates') {
          const [removed] = dates.splice(idx, 1);
          itemObj = { text: removed.title, date: removed.date };
        } else if (fromCol === 'recurring') {
          const [removed] = recurring.splice(idx, 1);
          itemObj = { text: typeof removed === 'string' ? removed : removed.text };
        } else if (fromCol === 'todo') {
          const [removed] = todo.splice(idx, 1);
          itemObj = this.normalizeTask(removed);
        } else if (fromCol === 'done') {
          const [removed] = done.splice(idx, 1);
          itemObj = this.normalizeTask(removed);
        }

        if (toCol === 'dates') {
          dates.push({
            id: Date.now().toString(),
            title: itemObj.text,
            date: itemObj.date || 'Pendiente'
          });
        } else if (toCol === 'recurring') {
          recurring.push(itemObj.text);
          if (!this.masterRecurringTasks().includes(itemObj.text)) {
            this.masterRecurringTasks.update((t) => [...t, itemObj.text]);
            this.syncMasterRecurringToDrive();
          }
        } else if (toCol === 'todo') {
          todo.push(itemObj);
        } else if (toCol === 'done') {
          done.push(itemObj);
        }

        return { ...r, todo, done, recurring, dates };
      })
    );

    this.syncToDrive();
  }

  updateItem(
    reqId: string,
    col: WorkspaceColumnId,
    idx: number,
    text: string,
    date: string,
    isPlatform: boolean
  ) {
    this.requirements.update((list) =>
      list.map((r) => {
        if (r.id !== reqId) return r;

        if (col === 'dates') {
          const dates = [...r.dates];
          if (dates[idx]) {
            dates[idx] = { ...dates[idx], title: text, date: date || '' };
          }
          return { ...r, dates };
        } else if (col === 'recurring') {
          const recurring = [...r.recurring];
          recurring[idx] = text;
          return { ...r, recurring };
        } else if (col === 'todo') {
          const todo = [...r.todo];
          todo[idx] = { text, date, isPlatform };
          return { ...r, todo };
        } else if (col === 'done') {
          const done = [...r.done];
          done[idx] = { text, date, isPlatform };
          return { ...r, done };
        }
        return r;
      })
    );
    this.syncToDrive();
  }

  addMasterRecurring(taskText: string) {
    const val = taskText.trim();
    if (!val) return;

    if (!this.masterRecurringTasks().includes(val)) {
      this.masterRecurringTasks.update((list) => [...list, val]);
      this.syncMasterRecurringToDrive();
    }

    let updated = false;
    this.requirements.update((list) =>
      list.map((r) => {
        const exists = r.recurring.some(
          (t) => (typeof t === 'string' ? t : t.text) === val
        );
        if (!exists) {
          updated = true;
          return { ...r, recurring: [...r.recurring, val] };
        }
        return r;
      })
    );

    if (updated) {
      this.syncToDrive();
    }
  }

  removeMasterRecurring(idx: number) {
    this.masterRecurringTasks.update((list) => {
      const copy = [...list];
      copy.splice(idx, 1);
      return copy;
    });
    this.syncMasterRecurringToDrive();
  }
}
