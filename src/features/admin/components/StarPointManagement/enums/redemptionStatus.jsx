export const REDEMPTION_STATUS = {
  PENDING: 0,
  RECEIVED: 1,
};

export const REDEMPTION_STATUS_LABELS = {
  [REDEMPTION_STATUS.PENDING]: "Chưa nhận",
  [REDEMPTION_STATUS.RECEIVED]: "Đã nhận",
};

// Mapping từ BE string sang FE number
export const BE_STATUS_TO_FE = {
  "Pending": REDEMPTION_STATUS.PENDING,
  "Received": REDEMPTION_STATUS.RECEIVED,
  "pending": REDEMPTION_STATUS.PENDING,
  "received": REDEMPTION_STATUS.RECEIVED,
  "PickedUp": REDEMPTION_STATUS.RECEIVED,
  "picked_up": REDEMPTION_STATUS.RECEIVED,
};

// Mapping từ FE number sang BE string
export const FE_STATUS_TO_BE = {
  [REDEMPTION_STATUS.PENDING]: "Pending",
  [REDEMPTION_STATUS.RECEIVED]: "Received",
};

// Helper function: Convert status từ BE (string) sang FE (number) hoặc ngược lại
export const convertStatusFromBE = (beStatus) => {
  // Nếu đã là number thì return luôn
  if (typeof beStatus === 'number') {
    return beStatus;
  }
  // Nếu là string thì convert
  if (typeof beStatus === 'string') {
    return BE_STATUS_TO_FE[beStatus] ?? beStatus;
  }
  return beStatus;
};

// Helper function: Convert status từ FE (number) sang BE (string)
export const convertStatusToBE = (feStatus) => {
  // Nếu đã là string thì return luôn
  if (typeof feStatus === 'string') {
    return feStatus;
  }
  // Nếu là number thì convert
  if (typeof feStatus === 'number') {
    return FE_STATUS_TO_BE[feStatus] ?? feStatus;
  }
  return feStatus;
};

// Helper function: Get label từ status (hỗ trợ cả BE string và FE number)
export const getStatusLabel = (status) => {
  const feStatus = convertStatusFromBE(status);
  return REDEMPTION_STATUS_LABELS[feStatus] ?? status;
};

// Helper function: Check if status is pending
export const isPendingStatus = (status) => {
  const feStatus = convertStatusFromBE(status);
  return feStatus === REDEMPTION_STATUS.PENDING;
};

// Helper function: Check if status is received
export const isReceivedStatus = (status) => {
  const feStatus = convertStatusFromBE(status);
  return feStatus === REDEMPTION_STATUS.RECEIVED;
};

