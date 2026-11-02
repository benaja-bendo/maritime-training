import type { Course } from '@/types';

// Fonctions à bord et formations qui leur sont associées (liste fournie par le client le 2026-10-29).
// Une fonction cochée à l'inscription pré-sélectionne ses formations ; le candidat peut en retirer ou en ajouter.
//
// Une référence de formation est un numéro IMO ('1.13') ou le début exact du nom dans le catalogue
// (pour les formations sans numéro : 'Wiper', 'Ordinary Seaman'...). Voir `resolveRefs`.
//
// Lecture de la liste du client : « A & B » = les deux formations ; « A / B » = A est cochée, B est
// proposée en option (`optional`). Les titres et licences délivrés en dehors de nos formations
// (brevet d'officier, licence de pilotage...) sont listés dans `prerequisites` : on les signale au
// candidat sans les vendre.

export interface PositionOption {
  ref: string;
  note: string;
}

export interface Position {
  id: string;
  label: string;
  courses: string[];
  optional?: PositionOption[];
  prerequisites?: string[];
}

export interface PositionGroup {
  label: string;
  positions: Position[];
}

// Formation de base à la sécurité (STCW BST) : 1.13 + 1.19 + 1.20 + 1.21, vendue en pack.
const BST = ['1.13', '1.19', '1.20', '1.21'];

export const POSITION_GROUPS: PositionGroup[] = [
  {
    label: 'Deck crew',
    positions: [
      {
        id: 'ordinary-seaman',
        label: 'Ordinary Seaman (entry-level deck rating)',
        courses: [...BST, '3.27', 'Ordinary Seaman', '1.38'],
        optional: [{ ref: 'Rating Forming Part Of Navigational Watch', note: 'alternative' }],
      },
      {
        id: 'able-seafarer-deck',
        label: 'Able Seafarer Deck (AB)',
        courses: [...BST, '3.26', 'Rating as Able Seafarer for Deck', '1.23', '1.14'],
      },
      {
        id: 'bosun',
        label: 'Bosun (Boatswain)',
        courses: [...BST, '3.26', 'Rating as Able Seafarer for Deck', '1.23', '1.39', '1.14'],
      },
      {
        id: 'painter',
        label: 'Painter (deck maintenance)',
        courses: [...BST, '3.27', 'Ordinary Seaman', '1.38'],
        optional: [{ ref: '1.10', note: 'if you work on a tanker' }],
      },
    ],
  },
  {
    label: 'Engine crew',
    positions: [
      {
        id: 'wiper',
        label: 'Wiper (entry-level engine rating)',
        courses: [...BST, '3.27', 'Wiper', '1.38'],
        optional: [{ ref: 'Rating Forming Part Of Engineer Watch', note: 'alternative' }],
      },
      {
        id: 'oiler',
        label: 'Oiler / Able Seafarer Engine (AB Engine)',
        courses: [...BST, '3.26', 'Rating as Able Seafarer for Engine', '1.23', '2.03'],
      },
      {
        id: 'welder',
        label: 'Welder / Pipefitter',
        courses: [...BST, '3.26', 'Rating as Able Seafarer for Engine', '2.03', '1.10'],
        optional: [{ ref: 'Wiper', note: 'alternative' }],
      },
      {
        id: 'pumpman',
        label: 'Pumpman (tanker cargo specialist)',
        courses: [...BST, '3.26', 'Rating as Able Seafarer for Engine', '1.02', '1.03', '2.03'],
      },
    ],
  },
  {
    label: 'Officers',
    positions: [
      {
        id: 'master',
        label: 'Deck Officer / Master',
        courses: [...BST, '3.19', '1.25', '1.27', '1.07', '1.08', '1.15', '1.22', 'Bridge Resources Management'],
      },
      {
        id: 'chief-engineer',
        label: 'Engineer Officer / Chief Engineer',
        courses: [...BST, '3.19', '2.07', 'Engine Room Resources Management', '2.03', 'High Voltage Safety', '1.14'],
      },
      {
        id: 'eto',
        label: 'Electro-Technical Officer (ETO)',
        courses: [...BST, '3.26', 'High Voltage Safety', '2.07', '2.03'],
      },
    ],
  },
  {
    label: 'Offshore and drilling',
    positions: [
      {
        id: 'driller',
        label: 'Driller',
        courses: [...BST, '3.26', 'BOSIET', 'MIST', 'IWCF', 'HUET'],
      },
      {
        id: 'rigger',
        label: 'Rigger',
        courses: [...BST, '3.26', 'BOSIET', 'Banksman & Rigger', '1.23'],
      },
      {
        id: 'crane-operator',
        label: 'Offshore Crane Operator',
        courses: [...BST, '3.26', 'BOSIET', 'Offshore Crane Operator', '1.23'],
      },
      {
        id: 'hse',
        label: 'HSE Officer (health, safety and environment)',
        courses: [...BST, '3.19', '2.03', '1.14', '1.38', '6.09'],
        optional: [
          { ref: '3.21', note: 'instead of Ship Security Officer, for work in port areas' },
          { ref: '1.15', note: 'in addition to Medical First Aid' },
        ],
      },
    ],
  },
  {
    label: 'Catering and service',
    positions: [
      {
        id: 'cook',
        label: 'Ship’s Cook',
        courses: [...BST, '3.27', 'Ship’s Cook', 'Food Safety', '1.28'],
      },
      {
        id: 'steward',
        label: 'Steward / Housekeeping (cabin service)',
        courses: [...BST, '3.27', '1.28', '1.29'],
      },
    ],
  },
  {
    label: 'Specialist operators',
    positions: [
      {
        id: 'rov',
        label: 'ROV Pilot / Operator (underwater robot)',
        courses: [...BST, '3.26', 'BOSIET', 'IMCA ROV', 'High Voltage Safety'],
      },
      {
        id: 'dpo',
        label: 'Dynamic Positioning Operator (DPO)',
        courses: [...BST, 'NI DP Basic', 'NI DP Advanced'],
        prerequisites: [
          'STCW officer certificate of competency, deck or engine',
          'DP Operator Certificate (Unrestricted / Limited)',
        ],
      },
      {
        id: 'radio',
        label: 'GMDSS Radio Operator',
        courses: [...BST, '3.27', '1.25', 'CAA Offshore Radio'],
      },
    ],
  },
  {
    label: 'Pilotage and specialised craft',
    positions: [
      {
        id: 'pilot',
        label: 'Maritime Pilot / Harbour Pilot',
        courses: [...BST, '1.22', '1.27'],
        prerequisites: [
          'Master’s certificate of competency (STCW Master, 3,000 GT and above)',
          'Local port pilotage licence',
        ],
      },
      {
        id: 'frb',
        label: 'Fast Rescue Boat (FRB) Operator',
        courses: [...BST, '3.26', '1.24', '1.23', '1.14'],
      },
    ],
  },
];

export const POSITIONS: Position[] = POSITION_GROUPS.flatMap((g) => g.positions);

export function getPosition(id: string): Position | undefined {
  return POSITIONS.find((p) => p.id === id);
}

const IMO_REF = /^\d\.\d{2}$/;

/** Trouve la formation du catalogue désignée par une référence (numéro IMO, ou début du nom). */
export function resolveRef(courses: Course[], ref: string): Course | undefined {
  if (IMO_REF.test(ref)) return courses.find((c) => c.imo_number === ref);
  return courses.find((c) => c.name === ref) ?? courses.find((c) => c.name.startsWith(ref));
}

/** Formations recommandées pour une fonction, dans l'ordre de la liste, sans doublon. */
export function resolveRefs(courses: Course[], refs: string[]): Course[] {
  const out: Course[] = [];
  for (const ref of refs) {
    const c = resolveRef(courses, ref);
    if (c && !out.includes(c)) out.push(c);
  }
  return out;
}
