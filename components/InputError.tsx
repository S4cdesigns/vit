type Props = {
  message?: string;
};

export default function InputError({ message }: Props) {
  return <span style={{ color: "#b40000", marginLeft: 5 }}>{message || "An error occurred"}</span>;
}
