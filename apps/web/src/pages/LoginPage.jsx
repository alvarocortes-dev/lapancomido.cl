// src/pages/LoginPage.jsx

import { LoginForm } from "../components/LoginForm";
import { Link } from "react-router-dom";
import promoData from "../data/promo.json";

export const LoginPage = () => {
  const promoVideo = new URL(
    `../assets/videos/${promoData.login}`,
    import.meta.url
  ).href;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      {/* 
        Contenedor responsive que mantiene proporciones adecuadas.
        En móvil es full-width, en desktop tiene max-width.
      */}
      <div className="w-full max-w-[850px] bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[400px] lg:min-h-[500px]">
          {/* Video - solo visible en desktop */}
          <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-white">
            <video
              src={promoVideo}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>

          {/* Formulario de login */}
          <div className="w-full lg:w-1/2 bg-gray-100 flex items-center justify-center p-6 sm:p-8">
            <div className="w-full max-w-md">
              <h1 className="text-2xl sm:text-3xl font-semibold mb-6 text-black text-center">
                Inicia Sesión
              </h1>

              <LoginForm />

              <div className="mt-4 text-sm text-gray-600 text-center">
                <p>
                  ¿Aún no tienes cuenta?{" "}
                  <Link
                    to="/auth/register"
                    className="text-black hover:underline font-medium"
                  >
                    Regístrate Aquí
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
