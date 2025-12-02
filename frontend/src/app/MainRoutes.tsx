import AuthRoutes from "../modules/auth/routes.tsx";
import mainRoutes from "../modules/indexRoutes.tsx";
import type { RouteObject } from "react-router-dom";
import { NotFound } from "../components";
import { lazy, Suspense } from "react";

const PrivateRoute = lazy(() => import("../components/load/privateRoute/PrivateRoute"));
const GlobalLoading = lazy(() => import("../components/load/globalLoading/GlobalLoading.tsx"));
const MainLayout = lazy(() => import("../layouts/main/MainLayout"));

const routes: RouteObject[] = [
  // 🔹 Rutas públicas (login, register, forgot...)
  ...AuthRoutes,
  // 🔹 Rutas privadas (dashboard)
  {
    path: "/",
    element: (
      <Suspense fallback={<GlobalLoading />}>
        <PrivateRoute>
          <MainLayout />
        </PrivateRoute>
      </Suspense>
    ),
    children: [...mainRoutes]   // SIN AUTH AQUÍ
  },
  // 🔹 Ruta NotFound
  {
    path: "*",
    element: <NotFound />
  }
];

export default routes;
