import { Link } from "react-router-dom";

const AiFormInfo = () => {
  return (
    <div className="data-section">
      <h2>Ai Form</h2>
      <p>
       The AI Form lets you quickly request intelligent analysis of your data. Simply enter your email and AnaWeb will generate a detailed summary and analysis delivering valuable insights directly to your inbox.
      </p>
      <Link to="/submitform" className="data-btn">Go to AI Form </Link>
    </div>
  );
};

export default AiFormInfo;
