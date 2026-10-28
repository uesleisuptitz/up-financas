import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { ResponsiveDrawer } from "./components";
import { AnnualYearProvider, HideValuesProvider, HomePeriodProvider, useAuth } from "./contexts";
import { Annual, Home, Login, Planning } from "./pages";

function Router() {
  const { isLogged } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {!isLogged ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <Route element={<PrivateRoutes />}>
            <Route index element={<Home />} />
            <Route path="/mensal" element={<Planning />} />
            <Route path="/planejamento" element={<Navigate to="/mensal" replace />} />
            <Route path="/anual" element={<Annual />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}

function PrivateRoutes() {
  const { isLogged } = useAuth();
  const location = useLocation();

  if (!isLogged) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <HomePeriodProvider>
      <AnnualYearProvider>
        <HideValuesProvider>
          <ResponsiveDrawer>
            <Outlet />
          </ResponsiveDrawer>
        </HideValuesProvider>
      </AnnualYearProvider>
    </HomePeriodProvider>
  );
}

export default Router;
