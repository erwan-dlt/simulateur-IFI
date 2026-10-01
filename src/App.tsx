import { useMemo, useRef, useState } from "react";
import type { Dossier } from "./models/types";
import { simuler } from "./calculation/ifi";
import { DOSSIER_VIDE, exporterDossier, importerDossier } from "./storage/dossier";
import { Field, LoanForm } from "./ui/Forms";
import { Results } from "./ui/Results";

export default function App() {
  const [dossier, setDossier] = useState<Dossier>(DOSSIER_VIDE);
  const [erreur, setErreur] = useState("");
  const fichierRef = useRef<HTMLInputElement>(null);
  const sim = useMemo(() => simuler(dossier), [dossier]);

  const maj = <K extends keyof Dossier>(cle: K, valeur: Dossier[K]) =>
    setDossier((d) => ({ ...d, [cle]: valeur }));

  async function ouvrir(f?: File) {
    if (!f) return;
    try {
      setDossier(await importerDossier(f));
      setErreur("");
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Impossible de lire ce fichier.");
    }
    if (fichierRef.current) fichierRef.current.value = "";
  }

  return (
    <div className="container">
      <aside className="panneau-gauche">
        <h1>Simulateur de l'IFI</h1>
        <div className="actions">
          <button onClick={() => exporterDossier(dossier)}>Enregistrer le dossier</button>
          <button onClick={() => fichierRef.current?.click()}>Ouvrir un dossier</button>
          <input ref={fichierRef} type="file" accept=".json,application/json" hidden onChange={(e) => ouvrir(e.target.files?.[0])} />
        </div>
        {erreur && <p className="erreur" role="alert">{erreur}</p>}

        <Field label="Montant de la résidence principale" unit="€" value={dossier.residencePrincipale} onChange={(v) => maj("residencePrincipale", v)} />
        <Field label="Montant des autres biens" unit="€" value={dossier.autresBiens} onChange={(v) => maj("autresBiens", v)} />
        <Field label="Augmentation annuelle des biens" unit="%" value={dossier.augmentationAnnuelle} onChange={(v) => maj("augmentationAnnuelle", v)} />
        <Field label="Estimation de la taxe foncière" unit="€" value={dossier.taxeFonciere} onChange={(v) => maj("taxeFonciere", v)} />

        <LoanForm titre="Prêt d'acquisition" loan={dossier.pretAcquisition} onChange={(l) => maj("pretAcquisition", l)} />
        <LoanForm titre="Prêt pour des travaux" loan={dossier.pretTravaux} onChange={(l) => maj("pretTravaux", l)} />
      </aside>
      <main className="panneau-droit">
        <Results sim={sim} />
      </main>
    </div>
  );
}
