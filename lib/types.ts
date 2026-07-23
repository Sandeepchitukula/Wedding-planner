export default function Badge({ value, prefix = '' }: { value: string; prefix?: string }) {
  return (
    <span className={`${prefix}${value} inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize`}>
      {value.replace('_', ' ')}
    </span>
  );
                     }
