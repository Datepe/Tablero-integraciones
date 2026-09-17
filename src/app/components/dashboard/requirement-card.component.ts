import { Component, input, output } from '@angular/core';
import { Requirement } from '../../models/requirement.model';

@Component({
  selector: 'app-requirement-card',
  standalone: true,
  template: `
    <div class="req-card" (click)="selectCard.emit(requirement().id)">
      <div class="req-header">
        <span class="status-pill">{{ requirement().status }}</span>
        <span class="req-meta">{{ requirement().code }} • {{ requirement().requester }}</span>
      </div>

      <h3 class="req-title">{{ requirement().title }}</h3>

      <div class="req-stats">
        <div class="stat-item">
          <div class="stat-val" style="color: #60a5fa">
            {{ requirement().todo.length }}
          </div>
          <div class="stat-label">Por hacer</div>
        </div>
        <div class="stat-item">
          <div class="stat-val" style="color: var(--success)">
            {{ requirement().done.length }}
          </div>
          <div class="stat-label">Completadas</div>
        </div>
        <div class="stat-item">
          <div class="stat-val" style="color: var(--purple)">
            {{ requirement().recurring.length }}
          </div>
          <div class="stat-label">Recurrentes</div>
        </div>
        <div class="stat-item">
          <div class="stat-val" style="color: var(--warning)">
            {{ requirement().dates.length }}
          </div>
          <div class="stat-label">Fechas</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .req-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 18px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      gap: 14px;

      &:hover {
        border-color: var(--accent);
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
      }
    }

    .req-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }

    .req-meta {
      font-size: 0.78rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .req-title {
      font-size: 1.05rem;
      font-weight: 600;
      margin: 0;
      line-height: 1.4;
      color: var(--text);
    }

    .req-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      background: rgba(0, 0, 0, 0.2);
      padding: 10px;
      border-radius: 8px;
      border: 1px solid var(--border-subtle);
      margin-top: auto;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .stat-val {
      font-size: 1.15rem;
      font-weight: 700;
      line-height: 1.2;
    }

    .stat-label {
      font-size: 0.7rem;
      color: var(--text-muted);
      margin-top: 2px;
    }
  `]
})
export class RequirementCardComponent {
  readonly requirement = input.required<Requirement>();
  readonly selectCard = output<string>();
}
