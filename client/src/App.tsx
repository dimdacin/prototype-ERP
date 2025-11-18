import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSelector from "@/components/LanguageSelector";
import Dashboard from "@/pages/Dashboard";
import Chantiers from "@/pages/Chantiers";
import ChantierDetails from "@/pages/ChantierDetails";
import Planning from "@/pages/Planning";
import PlanDeCharge from "@/pages/PlanDeCharge";
import Salaries from "@/pages/Salaries";
import Equipements from "@/pages/Equipements";
import Achats from "@/pages/Achats";
import Finances from "@/pages/Finances";
import Documentation from "@/pages/Documentation";
import NotFound from "@/pages/not-found";
import "./i18n/config";
import { useTranslation } from "react-i18next";

function Router() {
  const { t } = useTranslation();
  
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/chantiers/:id" component={ChantierDetails} />
      <Route path="/chantiers" component={Chantiers} />
      <Route path="/salaries" component={Salaries} />
      <Route path="/equipements" component={Equipements} />
      <Route path="/planning" component={Planning} />
      <Route path="/plan-de-charge" component={PlanDeCharge} />
      <Route path="/achats" component={Achats} />
      <Route path="/finances" component={Finances} />
      <Route path="/budgets" component={() => <div className="p-6"><h1 className="text-2xl font-semibold">{t('nav.budgets')} - {t('common.inDevelopment')}</h1></div>} />
      <Route path="/documentation" component={Documentation} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties} defaultOpen={true}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <header className="flex items-center justify-between p-3 border-b">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <div className="flex items-center gap-2">
                  <LanguageSelector />
                  <ThemeToggle />
                </div>
              </header>
              <main className="flex-1 overflow-auto">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
