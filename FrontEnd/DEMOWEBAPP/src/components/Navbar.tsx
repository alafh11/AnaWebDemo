import { useNavigate, useLocation } from "react-router-dom";
import anaweblogo from '../assets/anaweblogo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleClick = (sectionId: string) => {
    if (location.pathname !== "/") {
      navigate("/", { replace: false });
      setTimeout(() => scrollTo(sectionId), 200);
    } else {
      scrollTo(sectionId);
    }
  };

  return (
<nav className="navbar">
  <div
    className="logo"
    style={{ cursor: "pointer" }}
    onClick={() => navigate("/")}
  >
    <img src={anaweblogo} alt="Logo" className="logo-img" />
    <span className="app-name">AnaWeb</span>
  </div>

  {/* Right: Navigation Buttons */}
  <div className="nav-links">
    <button className="nav-btn" onClick={() => handleClick("about")}>
      About
    </button>
    <button className="nav-btn" onClick={() => handleClick("datamanagement")}>
      Data Management
    </button>
     <button className="nav-btn" onClick={() => handleClick("aiform")}>
      AI Form 
    </button> 
  </div>
</nav>

  );
};

export default Navbar;
