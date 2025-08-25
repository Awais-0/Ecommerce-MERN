export const MyButton = ({ onClick, value, customStyling = '' }) => {
  return (
    <button className={`px-3 py-2 rounded-md text-white shadow-gray-800 shadow-md hover:bg-blue-700 hover:cursor-pointer ${customStyling}`} onClick={onClick}>{value}</button>
  );
};
