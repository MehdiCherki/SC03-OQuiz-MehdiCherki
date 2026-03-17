// ================= Restreindre les types : exemple du DOM ===============

const linkElement = document.querySelector("a"); // Type : HTMLAnchorElement | null

// Par une vérification au runtime, on restreint le type
if (linkElement === null) {
  throw new Error("Il devrait y avoir un <a> sur le HTML");
}

console.log(linkElement); // Type: HTMLAnchorElement


//  ================== Autres solutions ====================

const linkElement3 = document.querySelector("a") as HTMLAnchorElement; // On CAST (convertir), à nos risques et périls
const linkElement2 = document.querySelector("a") ! ; // Noter le " ! " ici pour retirer le " | null" : c'est une "non-null assertion"
