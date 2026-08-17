export type LegalSlug = 'conditions' | 'confidentialite' | 'cookies';

export interface LegalSection {
  id: string;
  title: {fr: string;en: string;};
  body: {fr: string;en: string;}[];
}

export interface LegalDocument {
  slug: LegalSlug;
  titleKey: string;
  sections: LegalSection[];
}

/** Placeholder legal copy — must be reviewed by a Canadian legal professional. */
export const legalDocuments: LegalDocument[] = [
{
  slug: 'conditions',
  titleKey: 'legal.terms.title',
  sections: [
  {
    id: 'objet',
    title: { fr: 'Objet', en: 'Purpose' },
    body: [
    {
      fr: 'Les présentes conditions encadrent l’utilisation du site Novavolt et des services de location de véhicules électriques proposés au Canada. Ce texte est un contenu de démonstration.',
      en: 'These terms govern use of the Novavolt website and the electric vehicle rental services offered in Canada. This text is demonstration content.'
    }]

  },
  {
    id: 'admissibilite',
    title: { fr: 'Admissibilité du locataire', en: 'Renter eligibility' },
    body: [
    {
      fr: 'Le locataire doit détenir un permis de conduire valide, fournir les documents demandés et disposer d’un moyen de paiement à son nom. Les critères définitifs sont confirmés par Novavolt lors de la validation du dossier.',
      en: 'The renter must hold a valid driver’s licence, provide the requested documents and have a payment method in their name. Final criteria are confirmed by Novavolt when the file is reviewed.'
    }]

  },
  {
    id: 'reservation',
    title: { fr: 'Réservation et disponibilité', en: 'Booking and availability' },
    body: [
    {
      fr: 'Une demande de réservation ne constitue pas une confirmation. La disponibilité finale du véhicule est confirmée par Novavolt. En cas d’indisponibilité, un véhicule équivalent peut être proposé.',
      en: 'A booking request is not a confirmation. Final vehicle availability is confirmed by Novavolt. If unavailable, an equivalent vehicle may be offered.'
    }]

  },
  {
    id: 'paiements',
    title: { fr: 'Tarifs, paiements et dépôt', en: 'Rates, payments and deposit' },
    body: [
    {
      fr: 'Les tarifs affichés sont indicatifs et peuvent varier selon le véhicule, la ville et la durée. Un dépôt remboursable peut être retenu et libéré après le retour et l’inspection du véhicule.',
      en: 'Displayed rates are indicative and may vary by vehicle, city and duration. A refundable deposit may be held and released after the vehicle is returned and inspected.'
    }]

  },
  {
    id: 'usage',
    title: { fr: 'Usage du véhicule', en: 'Vehicle use' },
    body: [
    {
      fr: 'Le véhicule doit être utilisé conformément au Code de la route applicable et aux conditions du contrat. Toute utilisation commerciale doit être déclarée au moment de la réservation.',
      en: 'The vehicle must be used in accordance with applicable traffic laws and the contract terms. Any commercial use must be declared at booking time.'
    }]

  },
  {
    id: 'responsabilite',
    title: { fr: 'Responsabilité', en: 'Liability' },
    body: [
    {
      fr: 'Le locataire demeure responsable des amendes, dommages non déclarés et frais liés à un usage non conforme. Les modalités précises sont détaillées au contrat de location.',
      en: 'The renter remains responsible for fines, undeclared damage and costs arising from non-compliant use. Exact terms are detailed in the rental contract.'
    }]

  },
  {
    id: 'droit',
    title: { fr: 'Droit applicable', en: 'Governing law' },
    body: [
    {
      fr: 'Ces conditions sont régies par les lois applicables au Canada et dans la province de conclusion du contrat. Ce contenu doit être validé par un professionnel du droit avant publication.',
      en: 'These terms are governed by the laws applicable in Canada and the province where the contract is concluded. This content must be validated by a legal professional before publication.'
    }]

  }]

},
{
  slug: 'confidentialite',
  titleKey: 'legal.privacy.title',
  sections: [
  {
    id: 'donnees',
    title: { fr: 'Données collectées', en: 'Data collected' },
    body: [
    {
      fr: 'Nous collectons les informations nécessaires à la location : identité, coordonnées, documents d’admissibilité, historique de réservation et données de facturation.',
      en: 'We collect the information required to rent: identity, contact details, eligibility documents, booking history and billing data.'
    }]

  },
  {
    id: 'finalites',
    title: { fr: 'Finalités', en: 'Purposes' },
    body: [
    {
      fr: 'Ces données servent à valider un dossier, préparer un véhicule, assurer le suivi de la location, facturer et répondre aux demandes de support.',
      en: 'This data is used to validate a file, prepare a vehicle, follow up on the rental, invoice and answer support requests.'
    }]

  },
  {
    id: 'conservation',
    title: { fr: 'Conservation', en: 'Retention' },
    body: [
    {
      fr: 'Les documents sont conservés le temps nécessaire aux obligations contractuelles et légales, puis supprimés ou anonymisés.',
      en: 'Documents are retained as long as contractual and legal obligations require, then deleted or anonymised.'
    }]

  },
  {
    id: 'partage',
    title: { fr: 'Partage avec des tiers', en: 'Third-party sharing' },
    body: [
    {
      fr: 'Certaines données sont transmises à des prestataires nécessaires au service (paiement, signature électronique, assistance routière), dans le cadre de leurs obligations de confidentialité.',
      en: 'Some data is shared with providers required to deliver the service (payment, e-signature, roadside assistance), under their confidentiality obligations.'
    }]

  },
  {
    id: 'droits',
    title: { fr: 'Vos droits', en: 'Your rights' },
    body: [
    {
      fr: 'Vous pouvez demander l’accès, la rectification ou la suppression de vos données en écrivant à location.novavolt@gmail.com.',
      en: 'You may request access, correction or deletion of your data by writing to location.novavolt@gmail.com.'
    }]

  },
  {
    id: 'securite',
    title: { fr: 'Sécurité', en: 'Security' },
    body: [
    {
      fr: 'Les données sont transmises de manière chiffrée et stockées sur des serveurs sécurisés. Aucune information bancaire complète n’est conservée par Novavolt.',
      en: 'Data is transmitted encrypted and stored on secure servers. No complete banking information is kept by Novavolt.'
    }]

  }]

},
{
  slug: 'cookies',
  titleKey: 'legal.cookies.title',
  sections: [
  {
    id: 'definition',
    title: { fr: 'Qu’est-ce qu’un cookie', en: 'What a cookie is' },
    body: [
    {
      fr: 'Un cookie est un petit fichier déposé sur votre appareil pour permettre le fonctionnement du site et mesurer son usage.',
      en: 'A cookie is a small file stored on your device to make the site work and to measure its usage.'
    }]

  },
  {
    id: 'types',
    title: { fr: 'Cookies utilisés', en: 'Cookies used' },
    body: [
    {
      fr: 'Cookies essentiels (session, langue, sécurité), cookies de mesure d’audience agrégée et, le cas échéant, cookies de performance.',
      en: 'Essential cookies (session, language, security), aggregate analytics cookies and, where applicable, performance cookies.'
    }]

  },
  {
    id: 'gestion',
    title: { fr: 'Gestion de vos préférences', en: 'Managing your preferences' },
    body: [
    {
      fr: 'Vous pouvez refuser les cookies non essentiels depuis la bannière de consentement ou les réglages de votre navigateur.',
      en: 'You may refuse non-essential cookies from the consent banner or your browser settings.'
    }]

  },
  {
    id: 'duree',
    title: { fr: 'Durée de conservation', en: 'Retention period' },
    body: [
    {
      fr: 'Les cookies essentiels expirent à la fin de la session. Les autres cookies ont une durée maximale de treize mois.',
      en: 'Essential cookies expire at the end of the session. Other cookies last a maximum of thirteen months.'
    }]

  }]

}];


export function getLegalDocument(slug: string): LegalDocument | undefined {
  return legalDocuments.find((doc) => doc.slug === slug);
}