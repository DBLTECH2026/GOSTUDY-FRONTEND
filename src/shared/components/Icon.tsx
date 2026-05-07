/**
 * Iconos inline (lucide MIT). Un componente único por simplicidad y para no
 * meter una dependencia nueva sin consensuar con el equipo. Si en algún
 * momento se aprueba instalar `lucide-react`, este archivo se reemplaza.
 */

import { SVGProps } from 'react';

export type IconName =
  | 'House'
  | 'FileText'
  | 'CreditCard'
  | 'BookOpen'
  | 'User'
  | 'Users'
  | 'Bell'
  | 'ChevronDown'
  | 'Search'
  | 'Download'
  | 'Plus'
  | 'X'
  | 'Calendar'
  | 'Wallet'
  | 'Hourglass'
  | 'TriangleAlert'
  | 'CircleCheck'
  | 'ChartBar'
  | 'ChartPie'
  | 'GraduationCap'
  | 'Folder'
  | 'KeyRound'
  | 'Upload'
  | 'ArrowRight'
  | 'Calculator'
  | 'Leaf'
  | 'Globe'
  | 'Languages'
  | 'Church'
  | 'Dumbbell'
  | 'Palette'
  | 'Banknote'
  | 'Building2'
  | 'Smartphone'
  | 'List'
  | 'Mail';

const PATHS: Record<IconName, string> = {
  House: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8 M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  FileText: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z M14 2v4a2 2 0 0 0 2 2h4 M10 9H8 M16 13H8 M16 17H8',
  CreditCard: 'M22 10H2 M22 12V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8',
  BookOpen: 'M12 7v14 M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z',
  User: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  Users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  Bell: 'M10.268 21a2 2 0 0 0 3.464 0 M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326',
  ChevronDown: 'm6 9 6 6 6-6',
  Search: 'm21 21-4.34-4.34 M11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12',
  Download: 'M12 15V3 M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5',
  Plus: 'M5 12h14 M12 5v14',
  X: 'M18 6 6 18 M6 6l12 12',
  Calendar: 'M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  Wallet: 'M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2 M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4',
  Hourglass: 'M5 22h14 M5 2h14 M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22 M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2',
  TriangleAlert: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3 M12 9v4 M12 17h.01',
  CircleCheck: 'M21.801 10A10 10 0 1 1 17 3.335 M9 11l3 3L22 4',
  ChartBar: 'M3 3v16a2 2 0 0 0 2 2h16 M7 16h8 M7 11h12 M7 6h3',
  ChartPie: 'M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.997.398-.997.95v8a1 1 0 0 0 1 1z M21.21 15.89A10 10 0 1 1 8 2.83',
  GraduationCap: 'M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z M22 10v6 M6 12.5V16a6 3 0 0 0 12 0v-3.5',
  Folder: 'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z',
  KeyRound: 'M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z M16 12h.01',
  Upload: 'M12 3v12 M17 8l-5-5-5 5 M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4',
  ArrowRight: 'M5 12h14 M12 5l7 7-7 7',
  Calculator: 'M16 14v2.5 M16 8v2 M16 11h.01 M12 11h.01 M8 11h.01 M8 14h.01 M8 17h.01 M12 14h.01 M12 17h.01 M4 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z',
  Leaf: 'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96a1 1 0 0 1 1.8.4c.4 4 .9 12.4-7 14.6 M2 21c0-3 1.85-5.36 5.08-6',
  Globe: 'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20 M2 12h20 M12 2a14.5 14.5 0 0 1 4 10 14.5 14.5 0 0 1-4 10 14.5 14.5 0 0 1-4-10 14.5 14.5 0 0 1 4-10z',
  Languages: 'm5 8 6 6 M4 14l6-6 2-3 M2 5h12 M7 2h1 M22 22l-5-10-5 10 M14 18h6',
  Church: 'M10 9h4 M12 7v5 M14 22v-4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4 M18 22V5.618a1 1 0 0 0-.553-.894l-4.553-2.277a2 2 0 0 0-1.788 0L6.553 4.724A1 1 0 0 0 6 5.618V22 M6.222 22h11.556',
  Dumbbell: 'M14.4 14.4 9.6 9.6 M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z M21.5 21.5 19 19 M3.343 2.515a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829L4.404 10.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829z M2.5 2.5 5 5',
  Palette: 'M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z M13.5 6.5h.01 M17.5 10.5h.01 M6.5 12.5h.01 M8.5 7.5h.01',
  Banknote: 'M12 18V6 M2 6h20 M2 18h20 M2 6v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6 M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2',
  Building2: 'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2 M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2 M10 6h4 M10 10h4 M10 14h4 M10 18h4',
  Smartphone: 'M5 4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z M12 18h.01',
  List: 'M3 5h.01 M3 12h.01 M3 19h.01 M8 5h13 M8 12h13 M8 19h13',
  Mail: 'M22 7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2 M22 7v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7 M22 7l-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7',
};

export type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
  size?: number;
};

export function Icon({ name, size = 20, className, ...rest }: IconProps) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      {d.split(' M').map((segment, i) => (
        <path key={i} d={i === 0 ? segment : `M${segment}`} />
      ))}
    </svg>
  );
}
