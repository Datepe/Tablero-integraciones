import { Component, inject } from '@angular/core';
import { RequirementService } from '../../services/requirement.service';
import { RequirementCardComponent } from './requirement-card.component';

@Component({
  selector: 'app-dashboard-grid',
  standalone: true,
  imports: [RequirementCardComponent],
  template: `
    <h2 class="section-title">Requerimientos Activos</h2>

    <main class="req-grid">
      @for (req of filteredRequirements(); track req.id) {
        <app-requirement-card
          [requirement]="req"
          (selectCard)="onSelectRequirement($event)"
        />
      } @empty {
        <div class="empty-state">
          <h3>No hay integraciones que coincidan</h3>
          <p>Prueba con otra búsqueda o haz clic en "+ Nuevo Requerimiento".</p>
        </div>
      }
    </main>
  `,
  styles: [`
    .section-title {
      font-size: 1.15rem;
      font-weight: 700;
      margin: 0 0 16px 0;
      color: var(--text);
      letter-spacing: -0.01em;
    }

    .req-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 48px 16px;
      background: var(--surface);
      border: 1px dashed var(--border);
      border-radius: 12px;
      color: var(--text-muted);

      h3 {
        margin: 0 0 8px 0;
        color: var(--text);
        font-size: 1.1rem;
      }

      p {
        margin: 0;
        font-size: 0.9rem;
      }
    }
  `]
})
export class DashboardGridComponent {
  private reqService = inject(RequirementService);

  readonly filteredRequirements = this.reqService.filteredRequirements;

  onSelectRequirement(id: string) {
    this.reqService.setActiveRequirement(id);
  }
}
