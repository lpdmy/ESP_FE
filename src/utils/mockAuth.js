// Mock authentication for testing
export const setMockToken = () => {
   // This is a mock JWT token for testing - replace with real token from login
   const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIFVzZXIiLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE1MTYyMzkwMjJ9.invalid_signature";
   localStorage.setItem('token', mockToken);
};

// Remove mock token
export const removeMockToken = () => {
   localStorage.removeItem('token');
};