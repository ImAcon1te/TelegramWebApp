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

import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
);
