import { useState } from 'react';

// App de test simple
const App = () => {
  const [count, setCount] = useState(0);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f0f0',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333', fontSize: '3rem' }}>Test App</h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Count: {count}</p>
      <button
        onClick={() => setCount(count + 1)}
        style={{
          padding: '1rem 2rem',
          fontSize: '1.2rem',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Increment
      </button>
      <p style={{ marginTop: '2rem', color: '#666' }}>
        Si vous voyez ceci, React fonctionne correctement
      </p>
    </div>
  );
};

export default App;
