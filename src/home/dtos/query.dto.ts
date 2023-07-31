import { PropertyType } from "@prisma/client";
import { IsOptional } from "class-validator";

export class queryDto {

    @IsOptional()
    city?: string;

    @IsOptional()
    type?: PropertyType;

    @IsOptional()
    bedrooms?: string;

    @IsOptional()
    bathrooms?: string;

    @IsOptional()
    minPrice?: string;

    @IsOptional() 
    maxPrice?: string;

    constructor(partial: Partial<queryDto>) {
        Object.assign(this, partial);
    }
}