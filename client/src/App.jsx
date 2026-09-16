import React, { Suspense, lazy } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import PrivateRoute from "./components/common/PrivateRoute";
import Layout from "./components/layout/Layout";
import Spinner from "./components/common/Spinner";
import SalesInvoicePage from "./pages/sales/SalesInvoice";
import ViewInvoicePage from "./pages/sales/ViewInvoicePage";
import ViewCreditNotePage from "./pages/creditNote/ViewCreditNotePage";
import EditInvoicePage from "./pages/sales/EditInvoicePage";
import CreateSalesInvoicePage from "./pages/sales/CreateInvoice";
import DebitNotePage from "./pages/sales/DebitNote";
import CreditInvoiceNote from "./pages/creditNote/CreditNoteInvoice";
import ConvertedQuotationsPage from "./pages/convertedQuotation/ConvertedQuotationsPage";
import ViewConvertedQuotationPage from "./pages/convertedQuotation/ViewConvertedQuotationPage";
import SalesQuotationsPage from "./pages/salesQuotation/SalesQuotationsPage";
import CreateSalesQuotationPage from "./pages/salesQuotation/CreateSalesQuotationPage";
import ViewSalesQuotationPage from "./pages/salesQuotation/ViewSalesQuotationPage";
import CategoryPage from "./pages/inventory/CategoryPage";
import GodownsPage from "./pages/inventory/GodownsPage";
import ProductPage from "./pages/inventory/Product";
import SubCategoryPage from "./pages/inventory/SubCategory";
import SalesSettingPage from "./pages/SalesSettingPage";
import CreateCreditNotePage from "./pages/creditNote/CreateCreditNotePage";
import EditCreditNotePage from "./pages/creditNote/EditCreditNotePage";
import DeliveryChallanPage from "./pages/deliveryChallan/DeliveryChallanPage";
import CreateDeliveryChallanPage from "./pages/deliveryChallan/CreateDeliveryChallanPage";
// import EditDeliveryChallanPage from "./pages/deliveryChallan/EditDeliveryChallanPage";
import ViewDeliveryChallanPage from "./pages/deliveryChallan/ViewDeliveryChallanPage";
import Account from "./pages/AccountPage";
import SalesTeamDashboard from "./pages/SalesTeamDashboard";
import ServicesTeamDashboard from "./pages/ServiceTeamDashboard";
import DeliveryTeamDashboard from "./pages/DeliveryTeamDashboard";
import HRDashboard from "./pages/HRDashboard";
import { getHomeRoute } from "./config/roles";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const TeamUsersPage = lazy(() => import("./pages/TeamUsersPage"));
const ClientsPage = lazy(() => import("./pages/ClientsPage"));
const ClientDetailPage = lazy(() => import("./pages/ClientDetailPage"));
const FollowUpsPage = lazy(() => import("./pages/FollowUpsPage"));
const InteractionsPage = lazy(() => import("./pages/InteractionsPage"));
const ProspectsPage = lazy(() => import("./pages/ProspectsPage"));
const BillQuotationPage = lazy(() => import("./pages/BillQuotationPage"));
const InventoryPage = lazy(() => import("./pages/InventoryPage"));
const SavedQuotationsPage = lazy(() => import("./pages/SavedQuotationsPage"));
const ActivityHistoryPage = lazy(() => import("./pages/ActivityHistoryPage"));
const CustomerDetailsPage = lazy(() => import("./pages/CustomerDetailsPage"));
const PurchaseHistoryPage = lazy(() => import("./pages/PurchaseHistoryPage"));
const EmployeesPage = lazy(() => import("./pages/EmployeesPage"));
const FsmRequestsPage = lazy(() => import("./pages/FsmRequestsPage"));
const FsmJobsPage = lazy(() => import("./pages/FsmJobsPage"));
const FsmLeavesPage = lazy(() => import("./pages/FsmLeavesPage"));
const EmployeeDashboardPage = lazy(
  () => import("./pages/EmployeeDashboardPage"),
);
const DistributionPage = lazy(() => import("./pages/DistributionPage"));
const CampaignsPage = lazy(() => import("./pages/CampaignsPage"));
const WebsiteUsersPage = lazy(() => import("./pages/WebsiteUsersPage"));
const WebsiteOrdersPage = lazy(() => import("./pages/WebsiteOrdersPage"));
const WebsiteBookingsPage = lazy(() => import("./pages/WebsiteBookingsPage"));
const WebsiteContactsPage = lazy(() => import("./pages/WebsiteContactsPage"));
const B2CHubPage = lazy(() => import("./pages/B2CHubPage"));
const B2COrdersPage = lazy(() => import("./pages/B2COrdersPage"));
const B2CServicesPage = lazy(() => import("./pages/B2CServicesPage"));
const B2CServiceBookingsPage = lazy(() =>
  import("./pages/B2CServiceBookingsPage")
);
const B2CReviewsPage = lazy(() => import("./pages/B2CReviewsPage"));
const B2CBannersPage = lazy(() => import("./pages/B2CBannersPage"));

const websiteSyncModulesEnabled =
  String(
    import.meta.env.VITE_ENABLE_WEBSITE_SYNC_MODULES || "true",
  ).toLowerCase() !== "false";

function RoleBasedHome() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getHomeRoute(user.role)} replace />;
}

// Generic role gate: Super Admin always passes. Everyone else must have a
// role listed in `allow`. Anyone who doesn't qualify is bounced back to
// their own home dashboard instead of seeing a blank/forbidden page.
function RoleRoute({ allow = [] }) {
  const { user, isSuperAdmin } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "employee") {
    return <Navigate to="/employee-dashboard" replace />;
  }

  if (isSuperAdmin || allow.includes(user.role)) {
    return <Outlet />;
  }

  return <Navigate to={getHomeRoute(user.role)} replace />;
}

// Role sets reused across routes below, one per department module.
const ROLES = {
  superAdminOnly: [],
  sales: ["sales"],
  account: ["account"],
  service: ["service"],
  delivery: ["delivery"],
  hr: ["hr"],
  b2c: ["b2c"],
  website: ["website"],
  inventory: ["account", "b2c", "delivery"],
  fsm: ["service", "delivery", "hr"],
  anyTeam: ["account", "sales", "service", "delivery", "hr", "b2c", "website"],
};

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: "8px", fontSize: "14px" },
          }}
        />
        <Suspense fallback={<Spinner text="Loading page..." />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<RoleBasedHome />} />
              <Route
                path="employee-dashboard"
                element={<EmployeeDashboardPage />}
              />

              {/* Super Admin only */}
              <Route element={<RoleRoute allow={ROLES.superAdminOnly} />}>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="user-approvals" element={<TeamUsersPage />} />
              </Route>

              {/* Any team lead + Super Admin: invite/approve colleagues */}
              <Route element={<RoleRoute allow={ROLES.anyTeam} />}>
                <Route path="team-users" element={<TeamUsersPage />} />
              </Route>

              {/* Sales Team */}
              <Route element={<RoleRoute allow={ROLES.sales} />}>
                <Route path="sales-team" element={<SalesTeamDashboard />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="clients/:id" element={<ClientDetailPage />} />
                <Route path="customer-details" element={<CustomerDetailsPage />} />
                <Route path="followups" element={<FollowUpsPage />} />
                <Route path="interactions" element={<InteractionsPage />} />
                <Route path="campaigns" element={<CampaignsPage />} />
                <Route path="bill-quotation" element={<BillQuotationPage />} />
              </Route>

              {/* Account Team */}
              <Route element={<RoleRoute allow={ROLES.account} />}>
                <Route path="account" element={<Account />} />
                <Route path="invoice" element={<SalesInvoicePage />} />
                <Route path="invoice/view/:id" element={<ViewInvoicePage />} />
                <Route path="invoice/edit/:id" element={<EditInvoicePage />} />
                <Route path="invoice/create" element={<CreateSalesInvoicePage />} />
                <Route path="sales-settings" element={<SalesSettingPage />} />
                <Route path="converted-quotations" element={<ConvertedQuotationsPage />} />
                <Route path="converted-quotations/view/:id" element={<ViewConvertedQuotationPage />} />
                <Route path="sales-quotations" element={<SalesQuotationsPage />} />
                <Route path="sales-quotations/create" element={<CreateSalesQuotationPage />} />
                <Route path="sales-quotations/view/:id" element={<ViewSalesQuotationPage />} />
                <Route path="debit-note" element={<DebitNotePage />} />
                <Route path="credit-note" element={<CreditInvoiceNote />} />
                <Route path="credit-note/view/:id" element={<ViewCreditNotePage />} />
                <Route path="credit-note/create" element={<CreateCreditNotePage />} />
                <Route path="credit-note/edit/:id" element={<EditCreditNotePage />} />
                <Route path="history" element={<ActivityHistoryPage />} />
                <Route path="purchase-history" element={<PurchaseHistoryPage />} />
                <Route path="saved-quotations" element={<SavedQuotationsPage />} />
              </Route>

              {/* Delivery Challan is shared between Account (creates/bills it)
                  and Delivery (fulfils it) */}
              <Route element={<RoleRoute allow={[...ROLES.account, ...ROLES.delivery]} />}>
                <Route path="delivery-challan" element={<DeliveryChallanPage />} />
                <Route path="delivery-challan/view/:id" element={<ViewDeliveryChallanPage />} />
                <Route path="delivery-challan/edit/:id" element={<CreateDeliveryChallanPage />} />
                <Route path="delivery-challan/create" element={<CreateDeliveryChallanPage />} />
              </Route>

              {/* Inventory: shared by Account, B2C and Delivery */}
              <Route element={<RoleRoute allow={ROLES.inventory} />}>
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="inventory/categories" element={<CategoryPage />} />
                <Route path="inventory/subcategories" element={<SubCategoryPage />} />
                <Route path="inventory/godowns" element={<GodownsPage />} />
                <Route path="inventory/products" element={<ProductPage />} />
              </Route>

              {/* Service Team */}
              <Route element={<RoleRoute allow={ROLES.service} />}>
                <Route path="services-team" element={<ServicesTeamDashboard />} />
                <Route path="service-management" element={<ProspectsPage />} />
                <Route
                  path="prospects"
                  element={<Navigate to="/service-management" replace />}
                />
              </Route>

              {/* Delivery Team */}
              <Route element={<RoleRoute allow={ROLES.delivery} />}>
                <Route path="delivery-team" element={<DeliveryTeamDashboard />} />
                <Route path="distribution" element={<DistributionPage />} />
              </Route>

              {/* HR Team */}
              <Route element={<RoleRoute allow={ROLES.hr} />}>
                <Route path="hr" element={<HRDashboard />} />
                <Route path="employees" element={<EmployeesPage />} />
              </Route>

              {/* FSM: shared by Service, Delivery and HR */}
              <Route element={<RoleRoute allow={ROLES.fsm} />}>
                <Route path="fsm-requests" element={<FsmRequestsPage />} />
                <Route path="fsm-jobs" element={<FsmJobsPage />} />
                <Route path="fsm-leaves" element={<FsmLeavesPage />} />
              </Route>

              {/* B2C Team */}
              <Route element={<RoleRoute allow={ROLES.b2c} />}>
                <Route path="b2c" element={<B2CHubPage />} />
                <Route path="b2c/orders" element={<B2COrdersPage />} />
                <Route path="b2c/services" element={<B2CServicesPage />} />
                <Route path="b2c/service-bookings" element={<B2CServiceBookingsPage />} />
                <Route path="b2c/reviews" element={<B2CReviewsPage />} />
                <Route path="b2c/banners" element={<B2CBannersPage />} />
              </Route>

              {/* Website Team */}
              {websiteSyncModulesEnabled && (
                <Route element={<RoleRoute allow={ROLES.website} />}>
                  <Route path="website-users" element={<WebsiteUsersPage />} />
                  <Route path="website-orders" element={<WebsiteOrdersPage />} />
                  <Route path="website-bookings" element={<WebsiteBookingsPage />} />
                  <Route path="website-contacts" element={<WebsiteContactsPage />} />
                </Route>
              )}
            </Route>
            <Route path="*" element={<RoleBasedHome />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}


export default App;
