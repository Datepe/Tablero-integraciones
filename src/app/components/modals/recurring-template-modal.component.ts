import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RequirementService } from '../../services/requirement.service';

@Component({
  selector: 'app-recurring-template-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="modal-backdrop" (click)="closeModal.emit()">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 style="margin: 0; color: var(--purple);">Plantilla de Recurrentes (en Drive)</h3>
          <button class="btn-secondary close-btn" (click)="closeModal.emit()">✕</button>
        </div>

        <p class="description">
          Estas tareas se sincronizan en Google Drive y se agregan a todos tus requerimientos actuales y futuros.
        </p>

        <div class="master-list">
          @for (task of masterTasks(); track $index) {
            <div class="master-item">
              <span class="symbol">↻</span>
              <span class="text">{{ task }}</span>
              <button
                class="btn-icon delete"
                title="Eliminar de la plantilla"
                (click)="removeTask($index)"
              >
                &times;
              </button>
            </div>
          } @empty {
            <span class="empty-msg">No hay tareas recurrentes en la plantilla.</span>
          }
        </div>

        <div class="add-row">
          <input
            type="text"
            placeholder="Nueva tarea recurrente..."
            [(ngModel)]="newTaskText"
            (keydown.enter)="addTask()"
          />
          <button class="btn-purple" [disabled]="!newTaskText().trim()" (click)="addTask()">
            Agregar
          </button>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" (click)="closeModal.emit()">Listo</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .close-btn {
      padding: 4px 8px;
    }

    .description {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.4;
    }

    .master-list {
      max-height: 240px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .master-item {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      gap: 8px;

      .symbol {
        color: var(--purple);
        font-weight: bold;
      }

      .text {
        flex: 1;
        font-size: 0.85rem;
        color: var(--text);
      }
    }

    .empty-msg {
      font-size: 0.8rem;
      color: var(--text-muted);
      padding: 12px 0;
      text-align: center;
    }

    .add-row {
      display: flex;
      gap: 8px;

      input {
        flex: 1;
      }
    }
  `]
})
export class RecurringTemplateModalComponent {
  private reqService = inject(RequirementService);

  readonly closeModal = output<void>();
  readonly masterTasks = this.reqService.masterRecurringTasks;
  readonly newTaskText = signal('');

  addTask() {
    const text = this.newTaskText().trim();
    if (!text) return;
    this.reqService.addMasterRecurring(text);
    this.newTaskText.set('');
  }

  removeTask(idx: number) {
    this.reqService.removeMasterRecurring(idx);
  }
}
