import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { userType } from "@prisma/client";
import * as jwt from 'jsonwebtoken';
import { PrismaService } from "src/prisma/prisma.service";


@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private reflector: Reflector, private readonly prismaService: PrismaService) {}

    async canActivate(context: ExecutionContext ) {

        const roles = this.reflector.getAllAndOverride<userType[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ])

        if(roles?.length === 0 || !roles) return true;
        
        
        try {
            const token = context.switchToHttp().getRequest().headers.authorization.split(' ')[1];
            const userId = jwt.verify(token, process.env.JWT_SECRET)['id'];
            const user = await this.prismaService.user.findUnique({
                where: {
                    id: userId
                }
            })

            if (roles.includes(user['role'])) return true;
        }
        catch (err) {
            console.log(err);
            
            return false; 
        }        


    }

}