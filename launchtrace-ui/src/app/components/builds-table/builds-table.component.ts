import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatChipsModule } from "@angular/material/chips";
import { Router } from "@angular/router";
import { BuildsService } from "../../services/builds.service";
import { Build } from "../../models/build.model";

@Component({
  selector: "app-builds-table",
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Spacecraft Builds</mat-card-title>
        <mat-card-subtitle
          >Manage spacecraft builds and track parts</mat-card-subtitle
        >
      </mat-card-header>

      <mat-card-content>
        <div class="table-container">
          <table mat-table [dataSource]="builds" class="builds-table">
            <!-- Build ID Column -->
            <ng-container matColumnDef="buildId">
              <th mat-header-cell *matHeaderCellDef>Build ID</th>
              <td mat-cell *matCellDef="let build">{{ build.buildId }}</td>
            </ng-container>

            <!-- Serial Number Column -->
            <ng-container matColumnDef="serialNumber">
              <th mat-header-cell *matHeaderCellDef>Serial Number</th>
              <td mat-cell *matCellDef="let build">
                <strong>{{ build.serialNumber }}</strong>
              </td>
            </ng-container>

            <!-- Build Date Column -->
            <ng-container matColumnDef="buildDate">
              <th mat-header-cell *matHeaderCellDef>Build Date</th>
              <td mat-cell *matCellDef="let build">
                {{ build.buildDate | date : "mediumDate" }}
              </td>
            </ng-container>

            <!-- Part Count Column -->
            <ng-container matColumnDef="partCount">
              <th mat-header-cell *matHeaderCellDef>Total Parts</th>
              <td mat-cell *matCellDef="let build">
                <mat-chip color="primary">{{ build.partCount }}</mat-chip>
              </td>
            </ng-container>

            <!-- Faulty Parts Column -->
            <ng-container matColumnDef="faultyPartCount">
              <th mat-header-cell *matHeaderCellDef>Faulty Parts</th>
              <td mat-cell *matCellDef="let build">
                <mat-chip
                  [color]="build.faultyPartCount > 0 ? 'warn' : 'accent'"
                  [class.faulty-warning]="build.faultyPartCount > 0"
                >
                  {{ build.faultyPartCount }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let build">
                <mat-chip
                  [color]="build.faultyPartCount === 0 ? 'accent' : 'warn'"
                  [class.status-ok]="build.faultyPartCount === 0"
                  [class.status-faulty]="build.faultyPartCount > 0"
                >
                  {{ build.faultyPartCount === 0 ? "OK" : "AFFECTED" }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let build">
                <button
                  mat-button
                  color="primary"
                  (click)="viewBuildDetails(build.buildId)"
                >
                  <mat-icon>visibility</mat-icon>
                  View Details
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </div>

        <mat-paginator
          [length]="totalBuilds"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 25, 50, 100]"
          (page)="onPageChange($event)"
          showFirstLastButtons
        >
        </mat-paginator>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .builds-table {
        width: 100%;
      }

      .table-container {
        overflow-x: auto;
        margin-bottom: 16px;
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

      mat-chip {
        font-weight: 500;
      }

      mat-card-title {
        color: #1976d2;
      }
    `,
  ],
})
export class BuildsTableComponent implements OnInit {
  builds: Build[] = [];
  totalBuilds = 0;
  pageSize = 25;
  currentPage = 0;

  displayedColumns: string[] = [
    "buildId",
    "serialNumber",
    "buildDate",
    "partCount",
    "faultyPartCount",
    "status",
    "actions",
  ];

  constructor(private buildsService: BuildsService, private router: Router) {}

  ngOnInit(): void {
    this.loadBuilds();
  }

  loadBuilds(): void {
    const skip = this.currentPage * this.pageSize;
    this.buildsService.getBuilds(skip, this.pageSize).subscribe({
      next: (response) => {
        this.builds = response.items;
        this.totalBuilds = response.total;
      },
      error: (error) => {
        console.error("Error loading builds:", error);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadBuilds();
  }

  viewBuildDetails(buildId: number): void {
    this.router.navigate(["/builds", buildId]);
  }
}
