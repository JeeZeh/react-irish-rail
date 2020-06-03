import IrishRailApi, { Journey } from "./IrishRailApi";
import moment = require("moment");

const testFetch = (): Promise<Journey> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(testJourney()), Math.random() * 3000);
  });

export const initJourneyLoader = (journeyCode: string): (() => Journey) => {
  let journey: Journey;
  let error;
  let status = "init";

  let date = moment().locale("en-gb").format("ll");
  let fetchingJourney;
  if (journeyCode === "TEST") {
    fetchingJourney = testFetch()
      .then((j) => {
        journey = j;
        status = "done";
      })
      .catch((e) => {
        status = "error";
        error = e;
      });
  } else {
    fetchingJourney = IrishRailApi.getTrainJourney(journeyCode, date)
      .then((j: Journey) => {
        journey = j;
        status = "done";
      })
      .catch((e) => {
        status = "error";
        error = e;
      });
  }

  return (): Journey => {
    if (status === "init") throw fetchingJourney;
    else if (status === "error") throw error;
    return journey;
  };
};

export const testJourney = (): Journey => {
  const journey = {
    stops: [
      "Clonsilla",
      "Dun Laoighre",
      "Maynooth",
      "Dublin Conolly",
      "Dublin Pearse",
      "Navan Road Parkway",
      "Leixlip (Louisa Bridge)",
      "Leixlip (Confey)",
      "Ashtown",
      "Kilbarrack",
      "Mullagh",
      "Kells",
      "Amazon",
      "Google",
      "Clonsilla",
      "Dun Laoighre",
      "Maynooth",
      "Dublin Conolly",
      "Dublin Pearse",
      "Navan Road Parkway",
      "Leixlip (Louisa Bridge)",
      "Leixlip (Confey)",
      "Ashtown",
      "Kilbarrack",
      "Mullagh",
      "Kells",
      "Amazon",
      "Google",
    ].map((e, i) => ({
      TrainCode: "TEST",
      TrainDate: null,
      LocationCode: i.toString(),
      LocationFullName: e,
      LocationOrder: null,
      LocationType: "S",
      TrainOrigin: "Clonsilla",
      TrainDestination: "Google",
      ScheduledArrival: "00:00",
      ScheduledDeparture: "00:00",
      ExpectedArrival: "00:00",
      ExpectedDeparture: "00:00",
      Arrival: "00:00",
      Departure: "00:00",
      AutoArrival: null,
      AutoDepart: null,
      StopType: "S",
    })),
  };

  journey.stops[10].Departure = null;

  return journey;
};
