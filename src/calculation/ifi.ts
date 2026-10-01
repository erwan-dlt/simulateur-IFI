import type { Dossier, Simulation, YearResult } from "../models/types";
import { getRules, type Rules } from "../tax/rules";

/** Barème progressif + décote. Pas de dépendance à l'interface. */
export function calculerIFI(base: number, r: Rules): number {
  if (base <= r.seuilImposition) return 0;

  let ifi = 0;
  let precedent = 0;
  for (const { seuil, taux } of r.tranches) {
    if (base > precedent) ifi += (Math.min(base, seuil) - precedent) * taux;
    precedent = seuil;
  }
  if (base < r.decote.plafondBase) ifi -= r.decote.forfait - r.decote.taux * base;
  return Math.round(ifi);
}

/** IFI après déduction de l'IFI théorique de la base (logique de l'ancien script). */
const ifiNet = (base: number, r: Rules) => calculerIFI(base - calculerIFI(base, r), r);

/** Renvoie null tant que les années du prêt d'acquisition ne sont pas cohérentes. */
export function simuler(d: Dossier): Simulation | null {
  const acq = d.pretAcquisition;
  const trav = d.pretTravaux;
  if (!acq.anneeDebut || !acq.anneeFin || acq.anneeFin < acq.anneeDebut) return null;

  const duree = acq.anneeFin - acq.anneeDebut;
  const amortissementAnnuel = duree > 0 ? acq.montant / duree : 0;
  const croissance = d.augmentationAnnuelle / 100;

  const regles0 = getRules(acq.anneeDebut + 1);
  let actif = d.residencePrincipale * (1 - regles0.abattementResidencePrincipale) + d.autresBiens;
  let restantAcq = acq.montant;

  const annees: YearResult[] = [];
  let ifiAvecEmprunt = 0;
  let ifiSansEmprunt = 0;

  for (let annee = acq.anneeDebut + 1; annee <= acq.anneeFin; annee++) {
    const r = getRules(annee);
    let avecPlafond = 0;
    let sansPlafond = d.taxeFonciere;

    if (acq.plafonne) avecPlafond += restantAcq;
    else sansPlafond += restantAcq;

    if (annee > trav.anneeDebut && annee <= trav.anneeFin) {
      if (trav.plafonne) avecPlafond += trav.montant;
      else sansPlafond += trav.montant;
    }

    // Plafonnement des dettes : au-delà de 60 % de l'actif, l'excédent n'est déductible qu'à 50 %
    const p = r.plafonnementPassif;
    const limite = actif * p.ratio;
    if (actif >= p.seuilActif && avecPlafond > limite) {
      avecPlafond = limite + (avecPlafond - limite) * p.tauxExcedent;
    }

    const passif = avecPlafond + sansPlafond;
    const base = actif - passif;
    const ifiTheorique = calculerIFI(base, r);
    const ifi = calculerIFI(base - ifiTheorique, r);

    annees.push({
      annee,
      actif,
      empruntAvecPlafond: avecPlafond,
      empruntSansPlafond: sansPlafond,
      passifDeductible: passif,
      ifiTheorique,
      netImposable: base - ifiTheorique,
      ifi,
    });

    ifiAvecEmprunt += ifi;
    ifiSansEmprunt += ifiNet(actif - d.taxeFonciere, r);

    restantAcq -= amortissementAnnuel;
    actif *= 1 + croissance;
  }

  const coutEmpruntAcquisition = acq.montant * (acq.taeg / 100) * duree;
  const coutEmpruntTravaux = trav.montant * (trav.taeg / 100) * (trav.anneeFin - trav.anneeDebut);
  const coutTotal = ifiAvecEmprunt + coutEmpruntAcquisition + coutEmpruntTravaux;

  return {
    annees,
    ifiAvecEmprunt,
    ifiSansEmprunt,
    coutEmpruntAcquisition,
    coutEmpruntTravaux,
    coutTotal,
    economie: ifiSansEmprunt - coutTotal,
  };
}
