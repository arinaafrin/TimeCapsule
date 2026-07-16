import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  credentialsReceived,
  loggedOut,
  selectCurrentUser,
  selectIsAuthenticated,
  selectUserRole,
} from '../features/auth/authSlice';
import {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  type LoginPayload,
  type RegisterPayload,
} from '../api/authApi';

export function useAuth() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const role = useAppSelector(selectUserRole);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [loginMutation, loginState] = useLoginMutation();
  const [registerMutation, registerState] = useRegisterMutation();
  const [logoutMutation] = useLogoutMutation();

  const login = async (payload: LoginPayload) => {
    const result = await loginMutation(payload).unwrap();
    dispatch(credentialsReceived(result));
    return result;
  };

  const register = async (payload: RegisterPayload) => {
    const result = await registerMutation(payload).unwrap();
    dispatch(credentialsReceived(result));
    return result;
  };

  const logout = async () => {
    try {
      await logoutMutation().unwrap();
    } finally {
      dispatch(loggedOut());
    }
  };

  return {
    user,
    role,
    isAuthenticated,
    login,
    register,
    logout,
    isLoggingIn: loginState.isLoading,
    isRegistering: registerState.isLoading,
    loginError: loginState.error,
    registerError: registerState.error,
  };
}
