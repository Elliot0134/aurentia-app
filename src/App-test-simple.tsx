// Test ultra simple pour identifier le problème
const App = () => {
  console.log("🔥 App-test-simple rendered");
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'system-ui, sans-serif',
      fontSize: '24px',
      fontWeight: 'bold'
    }}>
      ✅ React fonctionne !
    </div>
  );
};

export default App;
