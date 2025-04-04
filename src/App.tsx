
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { KeyManagementProvider } from "./contexts/KeyManagementContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import CarsList from "./pages/CarsList";
import CarDetails from "./pages/CarDetails";
import KeyDetails from "./pages/KeyDetails";
import Reports from "./pages/Reports";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <KeyManagementProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/cars" element={<Layout><CarsList /></Layout>} />
            <Route path="/missing-keys" element={<Layout><CarsList filter="missing-keys" /></Layout>} />
            <Route path="/issued-keys" element={<Layout><CarsList filter="issued-keys" /></Layout>} />
            <Route path="/recovered-keys" element={<Layout><CarsList filter="recovered-keys" /></Layout>} />
            <Route path="/cars/:carId" element={<Layout><CarDetails /></Layout>} />
            <Route path="/cars/:carId/keys/:keyId" element={<Layout><KeyDetails /></Layout>} />
            <Route path="/reports" element={<Layout><Reports /></Layout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </KeyManagementProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
