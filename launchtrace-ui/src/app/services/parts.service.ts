import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { PartsResponse, BuildDto } from "../models/part.model";

@Injectable({
  providedIn: "root",
})
export class PartsService {
  private baseUrl = "http://localhost:5029/api";

  constructor(private http: HttpClient) {}

  getParts(skip: number = 0, take: number = 50): Observable<PartsResponse> {
    return this.http.get<PartsResponse>(
      `${this.baseUrl}/parts?skip=${skip}&take=${take}`
    );
  }

  flagPartFaulty(partId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/parts/${partId}/flagFaulty`, {});
  }

  getImpactedBuilds(partId: number): Observable<BuildDto[]> {
    return this.http.get<BuildDto[]>(
      `${this.baseUrl}/impacted-builds/${partId}`
    );
  }
}
