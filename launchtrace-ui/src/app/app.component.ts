import { Component } from "@angular/core";
import { RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatTabsModule } from "@angular/material/tabs";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatTabsModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  template: `
    <mat-toolbar color="primary">
      <span>TraceX</span>
      <span class="spacer"></span>
      <nav>
        <a mat-button routerLink="/parts" routerLinkActive="active-link">
          Parts Management
        </a>
        <a mat-button routerLink="/builds" routerLinkActive="active-link">
          Builds Management
        </a>
      </nav>
    </mat-toolbar>

    <div class="content">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [
    `
      .spacer {
        flex: 1 1 auto;
      }

      nav a {
        margin-left: 8px;
        color: white;
      }

      .active-link {
        background-color: rgba(255, 255, 255, 0.2);
      }

      .content {
        padding: 20px;
        min-height: calc(100vh - 64px);
        background-color: #f5f5f5;
      }
    `,
  ],
})
export class AppComponent {
  title = "LaunchTrace";
}
