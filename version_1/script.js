document.addEventListener("DOMContentLoaded", function() {
    const residencePrincipaleInput = document.getElementById("residence-principale");
    const autresBiensInput = document.getElementById("autres-biens");
    const augmentationActifInput = document.getElementById("augmentation-annuelle");
    const taxeFonciereInput = document.getElementById("taxe-fonciere");

    const debutPretInput = document.getElementById("debut-pret");
    const finPretInput = document.getElementById("fin-pret");
    const montantPretInput = document.getElementById("montant-pret");
    const taegPretInput = document.getElementById("taeg-pret");
    const plafondPretInput = document.getElementById("plafond-pret");

    const debutPretTravauxInput = document.getElementById("debut-pret-travaux");
    const finPretTravauxInput = document.getElementById("fin-pret-travaux");
    const montantPretTravauxInput = document.getElementById("montant-pret-travaux");
    const taegPretTravauxInput = document.getElementById("taeg-pret-travaux");
    const plafondPretTravauxInput = document.getElementById("plafond-pret-travaux");

    const casesContainer = document.getElementById("cases-container");
    const resultatsContainer = document.getElementById("resultats-container");

    function formatNumber(number) {
        return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(number);
    }

    function updateCases() {
        const residencePrincipaleValue = parseFloat(residencePrincipaleInput.value) || 0;
        const autresBiensValue = parseFloat(autresBiensInput.value) || 0;
        const totalActif = (residencePrincipaleValue * 0.7) + autresBiensValue; // Abattement 30% RP
        const augmentationActif = parseFloat(augmentationActifInput.value) || 0;
        const taxeFonciere = parseFloat(taxeFonciereInput.value) || 0;

        const anneeDebutPret = parseInt(debutPretInput.value, 10) || 0;
        const anneeFinPret = parseInt(finPretInput.value, 10) || 0;
        const montantPret = parseFloat(montantPretInput.value) || 0;
        const dureePret = anneeFinPret - anneeDebutPret;
        const reductionAnnuellePret = montantPret / dureePret;
        const plafondPret = plafondPretInput.checked;
        const taegPret = parseFloat(taegPretInput.value) || 0;

        const anneeDebutPretTravaux = parseInt(debutPretTravauxInput.value, 10) || 0;
        const anneeFinPretTravaux = parseInt(finPretTravauxInput.value, 10) || 0;
        const montantPretTravaux = parseFloat(montantPretTravauxInput.value) || 0;
        const plafondPretTravaux = plafondPretTravauxInput.checked;
        const taegPretTravaux = parseFloat(taegPretTravauxInput.value) || 0;

        if (anneeDebutPret && anneeFinPret && anneeFinPret >= anneeDebutPret) {
            casesContainer.innerHTML = ""; // Supprimer les cases existantes
            let montantPretActuel = montantPret;
            let totalActifActuel = totalActif;
            
            let ifiSansEmprunt = 0;
            let ifiAvecEmprunt = 0;
            for (let annee = anneeDebutPret + 1; annee <= anneeFinPret; annee++) {
                // Calcul pour chaque année
                let totalEmpruntAvecPlafond = 0;
                let totalEmpruntSansPlafond = taxeFonciere;
                if (plafondPret) {
                    totalEmpruntAvecPlafond += montantPretActuel;
                } else {
                    totalEmpruntSansPlafond += montantPretActuel;
                }

                if (annee > anneeDebutPretTravaux && annee <= anneeFinPretTravaux) {
                    if (plafondPretTravaux) {
                        totalEmpruntAvecPlafond += montantPretTravaux;
                    } else {
                        totalEmpruntSansPlafond += montantPretTravaux;
                    }
                }
                // Calcul du plafonnenement de l'emprunt
                if (totalActifActuel >= 5000000 && totalEmpruntAvecPlafond > totalActifActuel * 0.6) {
                    totalEmpruntAvecPlafond = totalActifActuel * 0.6 + (totalEmpruntAvecPlafond - totalActifActuel * 0.6) * 0.5;
                }
                const totalEmprunt = totalEmpruntAvecPlafond + totalEmpruntSansPlafond;
                const baseImposable = totalActifActuel - totalEmprunt;
                const ifiTheorique = calculerIFI(baseImposable);
                const ifi = calculerIFI(baseImposable - ifiTheorique);

                // Création des cases
                const caseElement = document.createElement("div");
                caseElement.classList.add("case");
                caseElement.innerHTML = `
                    <div class="case-header">Année: ${annee}</div>
                    <div class="case-content">
                        <p>Total de l'actif: ${formatNumber(totalActifActuel)} €</p>
                        <p>Emprunt avec plafond: ${formatNumber(totalEmpruntAvecPlafond)} €</p>
                        <p>Emprunt sans plafond: ${formatNumber(totalEmpruntSansPlafond)} €</p>
                        <p>Total passif déductibles: ${formatNumber(totalEmprunt)} €</p>
                        <p>IFI théorique: ${formatNumber(ifiTheorique)} €</p>
                        <p>Net imposable: ${formatNumber(baseImposable - ifiTheorique)} €</p>
                        <p>IFI: ${formatNumber(ifi)} €</p>
                    </div>
                `;
                casesContainer.appendChild(caseElement);

                // Réduire le montant du prêt pour l'année suivante
                ifiAvecEmprunt += ifi;
                ifiSansEmprunt += calculerIFI(totalActifActuel - taxeFonciere - calculerIFI(totalActifActuel - taxeFonciere));
                montantPretActuel -= reductionAnnuellePret;
                totalActifActuel *= 1 + augmentationActif;
                }

            // Calcul du coût des emprunts
            const coutEmpruntAcquisition = montantPret * taegPret;
            const coutEmpruntTravaux = montantPretTravaux * taegPretTravaux;
            const coutTotal = ifiAvecEmprunt + coutEmpruntAcquisition + coutEmpruntTravaux;

            // Création des résultats
            resultatsContainer.innerHTML = "";
            resultatsContainer.innerHTML = `
                <p>Total de l'IFI payé: ${formatNumber(ifiAvecEmprunt)} €</p>
                <p>Coût de l'emprunt d'acquisition: ${formatNumber(coutEmpruntAcquisition)} €</p>
                <p>Coût de l'emprunt des travaux: ${formatNumber(coutEmpruntTravaux)} €</p>
                <p>Total avec emprunt: ${formatNumber(coutTotal)} €</p>
                <p>Total sans emprunt: ${formatNumber(ifiSansEmprunt)} €</p>
                <p>Économie réalisée: ${formatNumber(ifiSansEmprunt - coutTotal)} €</p>
            `;
        }
    }

    residencePrincipaleInput.addEventListener("input", updateCases);
    autresBiensInput.addEventListener("input", updateCases);
    augmentationActifInput.addEventListener("input", updateCases);
    taxeFonciereInput.addEventListener("input", updateCases);
    debutPretInput.addEventListener("input", updateCases);
    finPretInput.addEventListener("input", updateCases);
    montantPretInput.addEventListener("input", updateCases);
    taegPretInput.addEventListener("input", updateCases);
    plafondPretInput.addEventListener("input", updateCases);
    debutPretTravauxInput.addEventListener("input", updateCases);
    finPretTravauxInput.addEventListener("input", updateCases);
    montantPretTravauxInput.addEventListener("input", updateCases);
    taegPretTravauxInput.addEventListener("input", updateCases);
    plafondPretTravauxInput.addEventListener("input", updateCases);

    updateCases(); // Appel pour initialiser les valeurs
});


function calculerIFI(baseImposable) {
    let ifi = 0;
    if (baseImposable > 1300000) {
        const tranches = [
            { seuil: 800000, taux: 0 },
            { seuil: 1300000, taux: 0.005 },
            { seuil: 2570000, taux: 0.007 },
            { seuil: 5000000, taux: 0.01 },
            { seuil: 10000000, taux: 0.0125 },
            { seuil: Infinity, taux: 0.015 }
        ];

        let reste = baseImposable;
        let precedentSeuil = 0;

        for (const tranche of tranches) {
            if (reste > tranche.seuil - precedentSeuil) {
                ifi += (tranche.seuil - precedentSeuil) * tranche.taux;
                reste -= (tranche.seuil - precedentSeuil);
            } else {
                ifi += reste * tranche.taux;
                break;
            }
            precedentSeuil = tranche.seuil;
        }

        if (baseImposable < 1400000) {
            ifi -= 17500 - 0.0125 * baseImposable;
        }
    }
    return Math.round(ifi);
}
