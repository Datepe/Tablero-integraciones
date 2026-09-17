import { Component, inject } from '@angular/core';
import { RequirementService } from '../../services/requirement.service';

@Component({
  selector: 'app-banners',
  standalone: true,
  template: `
    @if (tomorrowTasks().length > 0 || platformTasks().length > 0) {
      <div class="dashboard-top-panels">
        <!-- Banner Mañana -->
        @if (tomorrowTasks().length > 0) {
          <section class="info-banner banner-tomorrow">
            <div class="banner-header">
              <span class="banner-title">📅 Pendientes para Mañana</span>
              <span class="banner-date-badge">Mañana ({{ tomorrowDate() }})</span>
            </div>
            <div class="banner-list">
              @for (item of tomorrowTasks(); track item.reqId + '-' + item.index) {
                <div class="banner-item">
                  <span class="req-tag">{{ item.reqCode }}</span>
                  <span class="item-text">{{ item.text }}</span>
                  @if (item.isPlatform) {
                    <span class="platform-badge">⚡ Plat.</span>
                  }
                  @if (item.type === 'todo') {
                    <input
                      type="checkbox"
                      title="Marcar completada"
                      (change)="completeTask(item.reqId, item.index)"
                    />
                  } @else {
                    <span class="item-date-badge">Hito</span>
                  }
                </div>
              }
            </div>
          </section>
        }

        <!-- Banner Plataforma -->
        @if (platformTasks().length > 0) {
          <section class="info-banner banner-platform">
            <div class="banner-header">
              <span class="banner-title">⚡ Tareas con Plataforma</span>
              <span class="banner-date-badge">
                {{ platformTasks().length }} pendiente{{ platformTasks().length > 1 ? 's' : '' }}
              </span>
            </div>
            <div class="banner-list">
              @for (item of platformTasks(); track item.reqId + '-' + item.index) {
                <div class="banner-item">
                  <span class="req-tag">{{ item.reqCode }}</span>
                  <span class="item-text">{{ item.text }}</span>
                  @if (item.date) {
                    <span class="item-date-badge blue">{{ item.date }}</span>
                  }
                  <input
                    type="checkbox"
                    title="Marcar completada"
                    class="success-checkbox"
                    (change)="completeTask(item.reqId, item.index)"
                  />
                </div>
              }
            </div>
          </section>
        }
      </div>
    }
  `,
  styles: [`
    .dashboard-top-panels {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-bottom: 24px;
    }

    .info-banner {
      border-radius: 12px;
      padding: 14px 18px;

      &.banner-tomorrow {
        background: linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(139, 92, 246, 0.12));
        border: 1px solid rgba(59, 130, 246, 0.35);

        .banner-title { color: #93c5fd; }
        .banner-date-badge { background: rgba(37, 99, 235, 0.25); color: #bfdbfe; }
      }

      &.banner-platform {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.12));
        border: 1px solid rgba(16, 185, 129, 0.35);

        .banner-title { color: #6ee7b7; }
        .banner-date-badge { background: rgba(16, 185, 129, 0.2); color: #a7f3d0; }
      }
    }

    .banner-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .banner-title {
      font-size: 0.95rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .banner-date-badge {
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 6px;
      font-weight: 600;
    }

    .banner-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 8px;
    }

    .banner-item {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.85rem;

      .req-tag {
        font-size: 0.72rem;
        background: rgba(255, 255, 255, 0.08);
        color: var(--text-muted);
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 600;
      }

      .item-text {
        flex: 1;
        color: var(--text);
      }

      input[type="checkbox"] {
        accent-color: var(--accent);
        cursor: pointer;
        width: 16px;
        height: 16px;

        &.success-checkbox {
          accent-color: var(--success);
        }
      }
    }
  `]
})
export class BannersComponent {
  private reqService = inject(RequirementService);

  readonly tomorrowTasks = this.reqService.tomorrowTasks;
  readonly platformTasks = this.reqService.platformTasks;
  readonly tomorrowDate = this.reqService.tomorrowISODate;

  completeTask(reqId: string, index: number) {
    this.reqService.completeTaskFromBanner(reqId, index);
  }
}
