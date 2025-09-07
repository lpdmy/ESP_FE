export const ROLE = {
  ADMIN: 0,
  TEACHER: 2,
  STUDENT: 4,
};

export const ROLE_LABELS = {
  [ROLE.ADMIN]: "Admin",
  [ROLE.TEACHER]: "Teacher",
  [ROLE.STUDENT]: "Student",
};

export const ROLE_COLORS = {
  [ROLE.ADMIN]: "bg-purple-100 text-purple-800",
  [ROLE.STAFF]: "bg-blue-100 text-blue-800",
  [ROLE.STUDENT]: "bg-green-100 text-green-800",
};
