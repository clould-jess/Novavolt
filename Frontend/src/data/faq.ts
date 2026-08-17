export type FaqCategory =
'booking' |
'drivers' |
'individuals' |
'payments' |
'insurance' |
'charging' |
'cancellation' |
'documents' |
'return' |
'support';

export interface FaqItem {
  id: string;
  category: FaqCategory;
  question: {fr: string;en: string;};
  answer: {fr: string;en: string;};
}

/** Mock FAQ content — replace with a CMS or GET /api/faq. */
export const mockFaq: FaqItem[] = [
{
  id: 'faq-1',
  category: 'booking',
  question: { fr: 'Combien de temps prend une réservation ?', en: 'How long does a booking take?' },
  answer: {
    fr: 'La demande en ligne prend une dizaine de minutes. Une fois votre dossier complet, nous confirmons la disponibilité sous un jour ouvrable.',
    en: 'The online request takes about ten minutes. Once your file is complete, we confirm availability within one business day.'
  }
},
{
  id: 'faq-2',
  category: 'booking',
  question: { fr: 'Puis-je réserver un véhicule précis ?', en: 'Can I book a specific vehicle?' },
  answer: {
    fr: 'Oui. Vous choisissez le modèle affiché au catalogue. Si le véhicule devient indisponible, nous proposons une alternative équivalente avant la remise.',
    en: 'Yes. You pick the model shown in the catalogue. If it becomes unavailable we propose an equivalent alternative before handover.'
  }
},
{
  id: 'faq-3',
  category: 'booking',
  question: { fr: 'La disponibilité affichée est-elle garantie ?', en: 'Is the displayed availability guaranteed?' },
  answer: {
    fr: 'Le calendrier reflète l’état de la flotte au moment de la consultation. La disponibilité finale est confirmée par Novavolt après vérification du dossier.',
    en: 'The calendar reflects fleet status at the time you view it. Final availability is confirmed by Novavolt after the file review.'
  }
},
{
  id: 'faq-4',
  category: 'drivers',
  question: { fr: 'Vos véhicules sont-ils admissibles sur Uber et Lyft ?', en: 'Are your vehicles eligible on Uber and Lyft?' },
  answer: {
    fr: 'Nos modèles sont choisis pour correspondre aux critères habituels des plateformes (année, places, état). Novavolt n’est affilié à aucune plateforme : l’acceptation finale relève de celle-ci.',
    en: 'Our models are chosen to match the usual platform criteria (year, seats, condition). Novavolt is not affiliated with any platform: final acceptance is theirs.'
  }
},
{
  id: 'faq-5',
  category: 'drivers',
  question: { fr: 'Y a-t-il une limite de kilométrage pour les chauffeurs ?', en: 'Is there a mileage cap for drivers?' },
  answer: {
    fr: 'Les formules chauffeurs incluent un kilométrage généreux adapté à un usage professionnel. Au-delà, un supplément par kilomètre s’applique et vous est indiqué au contrat.',
    en: 'Driver plans include generous mileage suited to professional use. Beyond that, a per-kilometre surcharge applies and is stated in the contract.'
  }
},
{
  id: 'faq-6',
  category: 'drivers',
  question: { fr: 'Puis-je changer de véhicule en cours de location ?', en: 'Can I swap vehicles mid-rental?' },
  answer: {
    fr: 'Oui, selon la disponibilité de la flotte dans votre ville. Les formules 14 jours et hebdomadaires sont prioritaires pour les échanges.',
    en: 'Yes, subject to fleet availability in your city. The 14-day and weekly plans get priority for swaps.'
  }
},
{
  id: 'faq-7',
  category: 'individuals',
  question: { fr: 'Faut-il de l’expérience avec un véhicule électrique ?', en: 'Do I need EV experience?' },
  answer: {
    fr: 'Non. La remise inclut une prise en main : recharge, autonomie, conduite à une pédale et bornes à proximité.',
    en: 'No. Handover includes a walkthrough: charging, range, one-pedal driving and nearby stations.'
  }
},
{
  id: 'faq-8',
  category: 'individuals',
  question: { fr: 'Puis-je sortir de la province avec le véhicule ?', en: 'Can I take the vehicle out of province?' },
  answer: {
    fr: 'Les déplacements interprovinciaux sont possibles sur demande. Indiquez votre itinéraire au moment de la réservation pour validation.',
    en: 'Interprovincial trips are possible on request. Share your itinerary at booking time for approval.'
  }
},
{
  id: 'faq-9',
  category: 'payments',
  question: { fr: 'Comment fonctionne le dépôt ?', en: 'How does the deposit work?' },
  answer: {
    fr: 'Un dépôt remboursable est retenu à la signature. Il est libéré après le retour du véhicule et l’inspection, généralement sous quelques jours ouvrables.',
    en: 'A refundable deposit is held at signature. It is released after the vehicle returns and is inspected, usually within a few business days.'
  }
},
{
  id: 'faq-10',
  category: 'payments',
  question: { fr: 'Quels moyens de paiement acceptez-vous ?', en: 'Which payment methods do you accept?' },
  answer: {
    fr: 'Cartes de crédit et de débit via notre prestataire de paiement certifié. Novavolt ne conserve aucun numéro de carte sur ses serveurs.',
    en: 'Credit and debit cards through our certified payment provider. Novavolt keeps no card numbers on its servers.'
  }
},
{
  id: 'faq-11',
  category: 'payments',
  question: { fr: 'Que se passe-t-il si un paiement échoue ?', en: 'What happens if a payment fails?' },
  answer: {
    fr: 'Vous recevez une notification dans votre portail et par courriel, avec un délai pour régulariser avant toute suspension de la location.',
    en: 'You receive a portal and email notification, with a window to settle before any rental suspension.'
  }
},
{
  id: 'faq-12',
  category: 'insurance',
  question: { fr: 'L’assurance est-elle incluse ?', en: 'Is insurance included?' },
  answer: {
    fr: 'Des options d’assurance sont disponibles à la demande. Selon votre profil, votre propre couverture peut aussi être admissible : nous validons avec vous.',
    en: 'Insurance options are available on request. Depending on your profile your own coverage may qualify — we validate it with you.'
  }
},
{
  id: 'faq-13',
  category: 'insurance',
  question: { fr: 'Que couvre l’assistance routière ?', en: 'What does roadside assistance cover?' },
  answer: {
    fr: 'Dépannage, remorquage vers un atelier partenaire et accompagnement en cas d’immobilisation, 24 h sur 24.',
    en: 'Breakdown help, towing to a partner garage and support if the vehicle is immobilised, around the clock.'
  }
},
{
  id: 'faq-14',
  category: 'charging',
  question: { fr: 'Le véhicule est-il remis chargé ?', en: 'Is the vehicle handed over charged?' },
  answer: {
    fr: 'Oui, le véhicule est remis avec une charge élevée. Le niveau exact est consigné à la remise et au retour.',
    en: 'Yes, the vehicle is handed over with a high charge. The exact level is recorded at handover and return.'
  }
},
{
  id: 'faq-15',
  category: 'charging',
  question: { fr: 'Où recharger en ville ?', en: 'Where can I charge in the city?' },
  answer: {
    fr: 'Le véhicule affiche les bornes à proximité. Une carte de recharge optionnelle simplifie l’accès aux réseaux partenaires.',
    en: 'The vehicle shows nearby stations. An optional charging card simplifies access to partner networks.'
  }
},
{
  id: 'faq-16',
  category: 'charging',
  question: { fr: 'La recharge est-elle incluse dans le tarif ?', en: 'Is charging included in the rate?' },
  answer: {
    fr: 'La recharge est à votre charge, sauf mention contraire dans votre formule. Elle reste généralement plus économique qu’un plein équivalent.',
    en: 'Charging is your responsibility unless your plan states otherwise. It generally stays cheaper than an equivalent tank of fuel.'
  }
},
{
  id: 'faq-17',
  category: 'cancellation',
  question: { fr: 'Puis-je annuler sans frais ?', en: 'Can I cancel free of charge?' },
  answer: {
    fr: 'Oui, jusqu’à 48 heures avant la remise prévue. Passé ce délai, des frais peuvent s’appliquer selon la formule.',
    en: 'Yes, up to 48 hours before the scheduled handover. After that, fees may apply depending on the plan.'
  }
},
{
  id: 'faq-18',
  category: 'cancellation',
  question: { fr: 'Puis-je écourter une location en cours ?', en: 'Can I shorten an ongoing rental?' },
  answer: {
    fr: 'Oui. Contactez le support : nous ajustons la facturation à partir de la date de retour effective, selon les conditions du contrat.',
    en: 'Yes. Contact support: we adjust billing from the actual return date, subject to contract terms.'
  }
},
{
  id: 'faq-19',
  category: 'documents',
  question: { fr: 'Quels documents sont demandés ?', en: 'Which documents are requested?' },
  answer: {
    fr: 'Permis de conduire valide, pièce d’identité et justificatif d’adresse. Les chauffeurs ajoutent leur profil de conducteur de plateforme. Liste indicative à confirmer selon la province.',
    en: 'Valid driver’s licence, photo ID and proof of address. Drivers also add their platform driver profile. Indicative list, to be confirmed by province.'
  }
},
{
  id: 'faq-20',
  category: 'documents',
  question: { fr: 'Combien de temps prend la vérification ?', en: 'How long does verification take?' },
  answer: {
    fr: 'Généralement moins d’un jour ouvrable lorsque les pièces sont lisibles et complètes. Vous suivez chaque statut dans votre portail.',
    en: 'Usually under one business day when documents are legible and complete. You track each status in your portal.'
  }
},
{
  id: 'faq-21',
  category: 'documents',
  question: { fr: 'Un document a été refusé, que faire ?', en: 'A document was rejected — what now?' },
  answer: {
    fr: 'La raison du refus est affichée dans votre portail. Ajoutez une nouvelle version lisible : la vérification repart immédiatement.',
    en: 'The reason appears in your portal. Upload a new legible version and the review restarts immediately.'
  }
},
{
  id: 'faq-22',
  category: 'return',
  question: { fr: 'Comment se passe le retour ?', en: 'How does the return work?' },
  answer: {
    fr: 'Inspection conjointe, relevé du kilométrage et du niveau de charge, puis clôture du dossier et traitement du dépôt.',
    en: 'Joint inspection, odometer and charge reading, then file closure and deposit handling.'
  }
},
{
  id: 'faq-23',
  category: 'return',
  question: { fr: 'Des frais peuvent-ils s’ajouter au retour ?', en: 'Can fees be added at return?' },
  answer: {
    fr: 'Uniquement en cas de dommage constaté, de kilométrage dépassé ou de nettoyage majeur. Tout frais est détaillé avant facturation.',
    en: 'Only for observed damage, exceeded mileage or major cleaning. Any fee is itemised before invoicing.'
  }
},
{
  id: 'faq-24',
  category: 'support',
  question: { fr: 'Comment joindre le support ?', en: 'How do I reach support?' },
  answer: {
    fr: 'Par téléphone au +1 (438) 990-3762 ou par courriel à location.novavolt@gmail.com. L’assistance routière est joignable 24/7.',
    en: 'By phone at +1 (438) 990-3762 or by email at location.novavolt@gmail.com. Roadside assistance is reachable 24/7.'
  }
},
{
  id: 'faq-25',
  category: 'support',
  question: { fr: 'Puis-je suivre mes demandes ?', en: 'Can I track my requests?' },
  answer: {
    fr: 'Oui, chaque signalement et chaque demande apparaît dans votre portail avec son statut et son historique.',
    en: 'Yes, every report and request appears in your portal with its status and history.'
  }
}];


export const faqCategories: FaqCategory[] = [
'booking',
'drivers',
'individuals',
'payments',
'insurance',
'charging',
'cancellation',
'documents',
'return',
'support'];


export function faqByCategory(category: FaqCategory): FaqItem[] {
  return mockFaq.filter((item) => item.category === category);
}