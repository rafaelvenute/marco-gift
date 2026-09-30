# Per Marco

Una sorpresa interattiva in HTML, CSS e JavaScript vanilla, senza dipendenze.

## Aprire la pagina

Apri `index.html` direttamente nel browser oppure avvia `node preview.cjs` e visita http://127.0.0.1:4173.

Per condividerla online, carica `index.html`, `style.css`, `script.js` e la cartella `assets/` su un hosting statico. `preview.cjs` e questo documento non sono necessari sul sito.

## Attivare il formulario

In `script.js`, sostituisci `INSERIRE_ENDPOINT_FORMSPREE` con il tuo endpoint reale. Finché manca, non vengono inviate e-mail e non appare una falsa conferma. `LEVEL COMPLETE` viene mostrato solo dopo una risposta HTTP positiva. Gli errori di rete permettono di riprovare.

## Asset e animazione

- Mario: nuove pose dal JPEG `mario-poses.jpeg`, mostrate tramite finestre CSS senza ridisegnare il personaggio. Logo Nintendo: immagine originale fornita.
- Musica: `super_mario.mp3`, volume 12%.
- Salto: `maro-jump-sound-effect_1.mp3`.
- Colpo: `super-mario-bros.mp3` (audio fornito, non identificato come HIT dedicato).
- Moneta: `super-mario-coin-sound.mp3`.
- Corsa: alternanza di tre pose ogni 105 ms, con rallentamento finale. Salto: pose con braccio alzato; atterraggio: posa a terra e breve compressione. Blocco, moneta, nuvole e colline sono elementi CSS.
- Pulsanti: pressione elastica e suono della moneta; JUMP usa il suono del salto. Mute silenzia anche i pulsanti.
- Reveal: stella rossa a schermo intero, poi ingresso progressivo del titolo, della carta regalo e del formulario.

La corsa dura 2 secondi e il salto 740 ms. La transizione al regalo comincia 680 ms dopo il colpo. Il salto anticipato viene memorizzato e parte nella zona del blocco. Mario aspetta se nessuno preme JUMP. Non esiste una condizione di fallimento.

## Verifica effettuata

La pagina è stata aperta realmente nel browser a 390 × 844 e su desktop. Verificati START, caricamento/riproduzione dei quattro audio, mute, corsa, salto anticipato e tardivo, barra spaziatrice, blocco, animazione della moneta, reveal, assenza di overflow orizzontale e gestione del formulario senza endpoint. Non è stato effettuato un invio reale: manca l’endpoint Formspree. Il sito è una consegna locale, non pubblicata.
