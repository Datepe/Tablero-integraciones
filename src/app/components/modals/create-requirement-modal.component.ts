import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RequirementService } from '../../services/requirement.service';

@Component({
  selector: 'app-create-requirement-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="modal-backdrop" (click)="closeModal.emit()">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <h3 style="margin: 0;">Nuevo Requerimiento / Integración</h3>

        <div>
          <label class="form-label">Código del Requerimiento:</label>
          <input
            type="text"
            placeholder="Código (ej: REQ-025 o Ticket)"
            [(ngModel)]="code"
          />
        </div>

        <div>
          <label class="form-label">Nombre del Requerimiento:</label>
          <input
            type="text"
            placeholder="Nombre de la Integración o Requerimiento *"
            [(ngModel)]="title"
            (keydown.enter)="onSubmit()"
          />
        </div>

        <div>
          <label class="form-label">Solicitante / Área:</label>
          <input
            type="text"
            placeholder="Solicitante / Proyecto / Área"
            [(ngModel)]="requester"
          />
        </div>

        <div>
          <label class="form-label">Estado Inicial:</label>
          <input
            type="text"
            placeholder="Ej: En Análisis, En Desarrollo..."
            [(ngModel)]="status"
          />
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" (click)="closeModal.emit()">Cancelar</button>
          <button
            class="btn-primary"
            [disabled]="!title().trim()"
            (click)="onSubmit()"
          >
            Crear y Abrir
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
export class CreateRequirementModalComponent {
  private reqService = inject(RequirementService);

  readonly closeModal = output<void>();

  readonly code = signal(`REQ-${this.reqService.requirements().length + 1}`);
  readonly title = signal('');
  readonly requester = signal('');
  readonly status = signal('En Análisis');

  onSubmit() {
    const t = this.title().trim();
    if (!t) return;

    const newReq = this.reqService.createRequirement(
      this.code().trim(),
      t,
      this.requester().trim(),
      this.status().trim()
    );

    this.reqService.setActiveRequirement(newReq.id);
    this.closeModal.emit();
  }
}
