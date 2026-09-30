# Per Marco

Una piccola sorpresa interattiva in HTML, CSS e JavaScript vanilla, senza framework.

- Sito: https://rafaelvenute.github.io/marco-gift/
- Repository: https://github.com/rafaelvenute/marco-gift
- GitHub Pages: branch `main`, cartella `/ (root)`, HTTPS attivo.

## Formulario

Formspree Free, form **Marco Nintendo Gift**. L'indirizzo del destinatario è gestito dal pannello Formspree e non è inserito nel frontend.

Il form invia soltanto:

- `email_nintendo`: l'e-mail inserita da Marco;
- `_source`: `Marco Nintendo Gift`;
- `_subject`: `Nintendo Gift — Email Marco`.

Invio AJAX senza redirect, validazione email, protezione dai doppi invii, stato di caricamento, timeout e possibilità di riprovare. LEVEL COMPLETE appare soltanto dopo una risposta positiva di Formspree.

## QR per il biglietto

- `qr-marco-gift-nintendo.png`: 2200 × 2200 px, cornice rossa, moduli arrotondati e moneta centrale.
- `qr-marco-gift-nintendo.svg`: versione vettoriale.
- `qr-marco-gift-safe.png`: versione semplice di backup.

Tutti puntano esattamente al sito pubblico sopra indicato. Correzione errori H e quiet zone di quattro moduli. Decodificati con successo il PNG originale, l'SVG renderizzato indipendentemente, i ridimensionamenti a 4 cm e 5 cm a 300 dpi e una versione piccola con lieve sfocatura. I test di stampa sono simulazioni digitali, non prove su carta.

Stampare il QR completo di cornice e margini, senza ritagliare la zona bianca, a 4–5 cm per lato.

## Verifiche

Eseguiti un invio reale locale e un invio reale dalla pagina GitHub Pages: entrambe le submission sono presenti su Formspree, con tutti i campi richiesti. Confermata anche la ricezione delle notifiche e-mail. Nessun indirizzo di test è incorporato nel sito.

Verificati su viewport 390 × 844: START, audio, corsa, salto anticipato, blocco, moneta, transizione, formulario e LEVEL COMPLETE. Controllati i nomi dei file case-sensitive, i path relativi e gli errori JavaScript. Il design approvato è preservato.

## Anteprima locale

Aprire `index.html` nel browser oppure eseguire `node preview.cjs` e visitare http://127.0.0.1:4173/. L'invio reale del form usa l'endpoint pubblico Formspree.
