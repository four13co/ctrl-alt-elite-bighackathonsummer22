interface Address {
  AddressLine1: string;
  AddressLine2: string;
  City: string;
  Country: string;
  PostalCode: string;
  State: string;
  Validated: boolean;
}

interface DocContact {
  Attention: string;
  BusinessName: string;
  Email: string;
  Phone1: string;
}

interface Commissions {
  DefaultSalesperson: string;
  SalesPersons: {
    CommissionableAmount: number;
    CommissionAmount: number;
    CommissionPercent: number;
    SalespersonID: number;
  };
}

interface SalesOrderDetail {
  Account: string;
  AlternateID: string;
  Amount: number;
  AutoCreateIssue: boolean;
  AverageCost: number;
  Branch: string;
  CalculateDiscountsOnImport: boolean;
  Commissionable: boolean;
  Completed: boolean;
  CostCode: string;
  DiscountAmount: number;
  DiscountCode: string;
  DiscountedUnitPrice: number;
  DiscountPercent: number;
  ExtendedPrice: number;
  FreeItem: boolean;
  InventoryID: string;
  LastModifiedDate: string;
  LineDescription: string;
  LineNbr: number;
  LineType: string;
  Location: string;
  ManualDiscount: boolean;
  MarkForPO: boolean;
  OpenQty: number;
  Operation: string;
  OrderQty: number;
  OvershipThreshold: number;
  POSource: string;
  ProjectTask: string;
  QtyOnShipments: number;
  ReasonCode: string;
  RequestedOn: Date;
  SalespersonID: string;
  ShipOn: Date;
  ShippingRule: string;
  Subitem: string;
  TaxCategory: string;
  UnbilledAmount: number;
  UndershipThreshold: number;
  UnitCost: number;
  UnitPrice: number;
  UOM: string;
  WarehouseID: string;
  Allocations: {
    Allocated: boolean;
    AllocWarehouseID: string;
    Completed: boolean;
    ExpirationDate: Date;
    InventoryID: string;
    LineNbr: number;
    LocationID: string;
    LotSerialNbr: string;
    OrderNbr: string;
    OrderType: string;
    Qty: number;
    QtyOnShipments: number;
    QtyReceived: number;
    RelatedDocument: string;
    ShipOn: Date;
    SplitLineNbr: number;
    Subitem: string;
    UOM: string;
  };
  PurchasingSettings: {
    POSiteID: string;
    POSource: string;
    VendorID: string;
  };
}

interface SalesOrderDiscountDetails {
  Description: string;
  DiscountableAmount: number;
  DiscountableQty: number;
  DiscountAmount: number;
  DiscountCode: string;
  DiscountPercent: number;
  ExternalDiscountCode: string;
  FreeItem: string;
  FreeItemQty: number;
  ManualDiscount: boolean;
  SequenceID: string;
  SkipDiscount: boolean;
  Type: string;
}

interface FinancialSettings {
  BillSeparately: boolean;
  Branch: string;
  CashDiscountDate: Date;
  CustomerTaxZone: string;
  DueDate: Date;
  EntityUsageType: string;
  InvoiceDate: Date;
  InvoiceNbr: string;
  OriginalOrderNbr: string;
  OriginalOrderType: string;
  OverrideTaxZone: boolean;
  Owner: string;
  PostPeriod: string;
  Terms: string;
}

interface SalesOrderPayment {
  ApplicationDate: Date;
  AppliedToOrder: number;
  Authorize: boolean;
  Balance: number;
  CardAccountNbr: string;
  Capture: boolean;
  CashAccount: string;
  Currency: string;
  Description: string;
  DocType: string;
  Hold: boolean;
  LastModifiedDateTime: Date;
  PaymentAmount: number;
  PaymentMethod: string;
  PaymentRef: string;
  ProcessingCenterID: string;
  ReferenceNbr: string;
  SaveCard: boolean;
  Status: string;
  TransferredtoInvoice: number;
  CreditCardTransactionInfo: {
    AuthNbr: string;
    ExtProfileId: string;
    NeedValidation: boolean;
    TranDate: Date;
    TranNbr: string;
    TranType: string;
  };
}

interface SalesOrderShipment {
  InventoryDocType: string;
  InventoryRefNbr: string;
  InvoiceNbr: string;
  InvoiceType: string;
  ShipmentDate: Date;
  ShipmentNbr: string;
  ShipmentType: string;
  ShippedQty: number;
  ShippedVolume: number;
  ShippedWeight: number;
  Status: string;
}

interface ShippingSettings {
  CancelByDate: Date;
  Canceled: boolean;
  FOBPoint: string;
  GroundCollect: boolean;
  Insurance: boolean;
  PreferredWarehouseID: string;
  Priority: number;
  ResidentialDelivery: boolean;
  SaturdayDelivery: boolean;
  ScheduledShipmentDate: Date;
  ShippingRule: string;
  ShippingTerms: string;
  ShippingZone: string;
  ShipSeparately: boolean;
  ShipVia: string;
  UseCustomersAccount: boolean;
  Freight: number;
  FreightCost: number;
  FreightCostIsuptodate: boolean;
  FreightTaxCategory: string;
  OrderVolume: number;
  OrderWeight: number;
  PackageWeight: number;
  PremiumFreight: number;
  ShopForRates: {
    IsManualPackage: boolean;
    OrderWeight: number;
    PackageWeight: number;
  };
}

interface TaxDetail {
  IncludeInVATExemptTotal: boolean;
  LineNbr: number;
  OrderNbr: string;
  OrderType: string;
  PendingVAT: boolean;
  RecordID: number;
  ReverseVAT: boolean;
  StatisticalVAT: boolean;
  TaxableAmount: number;
  TaxAmount: number;
  TaxID: string;
  TaxRate: number;
  TaxType: string;
}

interface Totals {
  DiscountTotal: number;
  LineTotalAmount: number;
  MiscTotalAmount: number;
  TaxTotal: number;
  UnbilledAmount: number;
  UnbilledQty: number;
  UnpaidBalance: number;
}

export interface Order {
  BillToAddress: Address[];
  BillToContact: DocContact[];
  Commissions: Commissions[];
  Details: SalesOrderDetail[];
  DiscountDetails: SalesOrderDiscountDetails[];
  FinancialSettings: FinancialSettings[];
  Payments: SalesOrderPayment[];
  Shipments: SalesOrderShipment[];
  ShippingSettings: ShippingSettings[];
  ShipToAddress: Address[];
  ShipToContact: DocContact[];
  TaxDetails: TaxDetail[];
  Totals: Totals[];
}
