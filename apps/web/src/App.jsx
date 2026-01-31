import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthProvider";
import { RouterManager } from "./router/RouterManager";
import { CartProvider } from "./context/CartProvider";
import { ProductProvider } from "./context/ProductProvider";
import { SelectionProvider } from "./context/SelectionProvider";

function App() {
  return (
    <>
      <ToastContainer />
      <AuthProvider>
        <CartProvider>
          <SelectionProvider>
            <ProductProvider>
              <RouterManager />
            </ProductProvider>
          </SelectionProvider>
        </CartProvider>
      </AuthProvider>
    </>
  );
}

export default App;
