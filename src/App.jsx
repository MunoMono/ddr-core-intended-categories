import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HeaderBar from './components/HeaderBar';
import Crumb from './components/Crumb';
import Home from './pages/Home';
import './styles/index.scss';
import './styles/typography.scss';

function App() {
  return (
    <Router>
      <HeaderBar />
      <main style={{ marginTop: '3rem' }}>
        <Crumb />
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
