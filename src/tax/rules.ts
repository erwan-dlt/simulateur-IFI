/** Paramètres fiscaux d'une année. Pour une nouvelle règle : ajouter une entrée dans REGLES. */
export interface Rules {
  abattementResidencePrincipale: number; // 0.3 = 30 %
  seuilImposition: number;
  tranches: { seuil: number; taux: number }[]; // seuil = borne haute de la tranche
  decote: { plafondBase: number; forfait: number; taux: number };
  plafonnementPassif: { seuilActif: number; ratio: number; tauxExcedent: number };
}

const bareme2018: Rules = {
  abattementResidencePrincipale: 0.3,
  seuilImposition: 1_300_000,
  tranches: [
    { seuil: 800_000, taux: 0 },
    { seuil: 1_300_000, taux: 0.005 },
    { seuil: 2_570_000, taux: 0.007 },
    { seuil: 5_000_000, taux: 0.01 },
    { seuil: 10_000_000, taux: 0.0125 },
    { seuil: Infinity, taux: 0.015 },
  ],
  decote: { plafondBase: 1_400_000, forfait: 17_500, taux: 0.0125 },
  plafonnementPassif: { seuilActif: 5_000_000, ratio: 0.6, tauxExcedent: 0.5 },
};

/** Clé = première année d'application. */
export const REGLES: Record<number, Rules> = {
  2018: bareme2018,
};

/** Renvoie les règles en vigueur pour l'année demandée (la dernière connue ≤ année). */
export function getRules(annee: number): Rules {
  const annees = Object.keys(REGLES).map(Number).sort((a, b) => a - b);
  const retenue = [...annees].reverse().find((a) => a <= annee) ?? annees[0];
  return REGLES[retenue];
}
