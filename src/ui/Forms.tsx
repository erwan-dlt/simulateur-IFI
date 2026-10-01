import type { Loan } from "../models/types";

interface FieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
}

export function Field({ label, value, onChange, unit }: FieldProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="field-input">
        <input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(e.target.valueAsNumber || 0)}
        />
        {unit && <em>{unit}</em>}
      </div>
    </label>
  );
}

interface LoanFormProps {
  titre: string;
  loan: Loan;
  onChange: (l: Loan) => void;
}

export function LoanForm({ titre, loan, onChange }: LoanFormProps) {
  const maj = (p: Partial<Loan>) => onChange({ ...loan, ...p });
  return (
    <fieldset>
      <legend>{titre}</legend>
      <Field label="Montant du prêt" unit="€" value={loan.montant} onChange={(montant) => maj({ montant })} />
      <Field label="TAEG du prêt" unit="%" value={loan.taeg} onChange={(taeg) => maj({ taeg })} />
      <Field label="Année de départ" value={loan.anneeDebut} onChange={(anneeDebut) => maj({ anneeDebut })} />
      <Field label="Année de fin" value={loan.anneeFin} onChange={(anneeFin) => maj({ anneeFin })} />
      <label className="check">
        <input type="checkbox" checked={loan.plafonne} onChange={(e) => maj({ plafonne: e.target.checked })} />
        <span>Plafonner le montant</span>
      </label>
    </fieldset>
  );
}
