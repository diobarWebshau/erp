import GlobalLoading from "./components/load/globalLoading/GlobalLoading.tsx"
import ThemeProvider from './components/load/theme/ThemeProvider.tsx'
import { PersistGate } from 'redux-persist/integration/react';
import { Store, persistorStore } from './store/store.ts'
import { Notifications } from '@mantine/notifications'
import { BrowserRouter } from 'react-router-dom'
import { MantineProvider } from '@mantine/core';
import '@mantine/notifications/styles.css';
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import '@mantine/core/styles.css';
import App from './app/App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <Provider store={Store}>
    <PersistGate persistor={persistorStore} loading={<GlobalLoading />}>
      <BrowserRouter>
        <ThemeProvider>
          <MantineProvider theme={{ fontFamily: "Nunito, sans-serif", }}>
            <Notifications zIndex={100000000000} />
            <App />
          </MantineProvider>
        </ThemeProvider>
      </BrowserRouter>
    </PersistGate>
  </Provider>
  // </StrictMode>,
);