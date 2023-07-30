 import { Body, Controller, Param, ParseEnumPipe, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto, GenerateProductKeyDto } from '../dots/auth.dto';
import { userType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {

    constructor(private readonly AuthService: AuthService ) { }

    @Post('/signup/:userType')
    async signUp(@Body() body: SignUpDto, @Param('userType', new ParseEnumPipe(userType)) UserType: userType) {

        if (UserType !== userType.USER){
            if(!body.productKey){
                return new UnauthorizedException('Product Key is required');
            }

            const isValid = await bcrypt.compare(
              `${body.email}-${UserType}-${process.env.SECRET_STRING_FOR_PRODUCT_KEY}`,
              body.productKey
            );

            if(!isValid) return new UnauthorizedException('Invalid Product Key');
            
        }

        return this.AuthService.signUp(body, UserType); 
    }

    @Post('/signin')
    signIn(@Body() body: SignInDto) {
        return this.AuthService.signIn(body);
    }

    @Post('/key')
    generateProductKey(@Body() {email, userType}: GenerateProductKeyDto) {
        return this.AuthService.generateProductKey(email, userType);
    }



}
