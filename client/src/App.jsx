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

const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ClientsPage = lazy(() => import("./pages/ClientsPage"));
const ClientDetailPage = lazy(() => import("./pages/ClientDetailPage"));
const FollowUpsPage = lazy(() => import("./pages/FollowUpsPage"));
const InteractionsPage = lazy(() => import("./pages/InteractionsPage"));
const ProspectsPage = lazy(() => import("./pages/ProspectsPage"));
const BillQuotationPage = lazy(() => import("./pages/BillQuotationPage"));
const InventoryPage = lazy(() => import("./pages/InventoryPage"));
const SavedQuotationsPage = lazy(() => import("./pages/SavedQuotationsPage"));
const CustomerDetailsPage = lazy(() => import("./pages/CustomerDetailsPage"));
const PurchaseHistoryPage = lazy(() => import("./pages/PurchaseHistoryPage"));
const EmployeesPage = lazy(() => import("./pages/EmployeesPage"));
const FsmRequestsPage = lazy(() => import("./pages/FsmRequestsPage"));
const FsmJobsPage = lazy(() => import("./pages/FsmJobsPage"));
const EmployeeDashboardPage = lazy(
  () => import("./pages/EmployeeDashboardPage"),
);
const DistributionPage = lazy(() => import("./pages/DistributionPage"));
const CampaignsPage = lazy(() => import("./pages/CampaignsPage"));
const WebsiteUsersPage = lazy(() => import("./pages/WebsiteUsersPage"));
const WebsiteOrdersPage = lazy(() => import("./pages/WebsiteOrdersPage"));
const WebsiteBookingsPage = lazy(() => import("./pages/WebsiteBookingsPage"));
const WebsiteContactsPage = lazy(() => import("./pages/WebsiteContactsPage"));

const websiteSyncModulesEnabled =
  String(
    import.meta.env.VITE_ENABLE_WEBSITE_SYNC_MODULES || "true",
  ).toLowerCase() !== "false";

function RoleBasedHome() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={user.role === "employee" ? "/employee-dashboard" : "/dashboard"}
      replace
    />
  );
}

function AdminOnlyRoute() {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/employee-dashboard" replace />;
  }

  return <Outlet />;
}

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
              <Route element={<AdminOnlyRoute />}>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="clients/:id" element={<ClientDetailPage />} />
                <Route
                  path="customer-details"
                  element={<CustomerDetailsPage />}
                />
                <Route
                  path="purchase-history"
                  element={<PurchaseHistoryPage />}
                />
                <Route path="bill-quotation" element={<BillQuotationPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="invoice" element={<SalesInvoicePage />} />

                <Route path="invoice/view/:id" element={<ViewInvoicePage />} />

                <Route path="invoice/edit/:id" element={<EditInvoicePage />} />

                <Route
                  path="invoice/create"
                  element={<CreateSalesInvoicePage />}
                />
                <Route
                    path="sales-settings"
                    element={<SalesSettingPage />}
                  />

                <Route path="/debit-note" element={<DebitNotePage />} />

                <Route path="/credit-note" element={<CreditInvoiceNote />} />

                <Route
                  path="credit-note/view/:id"
                  element={<ViewCreditNotePage />}
                />
                <Route
                  path="/credit-note/create"
                  element={<CreateCreditNotePage />}
                />
                <Route
                  path="/delivery-challan"
                  element={<DeliveryChallanPage />}
                />

                <Route
                  path="delivery-challan/view/:id"
                  element={<ViewDeliveryChallanPage />}
                />
                <Route
                  path="/delivery-challan/edit/:id"
                  element={<CreateDeliveryChallanPage />}
                />

                <Route
                  path="/delivery-challan/create"
                  element={<CreateDeliveryChallanPage />}
                />

                {/* <Route
                  path="/delivery-challan/edit/:id"
                  element={<EditDeliveryChallanPage />}
                /> */}
                <Route
                  path="/credit-note/edit/:id"
                  element={<EditCreditNotePage />}
                />
                <Route
                  path="/inventory/categories"
                  element={<CategoryPage />}
                />

                 <Route
                  path="/inventory/subcategories"
                  element={<SubCategoryPage />}
                />

                <Route path="/inventory/godowns" element={<GodownsPage />} />

                 <Route path="/inventory/products" element={<ProductPage />} />

                <Route
                  path="saved-quotations"
                  element={<SavedQuotationsPage />}
                />
                <Route
                  path="saved-quotations"
                  element={<SavedQuotationsPage />}
                />
                <Route path="followups" element={<FollowUpsPage />} />
                <Route path="interactions" element={<InteractionsPage />} />
                <Route path="service-management" element={<ProspectsPage />} />
                <Route
                  path="prospects"
                  element={<Navigate to="/service-management" replace />}
                />
                <Route path="employees" element={<EmployeesPage />} />
                <Route path="fsm-requests" element={<FsmRequestsPage />} />
                <Route path="fsm-jobs" element={<FsmJobsPage />} />
                <Route path="distribution" element={<DistributionPage />} />
                <Route path="campaigns" element={<CampaignsPage />} />
                {websiteSyncModulesEnabled && (
                  <>
                    <Route
                      path="website-users"
                      element={<WebsiteUsersPage />}
                    />
                    <Route
                      path="website-orders"
                      element={<WebsiteOrdersPage />}
                    />
                    <Route
                      path="website-bookings"
                      element={<WebsiteBookingsPage />}
                    />
                    <Route
                      path="website-contacts"
                      element={<WebsiteContactsPage />}
                    />
                  </>
                )}
              </Route>
            </Route>
            <Route path="*" element={<RoleBasedHome />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
