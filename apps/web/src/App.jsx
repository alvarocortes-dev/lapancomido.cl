import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ConfigProvider } from "antd";
import { RouterManager } from "./router/RouterManager";
import { SelectionProvider } from "./context/SelectionProvider";
import { SiteContentProvider } from "./context/SiteContentContext";

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 100,
        },
      }}
    >
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
      <SiteContentProvider>
        <SelectionProvider>
          <RouterManager />
        </SelectionProvider>
      </SiteContentProvider>
    </ConfigProvider>
  );
}

export default App;
