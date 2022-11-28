import Text from "./Text";

export default function Credits() {
  return (
    <>
      <ul style={{ lineHeight: 1.5 }}>
        <li>
          <Text>leadwolf</Text>
        </li>
        <li>
          <Text style={{ display: "inline" }}>DebaucheryLibrarian</Text> (
          <a
            className="hover"
            style={{ color: "#6666ff" }}
            href="https://traxxx.me"
            target="_blank"
          >
            https://traxxx.me
          </a>
          )
        </li>
        <li>
          <Text>globochem</Text>
        </li>
        <li>
          <Text>Herpes3000</Text>
        </li>
        <li>
          <Text>DGs.Ch00</Text>
        </li>
        <li>
          <Text>GernBlanston</Text>
        </li>
        <li>
          <Text>john4valor</Text>
        </li>
      </ul>

      <div>
        Missing?{" "}
        <a
          className="hover"
          style={{ color: "#6666ff" }}
          rel="noopener noreferrer"
          target="_blank"
          href="https://gitlab.com/porn-vault/porn-vault/-/blob/ssr/components/Credits.tsx"
        >
          Edit on GitLab
        </a>
      </div>
    </>
  );
}
