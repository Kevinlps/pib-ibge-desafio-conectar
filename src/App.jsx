import { useState } from 'react';
import { PibProvider } from './context/PibContext';
import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';
import './App.css';
import Section from './components/Section/Section';

function App() {
  const [currentScreen, setCurrentScreen] = useState('chart');

  const handleScreenChange = (screen) => {
    setCurrentScreen(screen);
  };

  return (
    <PibProvider>
      <div className="App">
        <Header 
          currentScreen={currentScreen} 
          handleScreenChange={handleScreenChange} 
        />   
        <Section currentScreen={currentScreen} />
        <Footer />
      </div>
    </PibProvider>
  );
}

export default App;