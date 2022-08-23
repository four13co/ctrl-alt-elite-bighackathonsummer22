import { IsArray, IsNumber, IsString } from 'class-validator';

export class CalculatorDtoData {
  @IsString()
  public InventoryID: string;

  @IsNumber()
  public OrderQuantity: number;
}

export class CalculatorDto {
  @IsString()
  public sku: string;

  @IsNumber()
  public quantity: number;
}

export class CalculatorParamDto {
  @IsString()
  public sku: string;

  @IsNumber()
  public quantity: string;

  @IsString()
  public lineItemId: string;

  @IsString()
  public cartId: string;

  @IsString()
  public productId: string;
}
