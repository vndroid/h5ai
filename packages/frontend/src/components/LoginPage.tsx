import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiLogin } from '../api/client';
import { useStore } from '../store';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setSetup = useStore((s) => s.setSetup);
  const setup = useStore((s) => s.setup);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const resp = await apiLogin(password);
      if (resp.isAdmin) {
        if (setup) setSetup({ ...setup, isAdmin: true });
        navigate('/');
      } else {
        setError('Invalid password');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>h5ai</h1>
        <p className={styles.subtitle}>Enter password to continue</p>
        <input
          className={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          autoComplete="current-password"
        />
        {error && <div className={styles.error}>{error}</div>}
        <button className={styles.btn} type="submit" disabled={loading}>
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>
    </div>
  );
}
