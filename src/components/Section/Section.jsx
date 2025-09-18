import "./Section.css";
import PibChart from "../PibChart/PibChart";
import PibTable from "../PibTable/PibTable";

const Section = ({ currentScreen }) => {
  return (
    <section className="main">
      <div className="screen-container">
        {currentScreen === "chart" && (
          <section className="screen-content">
            <PibChart />
          </section>
        )}

        {currentScreen === "table" && (
          <section className="screen-content">
            <PibTable />
          </section>
        )}
      </div>
    </section>
  );
};

export default Section;
