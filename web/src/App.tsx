import React from 'react';
import Scene from './components/Scene';
// import VirtualEnvironment from './components/VirtualEnvironment';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <Scene />
      {/* <VirtualEnvironment /> */}
    </div>
  );
}

export default App;