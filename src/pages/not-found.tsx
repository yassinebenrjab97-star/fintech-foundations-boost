import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="container py-32">
      <p className="sign-caps text-[8rem] text-secondary/70">404</p>
      <Link to="/" className="btn-ghost mt-6">{t("common.back")}</Link>
    </div>
  );
}
