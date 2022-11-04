type Props = {
  name: string;
  code: string;
  size?: number;
  onClick?: () => void;
  className?: string;
};

const ratio = 3 / 4;

export default function Flag({ name, code, size, onClick, className }: Props) {
  const w = size || 32;
  const h = w * ratio;
  return (
    <img
      onClick={onClick}
      className={className}
      style={{ borderRadius: 2 }}
      title={name}
      width={w}
      height={h}
      src={`/assets/flags/${code.toLowerCase()}.svg`}
    />
  );
}
