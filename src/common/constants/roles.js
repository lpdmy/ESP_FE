export const ROLE = {
  ADMIN: 0,
  STAFF: 1,
  TEACHER: 2,
  STUDENT: 4,
};

export const ROLE_LABELS = {
  [ROLE.ADMIN]: "Admin",
  [ROLE.STAFF]: "Nhân viên",
  [ROLE.TEACHER]: "Giáo viên",
  [ROLE.STUDENT]: "Học sinh",

};

export const ROLE_COLORS = {
  [ROLE.ADMIN]: "bg-purple-100 text-purple-800",
  [ROLE.STAFF]: "bg-blue-100 text-blue-800",
  [ROLE.TEACHER]: "bg-orange-100 text-orange-800",
  [ROLE.STUDENT]: "bg-green-100 text-green-800",
};
