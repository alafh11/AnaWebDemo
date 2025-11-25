import { Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import About from "./components/About";
import DataManagement from "./components/DataManagement";
import DataPage from "./pages/DataPage";
import EditPage from "./pages/EditPage";
import AiFormInfo from "./components/AiFormInfo";
import SubmitForm from "./pages/SubmitForm";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={
            <>
              <section id="about">
                <About />
              </section>

              <section id="datamanagement">
                <DataManagement />
              </section>
                   <section id="aiform">
                <AiFormInfo />
              </section>


            </>
          }
        />

        <Route path="/data" element={<DataPage />} />
        <Route path="/edit-csv" element={<EditPage />} />
        <Route path="/submitform" element={<SubmitForm />} />

      </Routes>
    </>
  );
}

export default App;
