/** Écusson du logo (fourni par le client). Décoratif : le nom de l’organisme est écrit à côté. */
export default function LogoMark({ className = '' }: { className?: string }) {
  return (
    <img
      src="/logo-mark-sm.webp"
      alt=""
      width={165}
      height={192}
      decoding="async"
      className={`w-auto shrink-0 select-none ${className}`}
    />
  );
}
