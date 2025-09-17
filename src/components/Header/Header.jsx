import "./Header.css";

// Receba as props aqui, entre chaves {}
const Header = ({ currentScreen, handleScreenChange }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1>PIB Brasil - IBGE</h1>
        <p>Análise da evolução do Produto Interno Bruto brasileiro</p>
      </div>

      <nav className="screen-navigation">
        <button
          // Agora ele usa as props recebidas
          className={`nav-button ${currentScreen === 'chart' ? 'active' : ''}`}
          onClick={() => handleScreenChange('chart')}
          aria-label="Visualizar gráfico do PIB"
        >
          <span className="nav-icon">📊</span>
          <span className="nav-text">Gráfico de Evolução</span>
        </button>
        <button
          // E aqui também
          className={`nav-button ${currentScreen === 'table' ? 'active' : ''}`}
          onClick={() => handleScreenChange('table')}
          aria-label="Visualizar tabela do PIB"
        >
          <span className="nav-icon">📋</span>
          <span className="nav-text">Tabela por Ano</span>
        </button>
      </nav>
    </header>
  );
};

// Corrija a linha de export, removendo a vírgula
export default Header;