import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatChipsModule } from "@angular/material/chips";
import { MatTableModule } from "@angular/material/table";
import { MatToolbarModule } from "@angular/material/toolbar";
import { BuildsService } from "../../services/builds.service";
import { PartsService } from "../../services/parts.service";
import { BuildDetail, Part } from "../../models/build.model";

@Component({
  selector: "app-build-detail",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTableModule,
    MatToolbarModule,
  ],
  template: `
    <div class="build-detail-container" *ngIf="build">
      <mat-toolbar color="primary">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span>Build Details: {{ build.serialNumber }}</span>
        <span class="spacer"></span>
        <mat-chip
          [color]="build.faultyPartCount === 0 ? 'accent' : 'warn'"
          [class.status-ok]="build.faultyPartCount === 0"
          [class.status-faulty]="build.faultyPartCount > 0"
        >
          {{ build.faultyPartCount === 0 ? "HEALTHY" : "AFFECTED" }}
        </mat-chip>
      </mat-toolbar>

      <div class="content">
        <!-- Build Summary Card -->
        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>Build Summary</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="label">Build ID:</span>
                <span class="value">{{ build.buildId }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Serial Number:</span>
                <span class="value">{{ build.serialNumber }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Build Date:</span>
                <span class="value">{{
                  build.buildDate | date : "fullDate"
                }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Total Parts:</span>
                <span class="value">
                  <mat-chip color="primary">{{ build.partCount }}</mat-chip>
                </span>
              </div>
              <div class="summary-item">
                <span class="label">Faulty Parts:</span>
                <span class="value">
                  <mat-chip
                    [color]="build.faultyPartCount > 0 ? 'warn' : 'accent'"
                    [class.faulty-warning]="build.faultyPartCount > 0"
                  >
                    {{ build.faultyPartCount }}
                  </mat-chip>
                </span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Parts List Card -->
        <mat-card class="parts-card">
          <mat-card-header>
            <mat-card-title>Parts in this Build</mat-card-title>
            <mat-card-subtitle>
              {{ build.parts.length }} parts total
              <span *ngIf="build.faultyPartCount > 0" class="faulty-notice">
                - {{ build.faultyPartCount }} faulty parts detected
              </span>
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <div class="table-container">
              <table mat-table [dataSource]="build.parts" class="parts-table">
                <!-- Part ID Column -->
                <ng-container matColumnDef="partId">
                  <th mat-header-cell *matHeaderCellDef>Part ID</th>
                  <td mat-cell *matCellDef="let part">{{ part.partId }}</td>
                </ng-container>

                <!-- Part Name Column -->
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Part Name</th>
                  <td mat-cell *matCellDef="let part">{{ part.name }}</td>
                </ng-container>

                <!-- Status Column -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let part">
                    <mat-chip
                      [color]="part.status === 'OK' ? 'accent' : 'warn'"
                      [class.status-ok]="part.status === 'OK'"
                      [class.status-faulty]="part.status === 'FAULTY'"
                    >
                      {{ part.status }}
                    </mat-chip>
                  </td>
                </ng-container>

                <!-- Supplier Column -->
                <ng-container matColumnDef="supplier">
                  <th mat-header-cell *matHeaderCellDef>Supplier</th>
                  <td mat-cell *matCellDef="let part">
                    {{ part.supplier.name }}
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let part">
                    <button
                      mat-button
                      color="warn"
                      *ngIf="part.status === 'OK'"
                      (click)="flagPartFaulty(part.partId)"
                    >
                      <mat-icon>warning</mat-icon>
                      Flag Faulty
                    </button>
                    <span *ngIf="part.status === 'FAULTY'" class="faulty-label">
                      <mat-icon color="warn">error</mat-icon>
                      Flagged as Faulty
                    </span>
                  </td>
                </ng-container>

                <tr
                  mat-header-row
                  *matHeaderRowDef="partsDisplayedColumns"
                ></tr>
                <tr
                  mat-row
                  *matRowDef="let row; columns: partsDisplayedColumns"
                  [class.faulty-row]="row.status === 'FAULTY'"
                ></tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>

    <div *ngIf="!build" class="loading">
      <mat-card>
        <mat-card-content> Loading build details... </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .build-detail-container {
        height: 100vh;
        display: flex;
        flex-direction: column;
      }

      .spacer {
        flex: 1 1 auto;
      }

      .content {
        padding: 20px;
        flex: 1;
        overflow-y: auto;
      }

      .summary-card {
        margin-bottom: 20px;
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }

      .summary-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .label {
        font-weight: 500;
        color: #666;
        font-size: 0.875rem;
      }

      .value {
        font-size: 1rem;
      }

      .parts-table {
        width: 100%;
      }

      .table-container {
        overflow-x: auto;
      }

      .faulty-row {
        background-color: #ffebee;
      }

      .faulty-notice {
        color: #f44336;
        font-weight: 500;
      }

      .faulty-label {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #f44336;
        font-style: italic;
      }

      .faulty-warning {
        animation: pulse 2s infinite;
      }

      .status-ok {
        background-color: #4caf50 !important;
        color: white !important;
      }

      .status-faulty {
        background-color: #f44336 !important;
        color: white !important;
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0% {
          opacity: 1;
        }
        50% {
          opacity: 0.7;
        }
        100% {
          opacity: 1;
        }
      }

      .loading {
        padding: 20px;
      }
    `,
  ],
})
export class BuildDetailComponent implements OnInit {
  build: BuildDetail | null = null;
  buildId: number = 0;

  partsDisplayedColumns: string[] = [
    "partId",
    "name",
    "status",
    "supplier",
    "actions",
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private buildsService: BuildsService,
    private partsService: PartsService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.buildId = +params["id"];
      this.loadBuildDetail();
    });
  }

  loadBuildDetail(): void {
    this.buildsService.getBuildById(this.buildId).subscribe({
      next: (build) => {
        this.build = build;
      },
      error: (error) => {
        console.error("Error loading build details:", error);
      },
    });
  }

  flagPartFaulty(partId: number): void {
    this.partsService.flagPartFaulty(partId).subscribe({
      next: () => {
        // Reload build details to see updated status
        this.loadBuildDetail();
      },
      error: (error) => {
        console.error("Error flagging part as faulty:", error);
      },
    });
  }

  goBack(): void {
    this.router.navigate(["/builds"]);
  }
}
