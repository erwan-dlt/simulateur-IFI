// script.js

document.getElementById('ajouter-emprunt').addEventListener('click', function() {
    ajouterEmprunt();
});

document.getElementById('ifi-form').addEventListener('submit', function(event) {
    event.preventDefault();
    calculGeneral();
});

let empruntCount = 1;

function ajouterEmprunt() {
    empruntCount++;
    const container = document.getElementById('emprunts-container');
    const div = document.createElement('div');
    div.classList.add('emprunt');
    div.innerHTML = `
        <label for="emprunt-montant-${empruntCount}">Montant de l'emprunt :</label>
        <input type="number" id="emprunt-montant-${empruntCount}" class="emprunt-montant" required>
        <label for="emprunt-plafonne-${empruntCount}">Plafonné :</label>
        <input type="checkbox" id="emprunt-plafonne-${empruntCount}" class="emprunt-plafonne">
    `;
    container.appendChild(div);
}

function calculGeneral() {
    const residencePrincipale = parseFloat(document.getElementById('residence-principale').value);
    const autresBiens = parseFloat(document.getElementById('autres-biens').value);
    const taxeFonciere = parseFloat(document.getElementById('taxe-fonciere').value);

    let empruntsTotal = 0;

    document.querySelectorAll('.emprunt').forEach((emprunt, index) => {
        const montant = parseFloat(emprunt.querySelector('.emprunt-montant').value);
        const plafonne = emprunt.querySelector('.emprunt-plafonne').checked;
        
        if (plafonne) {
            empruntsTotal += Math.min(montant, residencePrincipale);
        } else {
            empruntsTotal += montant;
        }
    });

    const valeurNetteImmo = (residencePrincipale * 0.7) + autresBiens - empruntsTotal;

    const baseImposable = valeurNetteImmo - taxeFonciere;

    let ifi = calculerIFI(baseImposable);
    document.getElementById('resultat').innerText = `Votre IFI estimé est de : ${ifi} €`;
}

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
