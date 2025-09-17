import { useState } from 'react';
import { PibProvider } from './context/PibContext';
import PibChart from './components/PibChart/PibChart';
import PibTable from './components/PibTable/PibTable';
import Footer from './components/Footer/Footer';
import Header from './components/Header/Header'; // Corrigido o nome da importação para Header
import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('chart');

  const handleScreenChange = (screen) => {
    setCurrentScreen(screen);
  };

  return (
    <PibProvider>
      <div className="App">
        {/* Passe as props aqui */}
        <Header 
          currentScreen={currentScreen} 
          handleScreenChange={handleScreenChange} 
        />
        
        <main className="app-main">
          <div className="screen-container">
            {currentScreen === 'chart' && (
              <section className="screen-content">
                <PibChart />
              </section>
            )}

            {currentScreen === 'table' && (
              <section className="screen-content">
                <PibTable />
              </section>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </PibProvider>
  );
}

export default App;