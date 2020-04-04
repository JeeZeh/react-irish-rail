import * as React from "react";
import { hot } from "react-hot-loader";
import { Train } from "./IrishRailApi";

interface TrainColumn {
  dispName: string;
  propName: string;
}

export interface ScheduleTableProps { trainData: Train[] }


const ScheduleTable = (props: ScheduleTableProps) => {
  const { trainData } = props;

  const renderTrain = (train: Train) => {
    return (
      <tr key={train.Traincode}>
        {columns.map((c) => (
          <td key={c.propName}>{train[c.propName]}</td>
        ))}
      </tr>
    );
  };

  const renderHeader = () => {
    return (
      <thead className="thead-dark">
        <tr>
          {columns.map((c, i) => (
            <th key={i}>{c.dispName}</th>
          ))}
        </tr>
      </thead>
    );
  };

  return (
    <table className="table table-striped table-bordered table-hover table-sm">
      {renderHeader()}
      <tbody>{trainData.map(renderTrain)}</tbody>
    </table>
  );
};

export default hot(module)(ScheduleTable);

const columns: TrainColumn[] = [
  {
    dispName: "Due",
    propName: "Exparrival",
  },
  {
    dispName: `Departing`,
    propName: "Expdepart",
  },
  {
    dispName: "From",
    propName: "Origin",
  },
  {
    dispName: "To",
    propName: "Destination",
  },
  {
    dispName: "Terminating",
    propName: "Destinationtime",
  },
  {
    dispName: "Last Seen",
    propName: "Lastlocation",
  },
];