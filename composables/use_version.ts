import Axios from "axios";
import { useEffect, useState } from "react";

export function useVersion() {
  const [version, setVersion] = useState("");
  useEffect(() => {
    Axios.get<{ result: string }>("/api/version")
      .then((res) => {
        setVersion(res.data.result);
      })
      .catch(() => {});
  }, []);
  return { version };
}
