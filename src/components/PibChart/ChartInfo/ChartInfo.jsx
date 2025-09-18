import "./ChartInfo.css";

const ChartInfo = () => {
  return (
    <div className="chart-info">
        <div className="info-grid">
          <div className="info-card">
            <h3>📈 PIB Total</h3>
            <p>Representa o valor total de todos os bens e serviços produzidos no país durante um ano.</p>
          </div>
          <div className="info-card">
            <h3>👥 PIB per Capita</h3>
            <p>Indica a renda média por habitante, calculada dividindo o PIB total pela população.</p>
          </div>
          <div className="info-card">
            <h3>📊 Fonte dos Dados</h3>
            <p>Instituto Brasileiro de Geografia e Estatística (IBGE) - API de Agregados.</p>
          </div>
        </div>
    </div>
  )
}

export default ChartInfo