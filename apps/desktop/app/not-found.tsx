import Link from 'next/link';
import { FC } from 'react';

const NotFound: FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        gap: '1rem',
      }}
    >
      <h1
        style={{
          fontSize: '2rem',
          fontWeight: 'bold',
        }}
      >
        Page not found
      </h1>
      <Link
        href="/"
        style={{
          color: '#0070f3',
          textDecoration: 'underline',
        }}
      >
        Go back home
      </Link>
    </div>
  );
};

export default NotFound;
