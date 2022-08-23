interface AttributeValue {
  AttributeID: string;
  AttributeDescription: string;
  RefNoteID: string;
  Required: boolean;
  Value: string;
  ValueDescription: string;
}

interface BoxStockItem {
  BoxID: string;
  Description: string;
  MaxQty: number;
  MaxVolume: number;
  MaxWeight: number;
  Qty: number;
  UOM: string;
}

interface CategoryStockItem {
  CategoryID: number;
}

interface InventoryItemCrossReference {
  AlternateID: string;
  AlternateType: string;
  Description: string;
  Subitem: string;
  VendorOrCustomer: string;
  UOM: string;
}

interface InventoryFileUrls {
  FileType: string;
  FileURL: string;
  NoteID: string;
}

interface ReplenishmentParameterStockItem {
  DemandForecastModel: string;
  ForecastPeriodType: string;
  LaunchDate: Date;
  MaxQty: number;
  MaxShelfLifeInDays: number;
  Method: string;
  PeriodsToAnalyze: number;
  ReorderPoint: number;
  ReplenishmentClass: string;
  ReplenishmentWarehouse: string;
  SafetyStock: number;
  Seasonality: string;
  ServiceLevel: number;
  Source: string;
  TerminationDate: Date;
  TransferERQ: number;
}

interface SubItemStockItem {
  Active: boolean;
  Description: string;
  SegmentID: number;
  Value: string;
}

interface InventoryItemUOMConversion {
  ConversionFactor: number;
  FromUOM: string;
  MultiplyOrDivide: string;
  ToUOM: string;
}

interface StockItemVendorDetail {
  Active: boolean;
  AddLeadTimeDays: number;
  CurrencyID: string;
  Default: boolean;
  EOQ: number;
  LastVendorPrice: number;
  LeadTimeDays: number;
  Location: string;
  LotSize: number;
  MaxOrderQty: number;
  MinOrderFrequencyInDays: number;
  MinOrderQty: number;
  Override: boolean;
  PurchaseUnit: string;
  RecordID: number;
  Subitem: string;
  VendorID: string;
  VendorName: string;
  Warehouse: string;
}

interface StockItemWarehouseDetail {
  DailyDemandForecast: number;
  DailyDemandForecastErrorSTDEV: number;
  DefaultIssueLocationID: string;
  DefaultReceiptLocationID: string;
  InventoryAccount: string;
  InventorySubaccount: string;
  IsDefault: boolean;
  LastForecastDate: Date;
  Override: boolean;
  OverridePreferredVendor: boolean;
  OverrideReplenishmentSettings: boolean;
  OverrideStdCost: boolean;
  PreferredVendor: string;
  PriceOverride: boolean;
  ProductManager: string;
  ProductWorkgroup: string;
  QtyOnHand: number;
  ReplenishmentSource: string;
  ReplenishmentWarehouse: string;
  Seasonality: string;
  ServiceLevel: number;
  Status: string;
  WarehouseID: string;
}

export interface Product {
  Attributes: AttributeValue[];
  Boxes: BoxStockItem[];
  Categories: CategoryStockItem[];
  CrossReferences: InventoryItemCrossReference[];
  FileURLs: InventoryFileUrls[];
  ReplenishmentParameters: ReplenishmentParameterStockItem[];
  SubItems: SubItemStockItem[];
  UOMConversions: InventoryItemUOMConversion[];
  VendorDetails: StockItemVendorDetail;
  WarehouseDetails: StockItemWarehouseDetail[];
}
