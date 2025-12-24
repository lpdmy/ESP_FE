export const REWARD_CATEGORY = {
  VOUCHER: 0,
  MERCHANDISE: 1,
  BOOK: 2,
};

export const REWARD_CATEGORY_LABELS = {
  [REWARD_CATEGORY.VOUCHER]: "Voucher",
  [REWARD_CATEGORY.MERCHANDISE]: "Quà tặng",
  [REWARD_CATEGORY.BOOK]: "Sách"
};

// Mapping từ BE string sang FE number
export const BE_CATEGORY_TO_FE = {
  "Voucher": REWARD_CATEGORY.VOUCHER,
  "Merchandise": REWARD_CATEGORY.MERCHANDISE,
  "Book": REWARD_CATEGORY.BOOK,
};

// Mapping từ FE number sang BE string
export const FE_CATEGORY_TO_BE = {
  [REWARD_CATEGORY.VOUCHER]: "Voucher",
  [REWARD_CATEGORY.MERCHANDISE]: "Merchandise",
  [REWARD_CATEGORY.BOOK]: "Book",
};

// Helper function: Convert category từ BE (string) sang FE (number) hoặc ngược lại
export const convertCategoryFromBE = (beCategory) => {
  // Nếu đã là number thì return luôn
  if (typeof beCategory === 'number') {
    return beCategory;
  }
  // Nếu là string thì convert
  if (typeof beCategory === 'string') {
    return BE_CATEGORY_TO_FE[beCategory] ?? beCategory;
  }
  return beCategory;
};

// Helper function: Convert category từ FE (number) sang BE (string)
export const convertCategoryToBE = (feCategory) => {
  // Nếu đã là string thì return luôn
  if (typeof feCategory === 'string') {
    return feCategory;
  }
  // Nếu là number thì convert
  if (typeof feCategory === 'number') {
    return FE_CATEGORY_TO_BE[feCategory] ?? feCategory;
  }
  return feCategory;
};

// Helper function: Get label từ category (hỗ trợ cả BE string và FE number)
export const getCategoryLabel = (category) => {
  const feCategory = convertCategoryFromBE(category);
  return REWARD_CATEGORY_LABELS[feCategory] ?? category;
};