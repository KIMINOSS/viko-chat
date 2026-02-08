interface AvatarProps {
  name: string;
  url?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
};

const colorMap = [
  'bg-rose-100 text-rose-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-purple-100 text-purple-700',
  'bg-cyan-100 text-cyan-700',
];

function getColor(name: string) {
  let hash = 0;
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return colorMap[Math.abs(hash) % colorMap.length]!;
}

export function Avatar({ name, url, size = 'md' }: AvatarProps) {
  const initial = name.charAt(0).toUpperCase();

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={`${sizeMap[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div className={`${sizeMap[size]} ${getColor(name)} flex items-center justify-center rounded-full font-semibold`}>
      {initial}
    </div>
  );
}
