import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { provideHttpClient } from "@angular/common/http";
import { provideRouter, Routes } from "@angular/router";
import { PartsTableComponent } from "./app/components/parts-table/parts-table.component";
import { BuildsTableComponent } from "./app/components/builds-table/builds-table.component";
import { BuildDetailComponent } from "./app/components/build-detail/build-detail.component";
import { BuildsService } from "./app/services/builds.service";
import { PartsService } from "./app/services/parts.service";

const routes: Routes = [
  { path: "", redirectTo: "/parts", pathMatch: "full" },
  { path: "parts", component: PartsTableComponent },
  { path: "builds", component: BuildsTableComponent },
  { path: "builds/:id", component: BuildDetailComponent },
];

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimationsAsync(),
    provideHttpClient(),
    provideRouter(routes),
    BuildsService,
    PartsService,
  ],
}).catch((err) => console.error(err));
