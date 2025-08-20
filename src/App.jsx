import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [rows, setRows] = useState([]);
  const [fileSHA, setFileSHA] = useState("");
  const [loading, setLoading] = useState(true);

  // Load environment variables
  const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
  const OWNER = import.meta.env.VITE_OWNER;
  const REPO = import.meta.env.VITE_REPO;
  const FILE_PATH = import.meta.env.VITE_FILE_PATH;

  // Fetch JSON data from GitHub
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
          {
            headers: { Authorization: `token ${GITHUB_TOKEN}` },
          }
        );
        const data = await res.json();
        setFileSHA(data.sha);
        setRows(JSON.parse(atob(data.content)));
      } catch (err) {
        alert("Failed to load data: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [OWNER, REPO, FILE_PATH, GITHUB_TOKEN]);

  // Add new row
  const addRow = () => {
    const newRow = {
      id: Date.now(),
      Username: "",
      adno: "",
      Name: "",
      Guardian: "",
      address: "",
      dateofbirth: "",
      bloodgroup: "",
      phone: "",
      Password: "",
      Photo: "",
    };
    setRows([...rows, newRow]);
  };

  // Delete row
  const deleteRow = (index) => {
    const updatedRows = [...rows];
    updatedRows.splice(index, 1);
    setRows(updatedRows);
  };

  // Handle input changes
  const handleChange = (index, key, value) => {
    const updatedRows = [...rows];
    updatedRows[index][key] = value;
    setRows(updatedRows);
  };

  // Save changes to GitHub
  const saveChanges = async () => {
    try {
      const base64Content = btoa(JSON.stringify(rows, null, 2));
      const res = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
        {
          method: "PUT",
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: "Update JSON via React App",
            content: base64Content,
            sha: fileSHA,
          }),
        }
      );
      const result = await res.json();
      if (result.content) {
        alert("✅ JSON updated successfully!");
        setFileSHA(result.content.sha);
      } else {
        alert("❌ Failed: " + JSON.stringify(result));
      }
    } catch (err) {
      alert("Error saving: " + err.message);
    }
  };

  if (loading) return <p className="text-center text-gray-600">Loading...</p>;

  return (
    <div className="p-6 font-sans max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Manage JSON Data</h1>

      <div className="space-x-3 mb-4">
        <button
          onClick={addRow}
          className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
        >
          ➕ Add New
        </button>
        <button
          onClick={saveChanges}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          💾 Save Changes
        </button>
      </div>

      <div className="overflow-x-auto shadow rounded-lg">
        <table className="w-full border border-gray-300 text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              {[
                "id",
                "Username",
                "adno",
                "Name",
                "Guardian",
                "address",
                "dateofbirth",
                "bloodgroup",
                "phone",
                "Password",
                "Photo",
                "Actions",
              ].map((col) => (
                <th key={col} className="px-4 py-3 border border-gray-300">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.id}
                className="odd:bg-white even:bg-gray-50 hover:bg-gray-100"
              >
                {Object.keys(row).map((key) => (
                  <td key={key} className="border px-3 py-2">
                    <input
                      value={row[key] || ""}
                      onChange={(e) => handleChange(index, key, e.target.value)}
                      className="w-full px-2 py-1 border rounded-md focus:ring focus:ring-blue-200"
                    />
                  </td>
                ))}
                <td className="border px-3 py-2">
                  <button
                    onClick={() => deleteRow(index)}
                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                  >
                    ❌ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
