# Cargoful Tech Interview - Mobile Catalog App

Questa applicazione mobile è stata sviluppata con **React Native**, **Expo (SDK 57)** e **TypeScript**.

---

## Sezione 1: Lo Stack Tecnologico

- **Expo Router (v3):** Gestisce la navigazione in modo nativo e basato su file (`_layout`, `home`, `login`, `product/[id]`).
- **TanStack React Query (v5):** È il motore per lo stato asincrono (server state). Gestisce in autonomia caching, stati di caricamento/errore, paginazione infinita e mutazioni, riducendo la logica nei componenti.
- **Expo Secure Store:** Soluzione crittografica (iOS Keychain e Android KeyStore) preferita ad `AsyncStorage` per proteggere i dati sensibili.
- **React Native Safe Area Context:** Per garantire la corretta visualizzazione della UI su diversi schermi.

---

## Sezione 2: Architettura e Flusso Logico

### Fase 1: Inizializzazione Sicura e Stato Globale (`src/`)

- **Storage Isolato (`services/secureStore.ts`):** Tutta la logica di lettura e scrittura dei token JWT è separata dalla UI per favorire la testabilità.
- **Centralizzazione dell'Autenticazione (`context/AuthContext.tsx`):** All'avvio, l'applicazione interroga in background lo storage sicuro.

### Fase 2: Il Controllo degli Accessi (`app/_layout.tsx`)

Una volta determinato lo stato dell'utente, entra in gioco il middleware di navigazione (Auth Guard) nel Root Layout tramite un `useEffect` reattivo:

- **Utente Non Autenticato:** Se tenta di accedere a una risorsa protetta, viene reindirizzato in modo forzato a `/login`. L'uso di `router.replace` cancella la cronologia precedente, impedendo il ritorno abusivo tramite il tasto "Back" del telefono.
- **Utente Autenticato:** Se prova a navigare manualmente verso `/login`, viene automaticamente riportato e bloccato nell'area protetta (`/home`).

### Fase 3: Il Catalogo Prodotti e l'Ottimizzazione Mobile (`app/home/index.tsx`)

Superato il login, l'utente approda sulla schermata principale. Qui la logica di lista standard e quella di ricerca sono state unificate in un unico flusso guidato da `useInfiniteQuery`:

- **Il filtro di Debounce (500ms):** L'input di ricerca aspetta mezzo secondo prima di aggiornare la `queryKey`. Questo serve a non eseguire richieste HTTP ad ogni keystroke.
- **Paginazione ad Offset e Griglia:** I dati vengono scaricati a blocchi di 20 (`limit`/`skip`). Uso `.flatMap()` per linearizzare la struttura a pagine di React Query in un array piatto compatibile con una `FlatList` disposta su due colonne (`numColumns={2}`).
- **Fluidità di Scorrimento:** Il caricamento della pagina successiva viene triggerato in background tramite `onEndReached` (soglia `0.5`). È supportato anche lo swipe-to-refresh dall'alto.

### Fase 4: Dettaglio del prodotto e Azione Transazionale (`app/product/[id].tsx`)

Al tap su un prodotto, l'utente naviga sulla rotta dinamica:

- **Estrazione Parametri:** Tramite `useLocalSearchParams` l'ID del prodotto viene recuperato dall'URL in modo tipato per effettuare la fetch di dettaglio.
- **La Mutazione d'Acquisto (`useMutation`):** L'azione del tasto "Buy" simula l'invio di un payload JSON richiesto verso un URL di `webhook.site`.
- **UX Cautelativa:** Durante la mutazione il pulsante si disabilita mostrando uno spinner locale. Questo impedisce il "double-tap" accidentale da parte dell'utente in condizioni di scarsa connettività. Al termine dell'operazione, il successo o l'errore vengono notificati tramite alert nativi.

---

## Sezione 3: UI/UX e Design System

- **Supporto Dark Mode Nativo:** Sfruttando l'hook `useColorScheme()`, l'applicazione adatta dinamicamente la propria palette di colori e lo stile della `StatusBar` in base alle preferenze di sistema del dispositivo.
- **Resilienza agli Errori:** Ogni stato asincrono (caricamento iniziale, lista vuota o fallimento di rete) è gestito tramite UI dedicate. In caso di errore di connessione, l'utente dispone di un pulsante di _Retry_ che invoca il `refetch()` della query senza dover riavviare l'applicazione.

---

## Come Eseguire il Progetto

### Installazione delle Dipendenze

Installa le dipendenze richieste utilizzando npm ed Expo CLI:

```bash
npm install
```

### Avvio su iOS (Simulatore)

```bash
npm run ios
```

### Avvio su Android (Emulatore)

```bash
npm run android
```

---

## Credenziali Demo per il Test

- **Username**: `emilys`
- **Password**: `emilyspass`
