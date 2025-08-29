import type {
  RouteObject
} from "react-router-dom";
import {
  lazy, Suspense
} from "react";

const AuthLayout =
  lazy(() =>
    import("../../layouts/auth/AuthLayout.tsx"));

const Loading =
  lazy(() =>
    import("../../components/load/loading/Loading.tsx"));

const Login =
  lazy(() =>
    import("./pages/login/Login.tsx"));

const AuthRoutes: RouteObject[] = [
  {
    path: "/login",
    element: (
      <Suspense
        fallback={<Loading />}>
        <AuthLayout>
          <Login />
        </AuthLayout>
      </Suspense>
    ),
  }
];

export default AuthRoutes;
