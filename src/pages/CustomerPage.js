import { useEffect, useState } from "react";

export default function CustomerPage() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [tableNumber, setTableNumber] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [font, setFont] = useState("inter");
  const [buttonColor, setButtonColor] = useState("#2563eb");
  const [textColor, setTextColor] = useState("#ffffff");
  const [currentOrder, setCurrentOrder] = useState(null);

  useEffect(() => {
    const loadData = () => {
      setMenu(JSON.parse(localStorage.getItem("menuData") || "[]"));
      setTheme(localStorage.getItem("theme") || "dark");
      setFont(localStorage.getItem("font") || "inter");
      setButtonColor(localStorage.getItem("buttonColor") || "#2563eb");
      setTextColor(localStorage.getItem("textColor") || "#ffffff");
    };
    loadData();

    const listener = () => loadData();
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, []);

  // ✅ Live-Bestellstatus nur prüfen, wenn submitted == true
  useEffect(() => {
    if (!submitted) return;
    const interval = setInterval(() => {
      const updatedOrder = JSON.parse(localStorage.getItem("currentOrder") || "null");
      if (updatedOrder) {
        setCurrentOrder(updatedOrder);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [submitted]);

  const addToCart = (item) => {
    const existing = cart.find((i) => i.name === item.name);
    if (existing) {
      setCart(cart.map((i) =>
        i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemName) => {
    setCart(cart.filter((i) => i.name !== itemName));
  };

  const updateQuantity = (itemName, change) => {
    setCart(cart.map((i) => {
      if (i.name === itemName) {
        const newQty = i.quantity + change;
        return newQty > 0 ? { ...i, quantity: newQty } : i;
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = () => {
    if (!tableNumber || cart.length === 0) return;
    const allOrders = JSON.parse(localStorage.getItem("allOrders") || "[]");
    const newOrder = {
      tableNumber,
      items: cart,
      status: "Ausstehend",
      created: new Date().toISOString(),
    };
    allOrders.push(newOrder);
    localStorage.setItem("allOrders", JSON.stringify(allOrders));
    localStorage.setItem("currentOrder", JSON.stringify(newOrder));
    setSubmitted(true);
    setCart([]);
    setCurrentOrder(newOrder);
  };

  return (
    <div
      className={`min-h-screen p-6 font-${font}`}
      style={{
        backgroundColor: theme === "dark" ? "#111827" : "#f3f4f6",
        color: textColor,
      }}
    >
      {!submitted ? (
        <>
          <h1 className="text-2xl font-bold mb-4">Speisekarte</h1>
          {menu.map((cat, catIndex) => (
            <div key={catIndex} className="mb-4">
              <h2 className="text-xl font-semibold mb-2">{cat.category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cat.items.map(
                  (item, itemIndex) =>
                    item.available && (
                      <div
                        key={itemIndex}
                        className="border p-4 rounded bg-white text-black"
                      >
                        <p className="font-semibold">{item.name}</p>
                        <p>{item.price.toFixed(2)} €</p>
                        <button
                          onClick={() => addToCart(item)}
                          className="mt-2 px-4 py-1 rounded"
                          style={{ backgroundColor: buttonColor, color: "#fff" }}
                        >
                          Hinzufügen
                        </button>
                      </div>
                    )
                )}
              </div>
            </div>
          ))}

          <div className="mt-6">
            <h2 className="text-xl font-bold mb-2">Warenkorb</h2>
            {cart.length === 0 ? (
              <p>Der Warenkorb ist leer.</p>
            ) : (
              <>
                <ul className="mb-2">
                  {cart.map((item, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center mb-2"
                    >
                      <span>
                        {item.name} – {item.price.toFixed(2)} €
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.name, -1)}
                          className="px-2 bg-gray-300 text-black rounded"
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.name, 1)}
                          className="px-2 bg-gray-300 text-black rounded"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.name)}
                          className="text-red-500 ml-2"
                        >
                          Entfernen
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="font-semibold mb-2">
                  Gesamt: {total.toFixed(2)} €
                </p>
                <input
                  type="text"
                  placeholder="Tischnummer"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="p-2 rounded text-black mb-2 w-full max-w-sm"
                />
                <br />
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded"
                  style={{ backgroundColor: buttonColor, color: "#fff" }}
                >
                  Bestellung abschicken
                </button>
              </>
            )}
          </div>
        </>
      ) : (
        <div className="text-center">
          {currentOrder ? (
            <>
              <h2 className="text-2xl font-bold mb-4">Bestellstatus</h2>
              <p className="mb-2">Tisch: {currentOrder.tableNumber}</p>
              <ul className="mb-2">
                {currentOrder.items.map((item, index) => (
                  <li key={index}>
                    {item.quantity}× {item.name} –{" "}
                    {(item.price * item.quantity).toFixed(2)} €
                  </li>
                ))}
              </ul>
              <p>Status: {currentOrder.status}</p>
              {currentOrder.status === "Fertig" && (
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-4 py-2 rounded"
                  style={{ backgroundColor: buttonColor, color: "#fff" }}
                >
                  Zurück zur Speisekarte
                </button>
              )}
            </>
          ) : (
            <>
              <p className="mb-2">Bestellung ausgeliefert.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-4 py-2 rounded"
                style={{ backgroundColor: buttonColor, color: "#fff" }}
              >
                Zurück zur Speisekarte
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
