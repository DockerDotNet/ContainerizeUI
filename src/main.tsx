import BasicLayout from '@/layouts/BasicLayout';
import routes from '@/routes';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import '@ant-design/v5-patch-for-react-19';
import "./index.css";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<BasicLayout />}>
        {routes.map(({ path, component: Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
