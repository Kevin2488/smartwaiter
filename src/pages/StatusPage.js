import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StatusPage() {
  const [status, setStatus] = useState("");
  const [table, setTable] = useState("");
  const [theme, setTheme] = useState("dark");
  const [font, setFont] = useState("inter");
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    const savedFont = localStorage.getItem("font") || "inter";
    document.body.className = `${savedTheme} font-${savedFont}`;
    setTheme(savedTheme);
    setFont(savedFont);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const order = JSON.parse(localStorage.getItem("currentOrder"));
      if (order) {
        setStatus(order.status);
        setTable(order.tableNumber);
      } else {
        setStatus("ausgeliefert");
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      {status === "ausgeliefert" ? (
        <>
          <h1 className="text-2xl font-bold mb-4">✅ Bestellung wurde ausgeliefert.</h1>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Zurück zur Speisekarte
          </button>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-4">Bestellstatus</h1>
          <p className="text-xl">
            Tisch {table} – Status: <strong>{status}</strong>
          </p>
        </>
      )}
    </div>
  );
}
