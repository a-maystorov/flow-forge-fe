import AuthService from '../services/AuthService';

const TestAuthService = () => {
  const handleLogin = async () => {
    try {
      const token = await AuthService.login('dev.test@gmail.com', 'start123');
      console.log('JWT:', token);
      console.log('Decoded User:', AuthService.getUser());
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    console.log('Logged out');
  };

  return (
    <div>
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default TestAuthService;
