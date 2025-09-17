import { useState } from 'react';
import { PibProvider } from './context/PibContext';
import PibChart from './components/PibChart';
import PibTable from './components/PibTable';
import './App.css';


function App() {
  const [currentScreen, setCurrentScreen] = useState('chart');

  const handleScreenChange = (screen) => {
    setCurrentScreen(screen);
  };

  return (
    <PibProvider>
      <div className="App">
        <header className="app-header">
          <div className="header-content">
            <h1>PIB Brasil - IBGE</h1>
            <p>Análise da evolução do Produto Interno Bruto brasileiro</p>
          </div>
          
          <nav className="screen-navigation">
            <button 
              className={`nav-button ${currentScreen === 'chart' ? 'active' : ''}`}
              onClick={() => handleScreenChange('chart')}
              aria-label="Visualizar gráfico do PIB"
            >
              <span className="nav-icon">📊</span>
              <span className="nav-text">Gráfico de Evolução</span>
            </button>
            <button 
              className={`nav-button ${currentScreen === 'table' ? 'active' : ''}`}
              onClick={() => handleScreenChange('table')}
              aria-label="Visualizar tabela do PIB"
            >
              <span className="nav-icon">📋</span>
              <span className="nav-text">Tabela por Ano</span>
            </button>
          </nav>
        </header>

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

        <footer className="app-footer">
          <div className="footer-content">
            <p>
              <strong>Fonte:</strong> Instituto Brasileiro de Geografia e Estatística (IBGE) - 
              API de Agregados v3
            </p>
            <p className="footer-note">
              Dados do PIB convertidos para dólares americanos (US$)
            </p>
          </div>
        </footer>
      </div>
    </PibProvider>
  );
}

export default App;