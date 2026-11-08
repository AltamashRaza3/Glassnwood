import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Projects from "./pages/Projects.jsx";
import ProjectDetail from "./pages/ProjectDetail.jsx";
import Services from "./pages/Services.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import Privacy from "./pages/Privacy.jsx";
import Terms from "./pages/Terms.jsx";
import NotFound from "./pages/NotFound.jsx";
import AdminProjects from "./pages/admin/AdminProjects.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import Gallery from "./pages/Gallery";
import GlassMirrorProducts from "./pages/GlassMirrorProducts";
import AdminInstagram from "./pages/admin/AdminInstagram.jsx";

export default function App() {
  return (
    <Routes>
      {/* Admin routes — without the public website layout */}
      <Route path="admin/login" element={<AdminLogin />} />
      <Route path="admin" element={<AdminDashboard />} />
      <Route path="admin/projects" element={<AdminProjects />} />
      <Route path="/admin/products" element={<AdminProducts />} />
      <Route path="/admin/instagram" element={<AdminInstagram />} />
      
      {/* Public website routes */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:slug" element={<ProjectDetail />} />
        <Route path="services" element={<Services />} />
        <Route path="about" element={<About />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route
          path="/products/glass-mirrors"
          element={<GlassMirrorProducts />}
        />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
