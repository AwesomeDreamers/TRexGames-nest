import { HttpStatus } from '@nestjs/common';

export enum ErrorCode {
  // 인증 관련 에러
  UNAUTHORIZED = 'AUTH_001',
  INVALID_TOKEN = 'AUTH_002',
  INCORRECT_EMAIL_OR_PASSWORD = 'AUTH_003',
  REQUIRED_LOGIN = 'AUTH_004',

  // 사용자 관련 에러
  USER_NOT_FOUND = 'USER_001',
  DUPLICATE_EMAIL = 'USER_002',
  NOT_FOUND_EMAIL = 'USER_003',
  SAME_ORIGINAL_PASSWORD = 'USER_004',
  NOT_ALLOWED_SOCIAL_USER = 'USER_005',

  // 상품 관련 에러
  PRODUCT_NOT_FOUND = 'PRODUCT_001',

  // 카트 관련 에러
  CART_NOT_FOUND = 'CART_001',
  CART_ITEM_NOT_FOUND = 'CART_002',

  // 쿠폰 관련 에러
  COUPON_NOT_FOUND = 'COUPON_001',

  // 배너 관련 에러
  BANNER_FILES_MOVE_ERROR = 'BANNER_001',
  BANNER_NOT_FOUND = 'BANNER_002',

  // 주문 관련 에러
  ORDER_NOT_FOUND = 'ORDER_001',

  // 이미지 관련 에러
  IMAGE_NOT_FOUND = 'IMAGE_001',
  IMAGE_FILES_MOVE_ERROR = 'IMAGE_002',

  // 기타 일반 에러
  INTERNAL_SERVER_ERROR = 'SERVER_001',
  BAD_REQUEST = 'COMMON_001',
  FORBIDDEN = 'COMMON_002',
}

export const ErrorCodeMap: Record<
  ErrorCode,
  { status: HttpStatus; message: string }
> = {
  // 인증 관련
  [ErrorCode.UNAUTHORIZED]: {
    status: HttpStatus.UNAUTHORIZED,
    message: '인증 정보가 유효하지 않습니다.',
  },
  [ErrorCode.INVALID_TOKEN]: {
    status: HttpStatus.UNAUTHORIZED,
    message: '유효하지 않거나 만료된 토큰입니다.',
  },
  [ErrorCode.INCORRECT_EMAIL_OR_PASSWORD]: {
    status: HttpStatus.UNAUTHORIZED,
    message: '이메일 또는 비밀번호가 올바르지 않습니다.',
  },
  [ErrorCode.REQUIRED_LOGIN]: {
    status: HttpStatus.UNAUTHORIZED,
    message: '로그인이 필요합니다.',
  },
  [ErrorCode.NOT_ALLOWED_SOCIAL_USER]: {
    status: HttpStatus.FORBIDDEN,
    message: '소셜 로그인 사용자는 이용이 불가능합니다.',
  },

  // 사용자 관련
  [ErrorCode.USER_NOT_FOUND]: {
    status: HttpStatus.NOT_FOUND,
    message: '요청하신 사용자를 찾을 수 없습니다.',
  },
  [ErrorCode.DUPLICATE_EMAIL]: {
    status: HttpStatus.CONFLICT,
    message: '이미 사용 중인 이메일입니다.',
  },
  [ErrorCode.NOT_FOUND_EMAIL]: {
    status: HttpStatus.CONFLICT,
    message: '이미 사용 중인 이메일입니다.',
  },
  [ErrorCode.SAME_ORIGINAL_PASSWORD]: {
    status: HttpStatus.CONFLICT,
    message: '기존 비밀번호와 동일합니다.',
  },

  // 상품 관련
  [ErrorCode.PRODUCT_NOT_FOUND]: {
    status: HttpStatus.NOT_FOUND,
    message: '요청하신 상품을 찾을 수 없습니다.',
  },

  // 카트 관련
  [ErrorCode.CART_NOT_FOUND]: {
    status: HttpStatus.NOT_FOUND,
    message: '장바구니를 찾을 수 없습니다.',
  },
  [ErrorCode.CART_ITEM_NOT_FOUND]: {
    status: HttpStatus.NOT_FOUND,
    message: '장바구니 아이템을 찾을 수 없습니다.',
  },

  // 쿠폰 관련
  [ErrorCode.COUPON_NOT_FOUND]: {
    status: HttpStatus.NOT_FOUND,
    message: '요청하신 쿠폰을 찾을 수 없습니다.',
  },

  // 이미지 관련
  [ErrorCode.IMAGE_NOT_FOUND]: {
    status: HttpStatus.NOT_FOUND,
    message: '이미지를 업로드 해주세요.',
  },
  [ErrorCode.IMAGE_FILES_MOVE_ERROR]: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: '이미지 파일 이동 중 오류가 발생했습니다.',
  },

  // 배너 관련
  [ErrorCode.BANNER_FILES_MOVE_ERROR]: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: '배너 파일 이동 중 오류가 발생했습니다.',
  },
  [ErrorCode.BANNER_NOT_FOUND]: {
    status: HttpStatus.NOT_FOUND,
    message: '요청하신 배너를 찾을 수 없습니다.',
  },

  // 주문 관련
  [ErrorCode.ORDER_NOT_FOUND]: {
    status: HttpStatus.NOT_FOUND,
    message: '주문 내역이 없습니다.',
  },

  // 기타 일반
  [ErrorCode.INTERNAL_SERVER_ERROR]: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: '서버 내부 오류가 발생했습니다.',
  },
  [ErrorCode.BAD_REQUEST]: {
    status: HttpStatus.BAD_REQUEST,
    message: '잘못된 요청입니다.',
  },
  [ErrorCode.FORBIDDEN]: {
    status: HttpStatus.FORBIDDEN,
    message: '잘못된 접근입니다.',
  },
};
