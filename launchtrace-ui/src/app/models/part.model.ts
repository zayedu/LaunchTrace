export interface PartDto {
  partId: number;
  name: string;
  status: string;
  supplierId: number;
  supplier: SupplierDto;
}

export interface SupplierDto {
  supplierId: number;
  name: string;
}

export interface PartsResponse {
  total: number;
  items: PartDto[];
}

export interface BuildDto {
  buildId: number;
  serialNumber: string;
  buildDate: string;
}
