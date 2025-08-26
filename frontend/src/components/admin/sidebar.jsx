import { FaTachometerAlt, FaUsers, FaBox, FaShoppingCart, FaTags } from "react-icons/fa";
import { BiSolidCategory } from "react-icons/bi";

const Sidebar = ({ activePage, setActivePage, iconAnimation, setIconAnimation }) => {
  const menu = [
    { key: "dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { key: "products", label: "Products", icon: <FaBox /> },
    { key: "users", label: "Users", icon: <FaUsers /> },
    { key: "orders", label: "Orders", icon: <FaShoppingCart /> },
    { key: "categories", label: "Categories", icon: <BiSolidCategory /> },
  ];

  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col fixed">
      <div className="text-2xl font-bold p-6 border-b border-gray-700">
        Admin Panel
      </div>
      <div className="flex-1">
        {menu.map((item) => (
          <button
            key={item.key}
            onMouseOver={() => setIconAnimation(item.key)}
            onMouseLeave={() => setIconAnimation(null)}
            onClick={() => setActivePage(item.key)}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-gray-700 ${
              activePage === item.key ? "bg-gray-700" : ""
            }`}
          >
            <div className={`${iconAnimation === item.key ? 'animate-bounce' : 'animate-none'}`}>{item.icon}</div>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
