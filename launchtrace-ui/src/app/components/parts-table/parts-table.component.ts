import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator";
import { MatButtonModule } from "@angular/material/button";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatDialogModule } from "@angular/material/dialog";
import { PartsService } from "../../services/parts.service";
import { PartDto, PartsResponse } from "../../models/part.model";

@Component({
  selector: "app-parts-table",
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  template: `
    <div>
      <h2>Parts Management</h2>

      <!-- Filter -->
      <mat-form-field appearance="outline" style="margin-bottom: 20px;">
        <mat-label>Filter by Status</mat-label>
        <mat-select
          [(value)]="selectedFilter"
          (selectionChange)="applyFilter()"
        >
          <mat-option value="All">All</mat-option>
          <mat-option value="OK">OK</mat-option>
          <mat-option value="FAULTY">FAULTY</mat-option>
        </mat-select>
      </mat-form-field>

      <!-- Loading Spinner -->
      <div *ngIf="loading" class="loading-container">
        <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
      </div>

      <!-- Table -->
      <div *ngIf="!loading">
        <table mat-table [dataSource]="filteredParts" class="mat-elevation-2">
          <!-- Part ID Column -->
          <ng-container matColumnDef="partId">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let part">{{ part.partId }}</td>
          </ng-container>

          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let part">{{ part.name }}</td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let part">
              <span [style.color]="part.status === 'OK' ? 'green' : 'red'">
                {{ part.status }}
              </span>
            </td>
          </ng-container>

          <!-- Supplier Column -->
          <ng-container matColumnDef="supplier">
            <th mat-header-cell *matHeaderCellDef>Supplier</th>
            <td mat-cell *matCellDef="let part">{{ part.supplier.name }}</td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let part">
              <button
                mat-raised-button
                color="warn"
                (click)="flagPartFaulty(part)"
                [disabled]="part.status === 'FAULTY'"
              >
                Flag Faulty
              </button>
              <button
                mat-raised-button
                color="primary"
                (click)="showBuilds(part)"
                style="margin-left: 8px;"
              >
                Builds
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>

        <!-- Paginator -->
        <mat-paginator
          [length]="totalParts"
          [pageSize]="pageSize"
          [pageSizeOptions]="[25, 50, 100]"
          [pageIndex]="currentPage"
          (page)="onPageChange($event)"
          showFirstLastButtons
        >
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [
    `
      table {
        width: 100%;
      }

      .mat-mdc-form-field {
        width: 200px;
      }
    `,
  ],
})
export class PartsTableComponent implements OnInit {
  displayedColumns: string[] = [
    "partId",
    "name",
    "status",
    "supplier",
    "actions",
  ];
  allParts: PartDto[] = [];
  filteredParts: PartDto[] = [];
  totalParts = 0;
  loading = false;
  selectedFilter = "All";

  // Pagination
  currentPage = 0;
  pageSize = 50;

  constructor(private partsService: PartsService) {}

  ngOnInit(): void {
    this.loadParts();
  }

  loadParts(): void {
    this.loading = true;
    this.partsService
      .getParts(this.currentPage * this.pageSize, this.pageSize)
      .subscribe({
        next: (response: PartsResponse) => {
          this.allParts = response.items;
          this.totalParts = response.total;
          this.applyFilter();
          this.loading = false;
        },
        error: (error) => {
          console.error("Error loading parts:", error);
          this.loading = false;
        },
      });
  }

  applyFilter(): void {
    if (this.selectedFilter === "All") {
      this.filteredParts = this.allParts;
    } else {
      this.filteredParts = this.allParts.filter(
        (part) => part.status === this.selectedFilter
      );
    }
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadParts();
  }

  flagPartFaulty(part: PartDto): void {
    this.partsService.flagPartFaulty(part.partId).subscribe({
      next: () => {
        part.status = "FAULTY";
        this.applyFilter();
      },
      error: (error) => {
        console.error("Error flagging part as faulty:", error);
      },
    });
  }

  showBuilds(part: PartDto): void {
    // Placeholder for builds dialog - not yet implemented
    alert(
      `Builds dialog for part ${part.name} (ID: ${part.partId}) - Not yet implemented`
    );
  }
}
