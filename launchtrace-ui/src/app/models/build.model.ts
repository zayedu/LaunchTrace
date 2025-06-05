export interface Build {
  buildId: number;
  serialNumber: string;
  buildDate: string;
  partCount: number;
  faultyPartCount: number;
  parts?: Part[];
}

export interface BuildDetail {
  buildId: number;
  serialNumber: string;
  buildDate: string;
  partCount: number;
  faultyPartCount: number;
  parts: Part[];
}

export interface BuildsResponse {
  total: number;
  items: Build[];
}

export interface CreateBuildRequest {
  serialNumber: string;
  buildDate: string;
  partIds: number[];
}

export interface Part {
  partId: number;
  name: string;
  status: string;
  supplierId: number;
  supplier: Supplier;
}

export interface Supplier {
  supplierId: number;
  name: string;
}
