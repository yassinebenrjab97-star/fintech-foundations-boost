import { Link } from "react-router-dom";

export default function Admin() {
  return (
    <div className="container py-32">
      <h1 className="text-4xl font-semibold">Administration</h1>
      <p className="mt-4 text-muted-foreground">Espace en cours de construction.</p>
      <Link to="/" className="btn-ghost mt-6">Retour</Link>
    </div>
  );
}
