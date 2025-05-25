import { Injectable } from '@nestjs/common';
import { ErrorCode } from 'src/common/enum/error-code.enum';
import { ApiException } from 'src/common/error/api.exception';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async createCart(dto: CreateCartDto, userId: string) {
    const { productId } = dto;

    if (!userId) {
      throw new ApiException(ErrorCode.REQUIRED_LOGIN);
    }

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

    if (!product) {
      throw new ApiException(ErrorCode.PRODUCT_NOT_FOUND);
    }

    const cart = await this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    const cartItems = await this.prisma.cartItem.findMany({
      where: {
        cart: {
          userId,
        },
        productId,
      },
    });

    if (cartItems.some((item) => item.productId === productId)) {
      const cartItem = await this.prisma.cartItem.update({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: productId,
          },
        },
        data: {
          quantity: {
            increment: 1,
          },
        },
      });
      return {
        message: '장바구니에 이미 담긴 상품입니다.',
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

    const cartItem = await this.prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId,
        },
      },
      update: {
        quantity: {
          increment: 1,
        },
      },
      create: {
        cartId: cart.id,
        productId,
        quantity: 1,
      },
    });

    return {
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

  async findAll(userId: string) {
    if (!userId) {
      throw new ApiException(ErrorCode.REQUIRED_LOGIN);
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
            platform: true,
            category: true,
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
          platform: product.platform,
          category: product.category,
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

  async count(userId: string) {
    if (!userId) {
      throw new ApiException(ErrorCode.REQUIRED_LOGIN);
    }
    const count = await this.prisma.cartItem.count({
      where: {
        cart: {
          userId,
        },
      },
    });
    return { status: 200, message: null, payload: count };
  }

  async update(dto: UpdateCartDto, userId: string) {
    const { productId, quantity } = dto;

    if (!userId) {
      throw new ApiException(ErrorCode.REQUIRED_LOGIN);
    }

    if (quantity == null || quantity < 1) {
      throw new ApiException(ErrorCode.BAD_REQUEST);
    }

    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!cart) {
      throw new ApiException(ErrorCode.CART_NOT_FOUND);
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
      throw new ApiException(ErrorCode.CART_ITEM_NOT_FOUND);
    }
    const updatedCartItem = await this.prisma.cartItem.update({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId,
        },
      },
      data: {
        quantity: quantity,
      },
    });

    return updatedCartItem;
  }

  async delete(dto: UpdateCartDto, userId: string) {
    const { productId } = dto;

    if (!userId) {
      throw new ApiException(ErrorCode.REQUIRED_LOGIN);
    }

    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!cart) {
      throw new ApiException(ErrorCode.CART_NOT_FOUND);
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
      throw new ApiException(ErrorCode.CART_ITEM_NOT_FOUND);
    }

    const deletedCartItem = await this.prisma.cartItem.delete({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId,
        },
      },
    });

    return deletedCartItem;
  }
}
