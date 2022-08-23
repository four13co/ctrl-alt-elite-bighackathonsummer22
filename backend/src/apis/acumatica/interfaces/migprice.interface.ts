export interface MigPricing {
  InventoryID: string;
  OrderQuantity: number;
  RoundedOrderQty?: number;
  Discount?: number;
  UnitPrice?: number;
  ExtPrice?: number;
}
