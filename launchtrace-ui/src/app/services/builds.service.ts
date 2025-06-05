import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  BuildsResponse,
  BuildDetail,
  CreateBuildRequest,
} from "../models/build.model";

@Injectable({
  providedIn: "root",
})
export class BuildsService {
  private baseUrl = "http://localhost:5029/api";

  constructor(private http: HttpClient) {}

  getBuilds(skip: number = 0, take: number = 50): Observable<BuildsResponse> {
    return this.http.get<BuildsResponse>(
      `${this.baseUrl}/builds?skip=${skip}&take=${take}`
    );
  }

  getBuildById(buildId: number): Observable<BuildDetail> {
    return this.http.get<BuildDetail>(`${this.baseUrl}/builds/${buildId}`);
  }

  createBuild(request: CreateBuildRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/builds`, request);
  }
}
