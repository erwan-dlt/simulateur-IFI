import { describe, expect, it } from "vitest";
import { calculerIFI, simuler } from "./ifi";
import { getRules } from "../tax/rules";
import { DOSSIER_VIDE } from "../storage/dossier";

const r = getRules(2026);
const pret = { montant: 0, taeg: 0, anneeDebut: 2026, anneeFin: 2028, plafonne: false };

describe("calculerIFI", () => {
  it("ne taxe pas sous 1,3 M€", () => expect(calculerIFI(1_300_000, r)).toBe(0));
  it("applique la décote entre 1,3 et 1,4 M€", () => expect(calculerIFI(1_350_000, r)).toBe(2225));
  it("applique le barème progressif", () => expect(calculerIFI(2_000_000, r)).toBe(7400));
});

describe("simuler", () => {
  it("renvoie null si les années sont incohérentes", () => {
    expect(simuler({ ...DOSSIER_VIDE, pretAcquisition: { ...pret, anneeFin: 2020 } })).toBeNull();
  });

  it("sans prêt ni taxe foncière, avec = sans emprunt", () => {
    const s = simuler({ ...DOSSIER_VIDE, autresBiens: 2_000_000, pretAcquisition: pret })!;
    expect(s.annees).toHaveLength(2);
    expect(s.ifiAvecEmprunt).toBe(14_696);
    expect(s.ifiSansEmprunt).toBe(14_696);
    expect(s.economie).toBe(0);
  });

  it("plafonne les dettes au-delà de 60 % de l'actif (actif ≥ 5 M€)", () => {
    const s = simuler({
      ...DOSSIER_VIDE,
      autresBiens: 10_000_000,
      pretAcquisition: { ...pret, montant: 8_000_000, anneeFin: 2027, plafonne: true },
    })!;
    expect(s.annees[0].empruntAvecPlafond).toBe(7_000_000);
  });
});
