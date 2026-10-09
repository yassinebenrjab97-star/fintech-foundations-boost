import { Suspense, lazy } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import { PublicLayout, LoadingScreen } from "@/components/site";
import Home from "./pages/home";

const Reclamation = lazy(() => import("./pages/reclamation"));
const Suivi = lazy(() => import("./pages/suivi"));
const Reforme = lazy(() => import("./pages/reforme"));
const Admin = lazy(() => import("./pages/admin"));
const NotFound = lazy(() => import("./pages/not-found"));

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } } });

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner position="top-center" />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/reclamation" element={<Reclamation />} />
                  <Route path="/suivi" element={<Suivi />} />
                  <Route path="/materiel-reforme" element={<Reforme />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
                <Route path="/admin/*" element={<Admin />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
