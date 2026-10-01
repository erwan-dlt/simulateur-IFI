import type { Simulation } from "../models/types";

const eur = (n: number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n) + " €";

export function Results({ sim }: { sim: Simulation | null }) {
  if (!sim) {
    return <p className="hint">Renseignez une année de début et une année de fin (fin ≥ début) pour le prêt d'acquisition.</p>;
  }
  if (sim.annees.length === 0) {
    return <p className="hint">Le prêt doit durer au moins une année pour produire un calcul.</p>;
  }

  const lignes: [string, number][] = [
    ["Total de l'IFI payé", sim.ifiAvecEmprunt],
    ["Coût de l'emprunt d'acquisition", sim.coutEmpruntAcquisition],
    ["Coût de l'emprunt des travaux", sim.coutEmpruntTravaux],
    ["Total avec emprunt", sim.coutTotal],
    ["Total sans emprunt", sim.ifiSansEmprunt],
    ["Économie réalisée", sim.economie],
  ];

  return (
    <>
      <section className="panneau-haut">
        <h2>Calcul IFI par année</h2>
        <div className="cases">
          {sim.annees.map((a) => (
            <article className="case" key={a.annee}>
              <h3>{a.annee}</h3>
              <dl>
                <dt>Total de l'actif</dt><dd>{eur(a.actif)}</dd>
                <dt>Emprunt avec plafond</dt><dd>{eur(a.empruntAvecPlafond)}</dd>
                <dt>Emprunt sans plafond</dt><dd>{eur(a.empruntSansPlafond)}</dd>
                <dt>Passif déductible</dt><dd>{eur(a.passifDeductible)}</dd>
                <dt>IFI théorique</dt><dd>{eur(a.ifiTheorique)}</dd>
                <dt>Net imposable</dt><dd>{eur(a.netImposable)}</dd>
                <dt className="fort">IFI</dt><dd className="fort">{eur(a.ifi)}</dd>
              </dl>
            </article>
          ))}
        </div>
      </section>
      <section className="panneau-bas">
        <h2>Récapitulatif des calculs</h2>
        <dl className="recap">
          {lignes.map(([label, valeur]) => (
            <div key={label} className={label === "Économie réalisée" ? "total" : undefined}>
              <dt>{label}</dt>
              <dd>{eur(valeur)}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
