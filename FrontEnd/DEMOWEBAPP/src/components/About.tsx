const About = () => {
  return (
    <div className="about-section p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">About AnaWeb</h2>
      <p className="mb-4">
        AnaWeb is a powerful, intuitive platform designed to transform how you work with data. Whether you’re a data analyst, researcher, or decision-maker, AnaWeb simplifies the process of exploring, editing, and analyzing CSV datasets.
      </p>
      <p className="mb-4">
        With AnaWeb, you can:
      </p>
      <ul className="list-disc list-inside mb-4 space-y-2">
        <li>Upload and analyze CSV files instantly to gain insights with minimal effort.</li>
        <li>Edit your data with advanced functions like conditional edits, adding new columns, filtering, and more  all while keeping a complete log of changes.</li>
        <li>Download your updated datasets along with a history of edits, ensuring transparency and reproducibility.</li>
        <li>Leverage AI-powered analysis through our smart AI form: simply enter your email and AnaWeb will send you a detailed summary and analysis tailored to your needs.</li>
      </ul>
      <p className="mb-4">
        Our mission is to make data analysis accessible, efficient, and interactive for everyone  whether you are working on a small project or managing large datasets. AnaWeb empowers you to turn raw data into actionable insights, faster and smarter.
      </p>
      <p className="text-lg font-semibold">
        AnaWeb - Analyze. Edit. Evolve.
      </p>
    </div>
  );
};

export default About;
