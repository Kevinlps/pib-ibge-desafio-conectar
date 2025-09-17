import './footer.css';

const Footer = () => {
  return (
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
  )
}
export default Footer;
