// Danh sách tài khoản cứng
const MOCK_USERS = [
   {
      id: 1,
      username: 'admin',
      password: '123456',
      fullName: 'Quản trị viên',
      role: 'admin',
      avatar: '/logo.svg'
   },
   {
      id: 2,
      username: 'user',
      password: '123456',
      fullName: 'Người dùng',
      role: 'user',
      avatar: '/logo.svg'
   },
   {
      id: 3,
      username: 'staff',
      password: '123456',
      fullName: 'Nhân viên',
      role: 'staff',
      avatar: '/logo.svg'
   }
];

// Hàm xác thực đăng nhập
export const authenticateUser = (username, password) => {
   // Tìm người dùng theo username
   const user = MOCK_USERS.find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
   );

   // Kiểm tra mật khẩu nếu tìm thấy người dùng
   if (user && user.password === password) {
      // Trả về thông tin người dùng (không bao gồm mật khẩu)
      const { password, ...userInfo } = user;

      // Tạo token JWT giả lập
      const token = `mock-jwt-token-${Date.now()}-${user.id}`;

      return {
         success: true,
         user: userInfo,
         token,
         message: 'Đăng nhập thành công'
      };
   }

   // Trả về lỗi nếu không tìm thấy người dùng hoặc mật khẩu không đúng
   return {
      success: false,
      message: 'Tên đăng nhập hoặc mật khẩu không đúng'
   };
};

// Lưu token đăng nhập
export const saveAuthToken = (token, remember = false) => {
   if (remember) {
      localStorage.setItem('auth_token', token);
   } else {
      sessionStorage.setItem('auth_token', token);
   }
};

// Lấy token đăng nhập
export const getAuthToken = () => {
   return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
};

// Xóa token đăng nhập (đăng xuất)
export const removeAuthToken = () => {
   localStorage.removeItem('auth_token');
   sessionStorage.removeItem('auth_token');
};

// Lưu thông tin người dùng đăng nhập
export const saveUserInfo = (userInfo) => {
   localStorage.setItem('user_info', JSON.stringify(userInfo));
};

// Lấy thông tin người dùng đăng nhập
export const getUserInfo = () => {
   const userInfo = localStorage.getItem('user_info');
   return userInfo ? JSON.parse(userInfo) : null;
}; 