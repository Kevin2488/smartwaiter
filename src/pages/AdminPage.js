import { useEffect, useState } from "react";

export default function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [newCat, setNewCat] = useState("");
  const [tab, setTab] = useState("status");
  const [theme, setTheme] = useState("dark");
  const [font, setFont] = useState("inter");
  const [buttonColor, setButtonColor] = useState("#2563eb");
  const [textColor, setTextColor] = useState("#ffffff");
  const [history, setHistory] = useState([]);

  // Absicherung bei leerem localStorage
  useEffect(() => {
    if (!localStorage.getItem("menuData")) localStorage.setItem("menuData", "[]");
    if (!localStorage.getItem("theme")) localStorage.setItem("theme", "dark");
    if (!localStorage.getItem("font")) localStorage.setItem("font", "inter");
    if (!localStorage.getItem("allOrders")) localStorage.setItem("allOrders", "[]");
    if (!localStorage.getItem("orderHistory")) localStorage.setItem("orderHistory", "[]");

    setMenu(JSON.parse(localStorage.getItem("menuData")));
    setTheme(localStorage.getItem("theme"));
    setFont(localStorage.getItem("font"));
    setTextColor(localStorage.getItem("textColor") || "#ffffff");
    setButtonColor(localStorage.getItem("buttonColor") || "#2563eb");
    setOrders(JSON.parse(localStorage.getItem("allOrders")));
    setHistory(JSON.parse(localStorage.getItem("orderHistory")));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const updated = JSON.parse(localStorage.getItem("allOrders") || "[]");
      setOrders(updated);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = (index, newStatus) => {
    const updated = JSON.parse(localStorage.getItem("allOrders") || "[]");
    updated[index].status = newStatus;

    if (index === updated.length - 1) {
      localStorage.setItem("currentOrder", JSON.stringify(updated[index]));
    }

    if (newStatus === "Fertig") {
      const newHistory = [...history, updated[index]];
      localStorage.setItem("orderHistory", JSON.stringify(newHistory));
      setHistory(newHistory);
    }

    localStorage.setItem("allOrders", JSON.stringify(updated));
    const remainingOrders = updated.filter((o) => o.status !== "Fertig");
setOrders(remainingOrders);
localStorage.setItem("allOrders", JSON.stringify(remainingOrders));

  };

  const handleDeleteOrder = (index) => {
    const updated = [...orders];
    updated.splice(index, 1);
    setOrders(updated);
    localStorage.setItem("allOrders", JSON.stringify(updated));
  };

  const addCategory = () => {
    if (!newCat.trim()) return;
    const updated = [...menu, { category: newCat, items: [] }];
    setMenu(updated);
    setNewCat("");
    localStorage.setItem("menuData", JSON.stringify(updated));
  };

  const addItem = (catIndex) => {
    const name = prompt("Artikelname:");
    const price = parseFloat(prompt("Preis:"));
    if (!name || isNaN(price)) return;
    const updated = [...menu];
    updated[catIndex].items.push({ name, price, available: true });
    setMenu(updated);
    localStorage.setItem("menuData", JSON.stringify(updated));
  };

  const deleteItem = (catIndex, itemIndex) => {
    const updated = [...menu];
    updated[catIndex].items.splice(itemIndex, 1);
    setMenu(updated);
    localStorage.setItem("menuData", JSON.stringify(updated));
  };

  const toggleAvailability = (catIndex, itemIndex) => {
    const updated = [...menu];
    updated[catIndex].items[itemIndex].available = !updated[catIndex].items[itemIndex].available;
    setMenu(updated);
    localStorage.setItem("menuData", JSON.stringify(updated));
  };

  const updatePrice = (catIndex, itemIndex, newPrice) => {
    const updated = [...menu];
    updated[catIndex].items[itemIndex].price = parseFloat(newPrice);
    setMenu(updated);
    localStorage.setItem("menuData", JSON.stringify(updated));
  };

  const themes = {
    dark: { bg: "#111827", text: "#ffffff", btn: "#2563eb" },
    light: { bg: "#f3f4f6", text: "#111827", btn: "#10b981" },
    blue: { bg: "#e0f2fe", text: "#1e3a8a", btn: "#3b82f6" },
  };

  const applyTheme = (t) => {
    setTheme(t);
    setTextColor(themes[t].text);
    setButtonColor(themes[t].btn);
    localStorage.setItem("theme", t);
    localStorage.setItem("textColor", themes[t].text);
    localStorage.setItem("buttonColor", themes[t].btn);
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: themes[theme].bg, color: textColor, fontFamily: font }}>
      <div className="flex gap-3 mb-6">
        {["status", "menu", "design", "history"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded ${tab === t ? "bg-white text-black" : "bg-gray-600 text-white"}`}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === "status" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Aktuelle Bestellungen</h2>
          {orders.map((order, index) => (
            <div key={index} className="border p-4 mb-4 bg-white text-black rounded">
              <p className="font-semibold">Tisch: {order.tableNumber}</p>
              <ul>
                {order.items.map((item, i) => (
                  <li key={i}>{item.quantity}× {item.name} – {(item.price * item.quantity).toFixed(2)} €</li>
                ))}
              </ul>
              <p>Status: {order.status}</p>
              <div className="flex gap-2 mt-2">
                {["Ausstehend", "In Zubereitung", "Fertig"].map((s) => (
                  <button key={s} onClick={() => handleStatusChange(index, s)} className="bg-blue-600 text-white px-2 py-1 rounded">{s}</button>
                ))}
                <button onClick={() => handleDeleteOrder(index)} className="text-red-600 underline">Löschen</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "menu" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Speisekarte bearbeiten</h2>
          {menu.map((cat, catIndex) => (
            <div key={catIndex} className="mb-4">
              <h3 className="text-lg font-semibold">{cat.category}</h3>
              {cat.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex gap-2 items-center mb-2">
                  <span>{item.name}</span>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => updatePrice(catIndex, itemIndex, e.target.value)}
                    className="w-20 px-2 rounded text-black"
                  />
                  <button onClick={() => toggleAvailability(catIndex, itemIndex)} className="px-2 bg-yellow-300 rounded">
                    {item.available ? "Verfügbar" : "Ausverkauft"}
                  </button>
                  <button onClick={() => deleteItem(catIndex, itemIndex)} className="text-red-500">Löschen</button>
                </div>
              ))}
              <button onClick={() => addItem(catIndex)} className="mt-2 px-3 py-1 bg-green-500 text-white rounded">Artikel hinzufügen</button>
            </div>
          ))}
          <div className="mt-4">
            <input
              type="text"
              placeholder="Neue Kategorie"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              className="px-3 py-1 text-black rounded"
            />
            <button onClick={addCategory} className="ml-2 px-3 py-1 bg-blue-500 text-white rounded">Kategorie hinzufügen</button>
          </div>
        </div>
      )}

      {tab === "design" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Design anpassen</h2>
          <div className="flex gap-4 mb-4">
            {Object.keys(themes).map((t) => (
              <button key={t} onClick={() => applyTheme(t)} className="px-4 py-2 bg-gray-300 rounded text-black">{t}</button>
            ))}
          </div>
        </div>
      )}

      {tab === "history" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Bestellhistorie</h2>
          {history.length === 0 ? (
            <p>Keine abgeschlossenen Bestellungen.</p>
          ) : (
            history.map((order, index) => (
              <div key={index} className="border p-4 mb-4 rounded bg-white text-black">
                <p className="font-semibold">Tisch: {order.tableNumber}</p>
                <p>Datum: {new Date(order.created || new Date()).toLocaleString()}</p>
                <ul>
                  {order.items.map((item, i) => (
                    <li key={i}>{item.quantity}× {item.name} – {(item.price * item.quantity).toFixed(2)} €</li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
