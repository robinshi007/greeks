import './App.css'
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PositionBuilderPage from './pages/PositionBuilderPage';
import ErrorPage from './pages/ErrorPage';
import Layout from './pages/Layout';



const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path='position_builder' element={<PositionBuilderPage />} />
        <Route path='*' element={<ErrorPage />} />
      </Route>
    </Routes>
  );
};
export default App;
