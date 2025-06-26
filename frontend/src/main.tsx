// import { createRoot } from 'react-dom/client';
//
// document.querySelectorAll<HTMLElement>('[data-component]').forEach((el: HTMLElement) => {
//   console.log(el, el.dataset.component)
//
//   const name  = el.dataset.component;
//   const props = JSON.parse(el.dataset.props || '{}');
//   console.log(name, props)// e.g. "Card"
//
//   import(`./widgets/${name}/index.ts`)
//     .then(mod => {
//       const Component = mod.default;
//       createRoot(el).render(<Component {...props} />);
//     })
//     .catch(err => {
//       console.error(`Ошибка загрузки компонента ${name}:`, err);
//     });
// });

console.log('pathname:', window.location.pathname); // должен быть "/"
console.log('search:', window.location);
if (window.location.hash.startsWith('#tgWebAppData=')) {
  sessionStorage.setItem('tgWebAppHash', window.location.hash);

  const savedPath = sessionStorage.getItem('lastValidPath') || '/';
  window.history.replaceState({}, '', savedPath);
}
import ReactDOM from 'react-dom/client';
import {HashRouter} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <HashRouter>
      <App />
    </HashRouter>
  </QueryClientProvider>

);
