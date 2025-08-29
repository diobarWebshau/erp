import { useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store.tsx";

type Props = {
  children: React.ReactNode;
};

const ThemeProvider = ({ children }: Props) => {
  const theme = useSelector((state: RootState) => state.theme.theme);

  useEffect(() => {
    if (theme === "light" || theme === "dark") {
      document.body.classList.remove("light", "dark");
      document.body.classList.add(theme);
    }
  }, [theme]);

  return <>{children}</>;
};

export default ThemeProvider;
