import { PropertyType } from '.prisma/client';
import { Exclude, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Validate,
  ValidateNested,
} from 'class-validator';

export class homeResponseDto {
  id: number;
  address: string;
  bedrooms: number;
  bathrooms: number;
  price: number;
  sqft: number;
  city: string;
  @Exclude()
  listingDate: Date;

  type: PropertyType;

  @Exclude()
  createdAt: Date;
  @Exclude()
  updatedAt: Date;
  @Exclude()
  realtorIds: number;

  image: string;

  constructor(partial: Partial<homeResponseDto>) {
    Object.assign(this, partial);
  }
}

class ImageDto {
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class createHomeDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  @IsPositive()
  bedrooms: number;

  @IsNumber()
  @IsPositive()
  bathrooms: number;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsNumber()
  @IsPositive()
  sqft: number;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsEnum(PropertyType)
  type: PropertyType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  images: ImageDto[];
}



export class updateHomeDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  bedrooms?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  bathrooms?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  sqft?: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  city?: string;

  @IsEnum(PropertyType)
  @IsOptional()
  type?: PropertyType;
}

