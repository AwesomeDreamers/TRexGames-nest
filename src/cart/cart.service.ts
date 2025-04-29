import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCarttDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCartDto, id: string) {
    const { productId, quantity } = dto;
    const userId = Number(id);

    if (!userId) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }

    const cart = await this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    const cartItem = await this.prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        price: true,
        discount: true,
        images: {
          select: {
            url: true,
          },
        },
      },
    });

    return {
      status: 201,
      message: '장바구니에 담겼습니다.',
      payload: {
        id: cartItem.id,
        productId: cartItem.productId,
        name: product.name,
        price: product.price,
        discount: product.discount,
        quantity: cartItem.quantity,
        image: product.images[0].url,
      },
    };
  }

  async findAll(id: string) {
    const userId = Number(id);
    if (!userId) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: true,
      },
    });
    if (!cart) {
      return {
        status: 200,
        message: null,
        payload: [],
      };
    }
    const cartItems = await Promise.all(
      cart.items.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            price: true,
            discount: true,
            images: {
              select: {
                url: true,
              },
            },
          },
        });
        return {
          id: item.id,
          productId: item.productId,
          name: product.name,
          price: product.price,
          discount: product.discount,
          quantity: item.quantity,
          image: product.images[0].url,
        };
      }),
    );

    return {
      status: 200,
      message: null,
      payload: cartItems,
    };
  }

  async update(dto: UpdateCarttDto, id: string) {
    const { productId, quantity } = dto;
    const userId = Number(id);

    if (!userId) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }

    if (quantity == null || quantity < 1) {
      throw new Error('유효하지 않은 수량입니다.');
    }

    // 1. cartId 조회
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!cart) {
      throw new Error('장바구니가 존재하지 않습니다.');
    }

    // 2. cartItem 존재 여부 확인
    const cartItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId,
        },
      },
    });

    if (!cartItem) {
      throw new Error('해당 상품이 장바구니에 없습니다.');
    }

    // 3. cartItem 업데이트
    const updatedCartItem = await this.prisma.cartItem.update({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId,
        },
      },
      data: {
        quantity: quantity, // 유효한 값만 전달
      },
    });

    return {
      status: 200,
      message: '장바구니가 업데이트되었습니다.',
      payload: updatedCartItem,
    };
  }

  async delete(dto: UpdateCarttDto, id: string) {
    const { productId } = dto;
    const userId = Number(id);

    if (!userId) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }

    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!cart) {
      throw new NotFoundException('장바구니가 존재하지 않습니다.');
    }

    const cartItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId,
        },
      },
    });

    if (!cartItem) {
      throw new BadRequestException('해당 상품이 장바구니에 없습니다.');
    }

    const deletedCartItem = await this.prisma.cartItem.delete({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId,
        },
      },
    });

    return {
      status: 200,
      message: '장바구니에서 삭제되었습니다.',
      payload: deletedCartItem,
    };
  }
}
