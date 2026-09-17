import { Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RequirementService } from '../../services/requirement.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule],
  template: `
    <header class="app-header">
      <div class="header-left">
        <h1>Panel de Requerimientos</h1>
        <span class="status-badge" [style.color]="syncStatus().colorVar">
          {{ syncStatus().message }}
        </span>
      </div>

      <div class="header-actions">
        <input
          type="text"
          class="search-box"
          placeholder="Buscar por código, título o estado..."
          [ngModel]="searchQuery()"
          (ngModelChange)="onSearchChange($event)"
        />
        <button class="btn-secondary" (click)="openRecurringModal.emit()">
          ⚙ Plantilla Recurrentes
        </button>
        <button class="btn-primary" (click)="openCreateModal.emit()">
          + Nuevo Requerimiento
        </button>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 16px;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 16px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;

      h1 {
        font-size: 1.4rem;
        font-weight: 700;
        margin: 0;
      }

      .status-badge {
        font-size: 0.8rem;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;

      .search-box {
        background: var(--surface);
        border: 1px solid var(--border);
        color: var(--text);
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 0.85rem;
        width: 260px;

        &:focus {
          outline: none;
          border-color: var(--accent);
        }
      }
    }
  `]
})
export class HeaderComponent {
  private reqService = inject(RequirementService);

  readonly syncStatus = this.reqService.syncStatus;
  readonly searchQuery = this.reqService.searchQuery;

  readonly openCreateModal = output<void>();
  readonly openRecurringModal = output<void>();

  onSearchChange(value: string) {
    this.reqService.setSearchQuery(value);
  }
}
