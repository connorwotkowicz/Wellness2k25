'use client';

import { useState, useRef, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import axios from 'axios';

import { AuthContext } from '../../context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_BASE_URL!;

interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    user_role: string;
  };
}


function isAxiosErrorWithMessage(err: unknown): err is { response: { data: { message?: string } } } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'response' in err &&
    typeof (err as any).response === 'object' &&
    'data' in (err as any).response &&
    typeof (err as any).response.data === 'object'
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      const res = await axios.post<LoginResponse>(`${API}/api/auth/login`, {
        email,
        password,
      });

      const data = res.data;

      if (!data.token || !data.user) {
        throw new Error('Invalid login response');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userRole', data.user.user_role);

      login(data.user, data.token);

      if (data.user.user_role === 'admin') {
        toast.success(`Welcome Admin ${data.user.name}`, { autoClose: 2500 });
        router.push('/admin');
      } else {
        toast.success(`Welcome back, ${data.user.name}`, { autoClose: 2500 });
        router.push('/account');
      }

    } catch (err: unknown) {
      console.error('Login error:', err);

      const message =
        isAxiosErrorWithMessage(err) && err.response.data?.message
          ? err.response.data.message
          : err instanceof Error
          ? err.message
          : 'Login failed';

      setError(message);
      toast.error(`Error: ${message}`, { autoClose: 2500 });
    }
  };

  return (
    <div className="login-page">
      <div className="logo-wrapper"></div>

      <div className="login-container">
        <div className="my-discog">
          <h3>Well2k25</h3>
        </div>

        <div className="inner-content">
          <div className="logreg-title">
            <h2>Enter your email to continue</h2>
            {error && <p className="error-message">{error}</p>}
          </div>

          <div className="login-instr">
            <h4>
              Log in to Well2K with your email. If you don't have an account,
              click the link below to create one.
            </h4>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="log-input-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                ref={emailRef}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="book-modal-button">
              Sign in
            </button>
          </form>

          <div className="login-instr">
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #ccc' }} />
            <h4>New here?</h4>
            <div className="sign-up-link">
              <Link href="/register">
                <h4>Sign up</h4>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
