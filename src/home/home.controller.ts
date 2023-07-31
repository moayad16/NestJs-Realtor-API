import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { HomeService } from './home.service';
import { createHomeDto, homeResponseDto, updateHomeDto } from './dtos/home.dto';
import { queryDto } from './dtos/query.dto';


@Controller('homes')
export class HomeController {

    constructor(private readonly homeService: HomeService) { }

    @Get()
    getHomes(@Query() queryParams: queryDto): Promise<homeResponseDto[]>  {
        
        return this.homeService.getHomes(queryParams)
    }

    @Get(':id')
    getHome(@Param('id') id: number): Promise<homeResponseDto> {
        return this.homeService.getHomeById(id)
    }

    @Post('/createHome')
    createHome(@Body() body: createHomeDto) {
        // return this.homeService.createHome(body)
        return this.homeService.createHome(body)
    }

    @Put('/updateHome/:id')
    updateHome(@Body() body: updateHomeDto, @Param('id') id: number) {
        return this.homeService.updateHome(body, id)
    }

    @Delete('/deleteHome/:id')
    deleteHome(@Param('id') id: number) {
        return this.homeService.deleteHome(id)
    }





}
