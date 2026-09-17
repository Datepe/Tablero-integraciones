import { Component, input, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorkspaceColumnId } from '../../models/requirement.model';

export interface EditTaskPayload {
  col: WorkspaceColumnId;
  idx: number;
  text: string;
  date: string;
  isPlatform: boolean;
}

@Component({
  selector: 'app-edit-task-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="modal-backdrop" (click)="closeModal.emit()">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <h3 style="margin: 0;">Editar Elemento</h3>

        <div>
          <label class="form-label">Descripción / Título:</label>
          <textarea
            [(ngModel)]="text"
            placeholder="Descripción de la tarea o hito..."
          ></textarea>
        </div>

        @if (col() !== 'recurring') {
          <div>
            <label class="form-label">Fecha Límite (Opcional):</label>
            <input type="date" [(ngModel)]="date" />
          </div>
        }

        @if (col() === 'todo' || col() === 'done') {
          <label class="platform-toggle-label">
            <input type="checkbox" [(ngModel)]="isPlatform" />
            <span>⚡ Marcar como Tarea con Plataforma</span>
          </label>
        }

        <div class="modal-footer">
          <button class="btn-secondary" (click)="closeModal.emit()">Cancelar</button>
          <button
            class="btn-primary"
            [disabled]="!text().trim()"
            (click)="onSave()"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-label {
      font-size: 0.78rem;
      color: var(--text-muted);
      display: block;
      margin-bottom: 4px;
    }
  `]
})
export class EditTaskModalComponent implements OnInit {
  readonly col = input.required<WorkspaceColumnId>();
  readonly idx = input.required<number>();
  readonly initialText = input.required<string>();
  readonly initialDate = input<string>('');
  readonly initialIsPlatform = input<boolean>(false);

  readonly closeModal = output<void>();
  readonly saveEdit = output<EditTaskPayload>();

  readonly text = signal('');
  readonly date = signal('');
  readonly isPlatform = signal(false);

  ngOnInit() {
    this.text.set(this.initialText());
    this.date.set(this.initialDate() || '');
    this.isPlatform.set(this.initialIsPlatform());
  }

  onSave() {
    const t = this.text().trim();
    if (!t) return;

    this.saveEdit.emit({
      col: this.col(),
      idx: this.idx(),
      text: t,
      date: this.date(),
      isPlatform: this.isPlatform()
    });
  }
}
