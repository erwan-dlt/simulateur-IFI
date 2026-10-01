import type { Dossier, Loan } from "../models/types";

const PRET_VIDE: Loan = { montant: 0, taeg: 0, anneeDebut: 2026, anneeFin: 2036, plafonne: false };

export const DOSSIER_VIDE: Dossier = {
  residencePrincipale: 0,
  autresBiens: 0,
  augmentationAnnuelle: 0,
  taxeFonciere: 0,
  pretAcquisition: PRET_VIDE,
  pretTravaux: { ...PRET_VIDE, anneeFin: 2030 },
};

const VERSION = 1;

/** Télécharge le dossier client en fichier .json. */
export function exporterDossier(d: Dossier, nom = "dossier-ifi") {
  const blob = new Blob([JSON.stringify({ version: VERSION, dossier: d }, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${nom}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

const num = (v: unknown, defaut: number) => (Number.isFinite(Number(v)) ? Number(v) : defaut);

function lirePret(v: Partial<Loan> | undefined, defaut: Loan): Loan {
  return {
    montant: num(v?.montant, defaut.montant),
    taeg: num(v?.taeg, defaut.taeg),
    anneeDebut: num(v?.anneeDebut, defaut.anneeDebut),
    anneeFin: num(v?.anneeFin, defaut.anneeFin),
    plafonne: Boolean(v?.plafonne ?? defaut.plafonne),
  };
}

/** Lit un fichier .json exporté par l'application. Lève une erreur si le fichier est invalide. */
export async function importerDossier(fichier: File): Promise<Dossier> {
  const brut = JSON.parse(await fichier.text());
  const d = brut?.dossier;
  if (!d || typeof d !== "object") throw new Error("Fichier de dossier invalide.");
  return {
    residencePrincipale: num(d.residencePrincipale, 0),
    autresBiens: num(d.autresBiens, 0),
    augmentationAnnuelle: num(d.augmentationAnnuelle, 0),
    taxeFonciere: num(d.taxeFonciere, 0),
    pretAcquisition: lirePret(d.pretAcquisition, DOSSIER_VIDE.pretAcquisition),
    pretTravaux: lirePret(d.pretTravaux, DOSSIER_VIDE.pretTravaux),
  };
}
