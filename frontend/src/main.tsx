import ThemeProvider
  from './components/load/theme/ThemeProvider.tsx'
import ReactDOM
  from 'react-dom/client'
import { BrowserRouter }
  from 'react-router-dom'
import { Provider }
  from 'react-redux'
import App
  from './app/App.tsx'
import { Store, persistorStore }
  from './store/store.ts'
import { PersistGate }
  from 'redux-persist/integration/react';
import './index.css'
import { MantineProvider }
  from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { Notifications } from '@mantine/notifications'

ReactDOM.createRoot(
  document.getElementById('root')!)
  .render(
    // <StrictMode>
    <Provider store={Store}>
      <PersistGate persistor={persistorStore}>
        <BrowserRouter>
          <ThemeProvider>
            <MantineProvider
              theme={
                {
                  fontFamily: "Nunito, sans-serif",
                }
              }
            >
              <Notifications zIndex={100000000000} />
              <App />
            </MantineProvider>
          </ThemeProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
    // </StrictMode>,
  );