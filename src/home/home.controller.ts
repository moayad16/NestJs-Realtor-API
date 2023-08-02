import { Body, Controller, Delete, Get, Param, Post, Put, Query, UnauthorizedException, UseGuards } from '@nestjs/common';
import { HomeService } from './home.service';
import { createHomeDto, homeResponseDto, messageDto, updateHomeDto } from './dtos/home.dto';
import { queryDto } from './dtos/query.dto';
import { User } from 'src/user/decorators/user.decorator';
import { role } from 'src/decorators/role.decotator';
import { userType } from '@prisma/client';



export interface userInfo {
    id: number
    name: string,
    email: string,
}

@Controller('homes')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  getHomes(@Query() queryParams: queryDto): Promise<homeResponseDto[]> {
    return this.homeService.getHomes(queryParams);
  }

  @Get('/:id')
  getHome(@Param('id') id: number): Promise<homeResponseDto> {    
    return this.homeService.getHomeById(id);
  }

  @role(userType.ADMIN, userType.REALTOR)
  @Post('/createHome')
  createHome(@Body() body: createHomeDto, @User() user: userInfo) {
    return 'home';
    // return this.homeService.createHome(body, user.id)
  }

  @role(userType.REALTOR)
  @Put('/updateHome/:id')
  updateHome(
    @Body() body: updateHomeDto,
    @Param('id') id: number,
    @User() user: userInfo,
  ) {
    if (user) {
      return this.homeService.updateHome(body, id, user.id);
    } else {
      return new UnauthorizedException(
        'You are not authorized to update this home',
      );
    }
  }

  @role(userType.REALTOR, userType.ADMIN)
  @Delete('/deleteHome/:id')
  deleteHome(@Param('id') id: number, @User() user: userInfo) {
    return this.homeService.deleteHome(id, user.id);
  }

  @role(userType.USER)
  @Post('/inquire/:id')
  inquire(
    @Param('id') id: number,
    @Body() { message }: messageDto,
    @User() user: userInfo,
  ) {
    return this.homeService.inquire(id, message, user.id);
  }

  @role(userType.REALTOR)
  @Get(':id/inquiries')
  getInquiries(@User() user: userInfo, @Param() id: number) {
    return this.homeService.getInquiries(user.id, id);
    
  }
}
