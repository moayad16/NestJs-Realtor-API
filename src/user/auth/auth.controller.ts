 import { Body, Controller, Param, ParseEnumPipe, Post, UnauthorizedException, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto, GenerateProductKeyDto } from '../dots/auth.dto';
import { userType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { User } from '../decorators/user.decorator';
import { userInfo } from 'src/home/home.controller';
import { role } from 'src/decorators/role.decotator';

@Controller('auth')
export class AuthController {

    constructor(private readonly AuthService: AuthService ) { }

    @role()
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

    @role()
    @Post('/signin')
    signIn(@Body() body: SignInDto) {
        return this.AuthService.signIn(body);
    }

    @role(userType.ADMIN)
    @Post('/key')
    generateProductKey(@Body() {email, userType}: GenerateProductKeyDto) {
        return this.AuthService.generateProductKey(email, userType);
    }

    @role()
    @Get('me')
    getMe(@User() user: userInfo) {
        return user;
    }

}
