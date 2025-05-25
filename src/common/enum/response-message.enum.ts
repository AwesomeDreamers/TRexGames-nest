export enum ResponseMessage {
  SIGNUP_SUCCESS = '회원가입이 완료되었습니다!',
  RESET_PASSWORD_SUCCESS = '비밀번호가 변경되었습니다!',
  LOGIN_SUCCESS = 'T-RexGames에 오신 것을 환영합니다!',
  SEND_EMAIL_SUCCESS = '이메일을 성공적으로 보냈습니다. 링크를 통해 진행해주세요.',

  // 카트 관련
  UPDATE_CART_SUCCESS = '장바구니의 내용이 수정되었습니다.',
  DELETE_CART_SUCCESS = '장바구니에서 상품이 삭제되었습니다.',

  // 쿠폰 관련
  CREATE_COUPON_SUCCESS = '쿠폰이 성공적으로 등록되었습니다.',
  DELETE_COUPON_SUCCESS = '쿠폰이 성공적으로 삭제되었습니다.',

  // 상품 관련
  CREATE_PRODUCT_SUCCESS = '상품이 성공적으로 등록되었습니다.',
  UPDATE_PRODUCT_SUCCESS = '상품이 성공적으로 수정되었습니다.',
  DELETE_PRODUCT_SUCCESS = '상품이 성공적으로 삭제되었습니다.',

  // 주문 관련
  CREATE_ORDER_SUCCESS = '주문이 성공적으로 완료되었습니다.',

  // 결제 관련
  CREATE_PAYMENT_SUCCESS = '결제가 성공적으로 완료되었습니다.',

  // 배너 관련
  CREATE_BANNER_SUCCESS = '배너가 성공적으로 등록되었습니다.',
  DELETE_BANNER_SUCCESS = '배너가 성공적으로 삭제되었습니다.',

  // 리뷰 관련
  CREATE_REVIEW_SUCCESS = '리뷰가 성공적으로 등록되었습니다.',
  UPDATE_REVIEW_SUCCESS = '리뷰가 성공적으로 수정되었습니다.',
  DELETE_REVIEW_SUCCESS = '리뷰가 성공적으로 삭제되었습니다.',
}
