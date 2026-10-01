/** Un prêt (acquisition ou travaux). Les taux sont exprimés en %. */
export interface Loan {
  montant: number;
  taeg: number;
  anneeDebut: number;
  anneeFin: number;
  /** true = passif soumis au plafonnement (art. 974 CGI) */
  plafonne: boolean;
}

/** Tout ce qui est saisi pour un client : c'est ce qui est sauvegardé en JSON. */
export interface Dossier {
  residencePrincipale: number;
  autresBiens: number;
  augmentationAnnuelle: number; // %
  taxeFonciere: number;
  pretAcquisition: Loan;
  pretTravaux: Loan;
}

export interface YearResult {
  annee: number;
  actif: number;
  empruntAvecPlafond: number;
  empruntSansPlafond: number;
  passifDeductible: number;
  ifiTheorique: number;
  netImposable: number;
  ifi: number;
}

export interface Simulation {
  annees: YearResult[];
  ifiAvecEmprunt: number;
  ifiSansEmprunt: number;
  coutEmpruntAcquisition: number;
  coutEmpruntTravaux: number;
  coutTotal: number;
  economie: number;
}
