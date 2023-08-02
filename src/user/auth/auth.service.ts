import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken'; 
import { userType } from '@prisma/client';


interface SignUpParams {
  email: string;
  password: string;
  name: string;
  phone: string;
}

interface SignInParams {
    email: string;
    password: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async signUp({ email, password, name, phone }: SignUpParams, UserType: userType) {

    let user = {}
    
    if (await this.prismaService.user.findUnique({ where: { email } }) !== null) {
      return new HttpException('Email is already in use', HttpStatus.BAD_REQUEST);
    }
    else {
        user = await this.prismaService.user.create({
            data: {
                email,
                password: await bcrypt.hash(password, 10),
                name,
                phone,
                role: UserType,
            },
        })
    }

    const id = user['id']

    const token = jwt.sign({ email, name, id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });


    return token
    
  }

    async signIn({ email, password }: SignInParams) {
        const user = await this.prismaService.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            throw new HttpException('Invalid Credentials', 400);
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            throw new HttpException('Invalid Credentials', 400);
        }

        const token = jwt.sign({ email, name: user.name, id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        return token;
    }

    async generateProductKey(email: string, type: userType) {
        const string = `${email}-${type}-${process.env.SECRET_STRING_FOR_PRODUCT_KEY}`;
        return bcrypt.hash(string, 10);
    }
} 

