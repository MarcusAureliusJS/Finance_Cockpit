# Finanz-Cockpit (PWA)

Persönliches Finanz-Dashboard: Einnahmen, Fixkosten, Kredite und Investments mit Live-Kursen.
Installierbar als App auf Android (Pixel), iPhone und Desktop. Keine Domain, kein Backend, keine Kosten.

## Deployment auf GitHub Pages (einmalig, ~10 Minuten)

1. Auf github.com ein neues **öffentliches** Repository anlegen, z. B. `finanz-cockpit` (ohne README/Lizenz initialisieren).
2. Diesen Projektordner entpacken und im Terminal (MacBook) pushen:

   ```bash
   cd finanz-cockpit
   git init
   git add .
   git commit -m "Finanz-Cockpit PWA"
   git branch -M main
   git remote add origin https://github.com/DEIN-USERNAME/finanz-cockpit.git
   git push -u origin main
   ```

3. Im Repo: **Settings → Pages → Source: "GitHub Actions"** auswählen.
4. Der mitgelieferte Workflow (`.github/workflows/deploy.yml`) baut und deployt automatisch bei jedem Push.
   Fortschritt unter dem Tab **Actions** verfolgen (~1–2 Minuten).
5. Die App ist danach erreichbar unter:
   `https://DEIN-USERNAME.github.io/finanz-cockpit/`

## Installation auf dem Pixel

1. Die URL in **Chrome** auf dem Pixel öffnen.
2. Menü (⋮) → **„App installieren"** (bzw. „Zum Startbildschirm hinzufügen").
3. Bestätigen – das Icon landet auf dem Homescreen und die App startet im Vollbild ohne Browser-UI.

## Live-Kurse

- **Krypto**: läuft sofort, kostenlos über CoinGecko (kein Key nötig), Kurse direkt in EUR.
- **Aktien/ETFs**: kostenlosen API-Key auf [finnhub.io](https://finnhub.io) erstellen (E-Mail genügt)
  und in der App unter **⚙ Einstellungen** eintragen. Kurse kommen in USD und werden zum
  EZB-Tageskurs (frankfurter.app) in EUR umgerechnet. US-Ticker (AAPL, MSFT, SPY, QQQ …) sind
  im Free-Tier am zuverlässigsten; europäische Börsenplätze sind dort nur eingeschränkt abgedeckt.

## Daten & Backup

- Alle Daten liegen **ausschliesslich lokal** im Browser-Speicher des Geräts – kein Server, kein Konto.
- **Geräte-Wechsel/Zweitgerät**: In den Einstellungen „Backup exportieren" (JSON-Datei), auf dem
  anderen Gerät „Backup importieren". Kein automatischer Sync (dafür wäre später Supabase der Weg).
- Achtung: Das Löschen der Browserdaten von Chrome löscht auch die App-Daten → regelmässig exportieren.

## Lokal entwickeln

```bash
npm install
npm run dev      # Entwicklungsserver
npm run build    # Produktions-Build nach dist/
```
