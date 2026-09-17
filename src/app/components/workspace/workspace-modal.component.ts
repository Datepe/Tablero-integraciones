import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { RequirementService } from '../../services/requirement.service';
import { WorkspaceColumnId } from '../../models/requirement.model';
import { EditTaskModalComponent, EditTaskPayload } from '../modals/edit-task-modal.component';

@Component({
  selector: 'app-workspace-modal',
  standalone: true,
  imports: [
    FormsModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    EditTaskModalComponent
  ],
  template: `
    @if (requirement(); as req) {
      <div class="workspace-overlay" (click)="closeWorkspace()">
        <div class="workspace-modal" (click)="$event.stopPropagation()">
          <!-- Header -->
          <div class="workspace-header">
            <div class="workspace-title-area">
              <span class="status-pill">{{ req.code }} • {{ req.status }}</span>
              <h2 class="title">{{ req.title }}</h2>
              <span class="requester">• Solicitante: {{ req.requester }}</span>

              <div class="status-editor">
                <span class="status-label">Estado General:</span>
                <input
                  type="text"
                  class="status-input-inline"
                  [ngModel]="req.status"
                  (ngModelChange)="onStatusChange(req.id, $event)"
                  placeholder="Escribe el estado aquí..."
                />
              </div>
            </div>

            <div class="header-buttons">
              <button class="btn-danger" (click)="onDelete(req.id)">
                Eliminar Requerimiento
              </button>
              <button class="btn-secondary" (click)="closeWorkspace()">
                Cerrar ✕
              </button>
            </div>
          </div>

          <!-- 4 Columns Container -->
          <div class="workspace-columns">
            <!-- 1. Tareas por Hacer -->
            <div
              class="work-col"
              id="todo"
              cdkDropList
              [cdkDropListData]="req.todo"
              [cdkDropListConnectedTo]="['todo', 'done', 'recurring', 'dates']"
              (cdkDropListDropped)="onDrop($event, 'todo')"
            >
              <div class="work-col-header text-blue">
                <span>Tareas por Hacer</span>
                <span class="badge-count">{{ req.todo.length }}</span>
              </div>

              <div class="work-col-content">
                @for (item of req.todo; track $index) {
                  <div class="item-card" cdkDrag>
                    <div class="item-main-row">
                      <span class="drag-handle" cdkDragHandle title="Arrastrar">⠿</span>
                      <input
                        type="checkbox"
                        (change)="moveTask('todo', $index, 'done')"
                      />
                      <span class="item-text">{{ item.text }}</span>
                    </div>

                    <div class="item-actions-row">
                      @if (item.isPlatform) {
                        <span class="platform-badge">⚡ Plataforma</span>
                      }
                      @if (item.date) {
                        <span class="item-date-badge blue">{{ item.date }}</span>
                      }
                      <button
                        class="btn-icon"
                        title="Editar tarea"
                        (click)="openEditModal('todo', $index, item.text, item.date || '', !!item.isPlatform)"
                      >
                        ✎
                      </button>
                      <select
                        class="move-select"
                        (change)="onMoveSelectChange('todo', $index, $event)"
                      >
                        <option value="" disabled selected>Mover a...</option>
                        <option value="done">Completada</option>
                        <option value="recurring">Recurrente</option>
                        <option value="dates">Fecha Imp.</option>
                      </select>
                      <button
                        class="btn-icon delete"
                        title="Eliminar"
                        (click)="removeTodo(req.id, $index)"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                }
              </div>

              <div class="add-form">
                <input
                  type="text"
                  placeholder="Descripción de la tarea..."
                  [(ngModel)]="newTodoText"
                  (keydown.enter)="addTodo(req.id)"
                />
                <div class="add-form-row">
                  <input
                    type="date"
                    [(ngModel)]="newTodoDate"
                    title="Fecha opcional"
                  />
                  <label class="platform-toggle-label" title="Marca si requiere plataforma">
                    <input type="checkbox" [(ngModel)]="newTodoPlatform" />
                    <span>⚡ Plataforma</span>
                  </label>
                  <button
                    class="btn-primary"
                    [disabled]="!newTodoText().trim()"
                    (click)="addTodo(req.id)"
                  >
                    + Agregar
                  </button>
                </div>
              </div>
            </div>

            <!-- 2. Tareas Completadas -->
            <div
              class="work-col"
              id="done"
              cdkDropList
              [cdkDropListData]="req.done"
              [cdkDropListConnectedTo]="['todo', 'done', 'recurring', 'dates']"
              (cdkDropListDropped)="onDrop($event, 'done')"
            >
              <div class="work-col-header text-green">
                <span>Tareas Completadas</span>
                <span class="badge-count">{{ req.done.length }}</span>
              </div>

              <div class="work-col-content">
                @for (item of req.done; track $index) {
                  <div class="item-card completed" cdkDrag>
                    <div class="item-main-row">
                      <span class="drag-handle" cdkDragHandle title="Arrastrar">⠿</span>
                      <input
                        type="checkbox"
                        checked
                        (change)="moveTask('done', $index, 'todo')"
                      />
                      <span class="item-text">{{ item.text }}</span>
                    </div>

                    <div class="item-actions-row">
                      @if (item.isPlatform) {
                        <span class="platform-badge">⚡ Plataforma</span>
                      }
                      @if (item.date) {
                        <span class="item-date-badge blue">{{ item.date }}</span>
                      }
                      <button
                        class="btn-icon"
                        title="Editar tarea"
                        (click)="openEditModal('done', $index, item.text, item.date || '', !!item.isPlatform)"
                      >
                        ✎
                      </button>
                      <select
                        class="move-select"
                        (change)="onMoveSelectChange('done', $index, $event)"
                      >
                        <option value="" disabled selected>Mover a...</option>
                        <option value="todo">Por Hacer</option>
                        <option value="recurring">Recurrente</option>
                        <option value="dates">Fecha Imp.</option>
                      </select>
                      <button
                        class="btn-icon delete"
                        title="Eliminar"
                        (click)="removeDone(req.id, $index)"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                }
              </div>

              <div class="done-footer">
                Arrastra tareas aquí o marca el checkbox
              </div>
            </div>

            <!-- 3. Tareas Recurrentes -->
            <div
              class="work-col"
              id="recurring"
              cdkDropList
              [cdkDropListData]="req.recurring"
              [cdkDropListConnectedTo]="['todo', 'done', 'recurring', 'dates']"
              (cdkDropListDropped)="onDrop($event, 'recurring')"
            >
              <div class="work-col-header text-purple">
                <span>Tareas Recurrentes</span>
                <span class="badge-count">{{ req.recurring.length }}</span>
              </div>

              <div class="work-col-content">
                @for (item of req.recurring; track $index) {
                  <div class="item-card" cdkDrag>
                    <div class="item-main-row">
                      <span class="drag-handle" cdkDragHandle title="Arrastrar">⠿</span>
                      <span class="symbol-purple">↻</span>
                      <span class="item-text">{{ getRecurringText(item) }}</span>
                    </div>

                    <div class="item-actions-row">
                      <button
                        class="btn-icon"
                        title="Editar"
                        (click)="openEditModal('recurring', $index, getRecurringText(item), '', false)"
                      >
                        ✎
                      </button>
                      <select
                        class="move-select"
                        (change)="onMoveSelectChange('recurring', $index, $event)"
                      >
                        <option value="" disabled selected>Mover a...</option>
                        <option value="todo">Por Hacer</option>
                        <option value="done">Completada</option>
                        <option value="dates">Fecha Imp.</option>
                      </select>
                      <button
                        class="btn-icon delete"
                        title="Eliminar"
                        (click)="removeRecurring(req.id, $index)"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                }
              </div>

              <div class="add-form">
                <div class="add-form-row">
                  <input
                    type="text"
                    placeholder="Nueva tarea recurrente..."
                    [(ngModel)]="newRecurringText"
                    (keydown.enter)="addRecurring(req.id)"
                  />
                  <button
                    class="btn-purple"
                    [disabled]="!newRecurringText().trim()"
                    (click)="addRecurring(req.id)"
                  >
                    + Agregar
                  </button>
                </div>
              </div>
            </div>

            <!-- 4. Fechas Importantes -->
            <div
              class="work-col"
              id="dates"
              cdkDropList
              [cdkDropListData]="req.dates"
              [cdkDropListConnectedTo]="['todo', 'done', 'recurring', 'dates']"
              (cdkDropListDropped)="onDrop($event, 'dates')"
            >
              <div class="work-col-header text-yellow">
                <span>Fechas Importantes</span>
                <span class="badge-count">{{ req.dates.length }}</span>
              </div>

              <div class="work-col-content">
                @for (d of req.dates; track d.id || $index) {
                  <div class="item-card milestone-card" cdkDrag>
                    <div class="item-main-row">
                      <span class="drag-handle" cdkDragHandle title="Arrastrar">⠿</span>
                      <span class="item-text font-medium">{{ d.title }}</span>
                    </div>

                    <div class="item-actions-row">
                      <span class="item-date-badge">{{ d.date || 'Sin fecha' }}</span>
                      <button
                        class="btn-icon"
                        title="Editar hito"
                        (click)="openEditModal('dates', $index, d.title, d.date, false)"
                      >
                        ✎
                      </button>
                      <select
                        class="move-select"
                        (change)="onMoveSelectChange('dates', $index, $event)"
                      >
                        <option value="" disabled selected>Mover a...</option>
                        <option value="todo">Por Hacer</option>
                        <option value="done">Completada</option>
                        <option value="recurring">Recurrente</option>
                      </select>
                      <button
                        class="btn-icon delete"
                        title="Eliminar fecha"
                        (click)="removeMilestone(req.id, $index)"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                }
              </div>

              <div class="add-form">
                <input
                  type="text"
                  placeholder="Descripción de la fecha clave..."
                  [(ngModel)]="newMilestoneTitle"
                  (keydown.enter)="addMilestone(req.id)"
                />
                <div class="add-form-row">
                  <input
                    type="date"
                    [(ngModel)]="newMilestoneDate"
                  />
                  <button
                    class="btn-warning"
                    [disabled]="!newMilestoneTitle().trim()"
                    (click)="addMilestone(req.id)"
                  >
                    + Guardar Hito
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Modal Editar Elemento -->
    @if (editingState(); as ed) {
      <app-edit-task-modal
        [col]="ed.col"
        [idx]="ed.idx"
        [initialText]="ed.text"
        [initialDate]="ed.date"
        [initialIsPlatform]="ed.isPlatform"
        (closeModal)="closeEditModal()"
        (saveEdit)="onSaveEdit($event)"
      />
    }
  `,
  styles: [`
    .workspace-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(5px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 50;
      padding: 20px;
    }

    .workspace-modal {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      width: 95vw;
      height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
      overflow: hidden;
    }

    .workspace-header {
      padding: 16px 24px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .workspace-title-area {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      flex-wrap: wrap;

      .title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text);
      }

      .requester {
        color: var(--text-muted);
        font-size: 0.85rem;
      }
    }

    .status-editor {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-left: auto;

      .status-label {
        font-size: 0.75rem;
        color: var(--text-muted);
      }

      .status-input-inline {
        background: var(--bg);
        border: 1px solid var(--border);
        color: #93c5fd;
        padding: 5px 10px;
        border-radius: 6px;
        font-size: 0.8rem;
        width: 240px;

        &:focus {
          outline: none;
          border-color: var(--accent);
        }
      }
    }

    .header-buttons {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .workspace-columns {
      flex: 1;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      padding: 16px;
      overflow-x: auto;
      background: rgba(0, 0, 0, 0.2);

      @media (max-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
      }
      @media (max-width: 640px) {
        grid-template-columns: 1fr;
      }
    }

    .work-col {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 250px;
      overflow: hidden;
    }

    .work-col-header {
      padding: 12px 14px;
      font-size: 0.9rem;
      font-weight: 700;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border);

      &.text-blue { color: #60a5fa; }
      &.text-green { color: var(--success); }
      &.text-purple { color: var(--purple); }
      &.text-yellow { color: var(--warning); }
    }

    .badge-count {
      background: rgba(255, 255, 255, 0.1);
      padding: 2px 7px;
      border-radius: 12px;
      font-size: 0.75rem;
      color: var(--text);
    }

    .work-col-content {
      flex: 1;
      overflow-y: auto;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .item-card {
      background: var(--surface-card);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      cursor: grab;
      user-select: none;

      &.completed {
        opacity: 0.65;
        .item-text {
          text-decoration: line-through;
          color: var(--text-muted);
        }
      }

      &.milestone-card {
        border-left: 3px solid var(--warning);
      }
    }

    .item-main-row {
      display: flex;
      align-items: flex-start;
      gap: 8px;

      .drag-handle {
        color: var(--text-muted);
        cursor: grab;
        font-size: 1rem;
        line-height: 1;
      }

      .symbol-purple {
        color: var(--purple);
        font-weight: bold;
      }

      .item-text {
        flex: 1;
        font-size: 0.85rem;
        color: var(--text);
        line-height: 1.4;

        &.font-medium {
          font-weight: 500;
        }
      }

      input[type="checkbox"] {
        accent-color: var(--accent);
        cursor: pointer;
        margin-top: 2px;
      }
    }

    .item-actions-row {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
      justify-content: flex-end;
      padding-top: 4px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);

      .move-select {
        background: var(--bg);
        border: 1px solid var(--border);
        color: var(--text-muted);
        font-size: 0.72rem;
        padding: 2px 4px;
        border-radius: 4px;
        cursor: pointer;

        &:focus {
          outline: none;
          border-color: var(--accent);
        }
      }
    }

    .add-form {
      padding: 10px;
      border-top: 1px solid var(--border);
      background: var(--surface);
      display: flex;
      flex-direction: column;
      gap: 6px;

      input[type="text"], input[type="date"] {
        background: var(--bg);
        border: 1px solid var(--border);
        color: var(--text);
        padding: 7px 10px;
        border-radius: 6px;
        font-size: 0.82rem;

        &:focus {
          outline: none;
          border-color: var(--accent);
        }
      }

      .add-form-row {
        display: flex;
        gap: 6px;
        align-items: center;

        input[type="date"] {
          flex: 1;
        }
      }
    }

    .done-footer {
      padding: 12px;
      text-align: center;
      font-size: 0.75rem;
      color: var(--text-muted);
      border-top: 1px solid var(--border);
    }

    .btn-warning {
      background: #b45309;
      color: white;
      &:hover:not(:disabled) {
        background: #d97706;
      }
    }
  `]
})
export class WorkspaceModalComponent {
  private reqService = inject(RequirementService);

  readonly requirement = this.reqService.activeRequirement;

  // New item form signals
  readonly newTodoText = signal('');
  readonly newTodoDate = signal('');
  readonly newTodoPlatform = signal(false);

  readonly newRecurringText = signal('');
  readonly newMilestoneTitle = signal('');
  readonly newMilestoneDate = signal('');

  // Editing state
  readonly editingState = signal<{
    col: WorkspaceColumnId;
    idx: number;
    text: string;
    date: string;
    isPlatform: boolean;
  } | null>(null);

  closeWorkspace() {
    this.reqService.setActiveRequirement(null);
  }

  onStatusChange(reqId: string, newStatus: string) {
    this.reqService.updateRequirementStatus(reqId, newStatus);
  }

  onDelete(reqId: string) {
    if (confirm('¿Estás seguro de eliminar este requerimiento y todo su contenido?')) {
      this.reqService.deleteRequirement(reqId);
    }
  }

  getRecurringText(item: any): string {
    return typeof item === 'string' ? item : item?.text || '';
  }

  // Todo operations
  addTodo(reqId: string) {
    const text = this.newTodoText().trim();
    if (!text) return;
    this.reqService.addTodo(reqId, text, this.newTodoDate(), this.newTodoPlatform());
    this.newTodoText.set('');
    this.newTodoDate.set('');
    this.newTodoPlatform.set(false);
  }

  removeTodo(reqId: string, idx: number) {
    this.reqService.removeTodo(reqId, idx);
  }

  removeDone(reqId: string, idx: number) {
    this.reqService.removeDone(reqId, idx);
  }

  // Recurring operations
  addRecurring(reqId: string) {
    const text = this.newRecurringText().trim();
    if (!text) return;
    this.reqService.addRecurring(reqId, text);
    this.newRecurringText.set('');
  }

  removeRecurring(reqId: string, idx: number) {
    this.reqService.removeRecurring(reqId, idx);
  }

  // Milestone operations
  addMilestone(reqId: string) {
    const title = this.newMilestoneTitle().trim();
    if (!title) return;
    this.reqService.addMilestone(reqId, title, this.newMilestoneDate());
    this.newMilestoneTitle.set('');
    this.newMilestoneDate.set('');
  }

  removeMilestone(reqId: string, idx: number) {
    this.reqService.removeMilestone(reqId, idx);
  }

  // Move operations
  moveTask(fromCol: WorkspaceColumnId, idx: number, toCol: WorkspaceColumnId) {
    const req = this.requirement();
    if (!req) return;
    this.reqService.moveTask(req.id, fromCol, idx, toCol);
  }

  onMoveSelectChange(fromCol: WorkspaceColumnId, idx: number, event: Event) {
    const select = event.target as HTMLSelectElement;
    const toCol = select.value as WorkspaceColumnId;
    if (toCol) {
      this.moveTask(fromCol, idx, toCol);
      select.value = '';
    }
  }

  // Drag & Drop
  onDrop(event: CdkDragDrop<any[]>, targetCol: WorkspaceColumnId) {
    const req = this.requirement();
    if (!req) return;

    const sourceCol = event.previousContainer.id as WorkspaceColumnId;
    if (sourceCol === targetCol && event.previousIndex === event.currentIndex) {
      return;
    }
    this.reqService.moveTask(req.id, sourceCol, event.previousIndex, targetCol);
  }

  // Modal edit operations
  openEditModal(
    col: WorkspaceColumnId,
    idx: number,
    text: string,
    date: string,
    isPlatform: boolean
  ) {
    this.editingState.set({ col, idx, text, date, isPlatform });
  }

  closeEditModal() {
    this.editingState.set(null);
  }

  onSaveEdit(payload: EditTaskPayload) {
    const req = this.requirement();
    if (!req) return;
    this.reqService.updateItem(
      req.id,
      payload.col,
      payload.idx,
      payload.text,
      payload.date,
      payload.isPlatform
    );
    this.closeEditModal();
  }
}
