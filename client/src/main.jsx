import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('App crash:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: 'sans-serif', textAlign: 'center' }}>
          <h2>Algo deu errado 😕</h2>
          <p style={{ color: '#666' }}>Por favor recarregue a página ou tente novamente.</p>
          <pre style={{ background: '#f5f5f5', padding: 16, textAlign: 'left', overflow: 'auto', borderRadius: 8, fontSize: 12 }}>
            {String(this.state.error)}
          </pre>
          <button onClick={() => window.location.reload()}
            style={{ marginTop: 16, padding: '10px 24px', background: '#6750A4', color: '#fff', border: 'none', borderRadius: 24, cursor: 'pointer', fontSize: 16 }}>
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);

