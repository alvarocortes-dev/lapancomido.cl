// src/pages/RegisterPage.jsx
import { RegisterForm } from "../components/RegisterForm";
import { Link } from "react-router-dom";
import promoData from "../data/promo.json";

export const RegisterPage = () => {
  const promoVideo = new URL(
    `../assets/videos/${promoData.register}`,
    import.meta.url
  ).href;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-[850px] bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Usamos flex y items-stretch para que ambas columnas tengan el mismo alto */}
        <div className="flex flex-col lg:flex-row items-stretch min-h-[450px] lg:min-h-[500px]">
          {/* Columna izquierda: formulario de registro */}
          <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
            <h1 className="text-2xl sm:text-3xl font-semibold mb-6 text-black text-center">
              Registro
            </h1>
            <RegisterForm />
            <div className="mt-4 text-sm text-gray-600 text-center">
              <p>
                ¿Ya tienes cuenta?{" "}
                <Link
                  to="/auth/login"
                  className="text-black hover:underline font-medium"
                >
                  Inicia Sesión
                </Link>
              </p>
            </div>
          </div>
          {/* Columna derecha: video, que se ajusta al alto de la columna izquierda */}
          <div className="hidden lg:flex lg:w-1/2">
            <div className="w-full h-full">
              <video
                src={promoVideo}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
