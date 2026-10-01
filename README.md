# Simulateur IFI

React + TypeScript + Vite. Calculs 100 % locaux ; les dossiers clients sont des fichiers `.json`.

    npm install
    npm run dev      # développement
    npm test         # tests du moteur de calcul
    npm run build    # version statique dans dist/

- `src/calculation/` : moteur de calcul (aucune dépendance à React)
- `src/tax/rules.ts` : barème et plafonds par année fiscale
- `src/storage/dossier.ts` : enregistrement / ouverture des dossiers JSON
- `src/ui/` : interface

Pour livrer un .exe : ajouter Tauri (`npm i -D @tauri-apps/cli && npx tauri init`).
