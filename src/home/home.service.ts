import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { homeResponseDto, updateHomeDto } from './dtos/home.dto';
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

  getHomeById(id: number): Promise<homeResponseDto> {
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

  async createHome(body: createHomeParams) {
    const home = await this.prismaService.home.create({
      data: {
        ...body,
        realtor: {
            connect: {
                id: 3,
            }
        },
        images: {
            create: body.images,
        }
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
        return {...home, images: body.images};
        }
    );
  }

  async updateHome(body: updateHomeDto, id: number) {

    let home = {}

    try {
        home = await this.prismaService.home.update({
            where: {
                id: id,
            },
            data: {
                ...body,
            },
        });
    }
    catch (error) {
        throw new HttpException('No home found', 404);
    }
    return home;
    
  }

  async deleteHome(id: number) {

    let home = {}

    try {
        home = await this.prismaService.home.delete({
            where: {
                id: id,
            },
        });
    }
    catch (error) {
        throw new HttpException('No home found', 404);
    }

    return new HttpException('Home deleted successfully', 200);

  }
}
