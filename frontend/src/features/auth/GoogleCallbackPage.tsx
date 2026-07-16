import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { credentialsReceived, userLoaded } from './authSlice';
import { authApi } from '../../api/authApi';

/**
 * The backend redirects here as `/auth/callback#token=...` after a
 * successful Google OAuth exchange (see GoogleAuthController::callback).
 * We only receive the token via the URL fragment, so we store it first
 * (making it available to the authenticated API client), then fetch
 * `/me` to populate the full user profile.
 */
export function GoogleCallbackPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace('#', ''));
    const token = params.get('token');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    // Store the token first with a placeholder user so the API client's
    // auth header is set before we call /me.
    dispatch(credentialsReceived({ token, user: { id: '', name: '', email: '', role: 'visitor' } }));

    (async () => {
      try {
        const user = await dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true })).unwrap();
        dispatch(userLoaded(user));
      } finally {
        navigate('/explorer', { replace: true });
      }
    })();
  }, [dispatch, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-slate-500">Signing you in…</p>
    </div>
  );
}
