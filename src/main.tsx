import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { DashboardPage } from "@/pages/DashboardPage";
import { CampaignsPage } from "@/pages/CampaignsPage";
import { AgentsPage } from "@/pages/AgentsPage";
import { CallListsPage } from "@/pages/CallListsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { CampaignDetailPage } from "@/pages/CampaignDetailPage";
import { CallListDetailPage } from "@/pages/CallListDetailPage";
import { BillingPage } from "@/pages/BillingPage";
import { UserDashboardPage } from "@/pages/UserDashboardPage";
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "user-dashboard", element: <UserDashboardPage /> },
      { path: "campaigns", element: <CampaignsPage /> },
      { path: "campaigns/:campaignId", element: <CampaignDetailPage /> },
      { path: "agents", element: <AgentsPage /> },
      { path: "call-lists", element: <CallListsPage /> },
      { path: "call-lists/:callListId", element: <CallListDetailPage /> },
      { path: "billing", element: <BillingPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  }
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
)