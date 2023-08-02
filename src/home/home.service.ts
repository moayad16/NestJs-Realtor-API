import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { homeResponseDto, messageDto, updateHomeDto } from './dtos/home.dto';
import { queryDto } from './dtos/query.dto';
import { PropertyType } from '@prisma/client';

interface createHomeParams {
  address: string;
  bedrooms: number;
  bathrooms: number;
  price: number;
  sqft: number;
  city: string;
  type: PropertyType;
  images: { url: string }[];
}

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) {}

  async getHomes(params?: queryDto): Promise<homeResponseDto[]> {
    let where = {};
    if (params) {
      const { minPrice, maxPrice, ...rest } = params;

      const price =
        params.minPrice || params.maxPrice
          ? {
              ...(minPrice && { gte: parseFloat(params.minPrice) }),
              ...(maxPrice && { lte: parseFloat(params.maxPrice) }),
            }
          : undefined;

      where = {
        ...rest,
        price: price,
      };
    }

    const homes = await this.prismaService.home.findMany({
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        type: true,
        bedrooms: true,
        bathrooms: true,
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
      where,
    });

    if (!homes.length) throw new HttpException('No homes found', 404);

    return homes.map((home) => {
      const fetchedHome = { ...home, image: home.images[0].url };
      delete fetchedHome.images;
      return new homeResponseDto(fetchedHome);
    });
  }

  async getHomeById(id: number): Promise<homeResponseDto> {

    if(!id) throw new HttpException('No home found', 404)
    
    let home = this.prismaService.home.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        type: true,
        bedrooms: true,
        bathrooms: true,
        realtorIds: true,
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
    });

    return home.then((home) => {
      if (!home) throw new HttpException('No home found', 404);

      const fetchedHome = { ...home, image: home.images[0].url };
      delete fetchedHome.images;
      return new homeResponseDto(fetchedHome);
    });
  }

  async createHome(body: createHomeParams, userId: number) {
    const home = await this.prismaService.home.create({
      data: {
        ...body,
        realtor: {
          connect: {
            id: userId,
          },
        },
        images: {
          create: body.images,
        },
      },
    });

    const homeImages = body.images.map((image) => {
      return this.prismaService.image.create({
        data: {
          url: image.url,
          homeId: home.id,
        },
      });
    });

    return Promise.all(homeImages).then(() => {
      return { ...home, images: body.images };
    });
  }

  async updateHome(body: updateHomeDto, id: number, userId: number) {
    let home = {};

    try {
      home = await this.prismaService.home.update({
        where: {
          id: id,
          realtorIds: userId ? userId : undefined,
        },
        data: {
          ...body,
        },
      });
    } catch (error) {
      throw new HttpException('Something Went Wrong', 404);
    }
    return home;
  }

  async deleteHome(id: number, userId: number) {
    try {
      await this.prismaService.home.delete({
        where: {
          id: id,
          realtorIds: userId,
        },
      });
    } catch (error) {
      throw new HttpException('No home found', 404);
    }

    return new HttpException('Home deleted successfully', 200);
  }

  async inquire(homeId: number, message: string, userId: number) {
    const realtor = await this.prismaService.home.findUnique({
      where: {
        id: homeId,
      },
      select: {
        realtor: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!realtor) throw new HttpException('No home found', 404);
    console.log(realtor.realtor.id);

    const messageObj = await this.prismaService.message.create({
      data: {
        message: message,
        home: {
          connect: {
            id: homeId,
          },
        },
        sender: {
          connect: {
            id: userId,
          },
        },
        reciever: {
          connect: {
            id: realtor.realtor.id,
          },
        },
      },
    });

    console.log(messageObj);

    return 'Message sent';
  }



  async getInquiries (userId: number, homeId: number) {    
    
    const home = await this.getHomeById(parseInt(homeId['id']));

    if(home.realtorIds !== userId) throw new UnauthorizedException('You are not authorized to view this resource')
    
    const messages = await this.prismaService.message.findMany({
        where: {
            homeId: home['id'],
            recieverId: userId,
        },
        select: {
            message: true,
            sender: {
                select: {
                    name: true,
                    email: true,
                    phone: true,
                }
            }
        }
    })

    return messages;
  }
}

