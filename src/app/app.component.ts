import { Component, signal } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { BannersComponent } from './components/banners/banners.component';
import { DashboardGridComponent } from './components/dashboard/dashboard-grid.component';
import { WorkspaceModalComponent } from './components/workspace/workspace-modal.component';
import { CreateRequirementModalComponent } from './components/modals/create-requirement-modal.component';
import { RecurringTemplateModalComponent } from './components/modals/recurring-template-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    BannersComponent,
    DashboardGridComponent,
    WorkspaceModalComponent,
    CreateRequirementModalComponent,
    RecurringTemplateModalComponent
  ],
  template: `
    <app-header
      (openCreateModal)="showCreateModal.set(true)"
      (openRecurringModal)="showRecurringModal.set(true)"
    />

    <app-banners />

    <app-dashboard-grid />

    <app-workspace-modal />

    @if (showCreateModal()) {
      <app-create-requirement-modal
        (closeModal)="showCreateModal.set(false)"
      />
    }

    @if (showRecurringModal()) {
      <app-recurring-template-modal
        (closeModal)="showRecurringModal.set(false)"
      />
    }
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AppComponent {
  readonly showCreateModal = signal(false);
  readonly showRecurringModal = signal(false);
}
