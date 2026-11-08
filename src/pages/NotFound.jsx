import { Link } from "react-router-dom";
import useSeo from "../hooks/useSeo.js";
export default function NotFound() {
  useSeo("Page not found", "This page could not be found.");
  return (
    <div className="wrap py-28">
      <h1 className="text-5xl">Page not found</h1>
      <Link to="/" className="btn mt-8">
        Go home
      </Link>
    </div>
  );
}
