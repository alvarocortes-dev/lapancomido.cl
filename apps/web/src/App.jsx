import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RouterManager } from "./router/RouterManager";
import { SelectionProvider } from "./context/SelectionProvider";

function App() {
  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
      <SelectionProvider>
        <RouterManager />
      </SelectionProvider>
    </>
  );
}

export default App;
