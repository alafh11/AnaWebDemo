import About from "../components/About";
import DataManagement from "../components/DataManagement";
import { useRef } from "react";
import AiFormInfo from "../components/AiFormInfo";

const LandingPage = () => {
  const aboutRef = useRef<HTMLDivElement>(null);
  const datamanagementRef = useRef<HTMLDivElement>(null);
  const aiformRef = useRef<HTMLDivElement>(null);


  return (
    <>
      <section id="about" ref={aboutRef}>
        <About />
      </section>

      <section id="datamanagement" ref={datamanagementRef}>
        <DataManagement />
      </section>
          <section id="aiforminfo" ref={aiformRef}>
        <AiFormInfo />
      </section>

    </>
  );
};

export default LandingPage;
