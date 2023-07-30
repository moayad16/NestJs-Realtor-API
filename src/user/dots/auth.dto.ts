import { userType } from "@prisma/client";
import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsEnum, IsOptional } from "class-validator";

export class SignUpDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsString() 
    @MinLength(8)
    password: string;

    @Matches(/^[0-9]{10}$/, { message: "Invalid Phone Number"})
    phone: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    productKey?: string;
}

export class SignInDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}


export class GenerateProductKeyDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsEnum(userType)
    userType: userType;
}
