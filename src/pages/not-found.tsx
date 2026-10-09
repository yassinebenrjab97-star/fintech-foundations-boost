import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="container py-32">
      <p className="font-display text-[8rem] leading-none text-secondary/70">404</p>
      <Link to="/" className="btn-ghost mt-6">{t("common.back")}</Link>
    </div>
  );
}
