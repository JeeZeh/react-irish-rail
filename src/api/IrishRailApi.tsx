import * as parser from "fast-xml-parser";
import * as he from "he";
import { smallify } from "../components/JourneyStop";
import moment = require("moment");

export default class IrishRailApi {
  private static API = window.location.host.includes("localhost")
    ? "http://localhost:3000/"
    : "/";
  private static STATIONDATA =
    "getStationDataByCodeXML_WithNumMins?StationCode=";
  private static TRAINJOURNEY = "getTrainMovementsXML?TrainId=";
  private static ALLSTATIONS = "getAllStationsXML";
  private static XML_OPTIONS = {
    attributeNamePrefix: "@_",
    attrNodeName: "attr", //default is 'false'
    textNodeName: "#text",
    ignoreAttributes: true,
    ignoreNameSpace: false,
    allowBooleanAttributes: false,
    parseNodeValue: true,
    parseAttributeValue: false,
    trimValues: true,
    cdataTagName: "__cdata", //default is 'false'
    cdataPositionChar: "\\c",
    parseTrueNumberOnly: false,
    arrayMode: true, //"strict"
    attrValueProcessor: (val) => he.decode(val, { isAttributeValue: true }), //default is a=>a
    tagValueProcessor: (val) => he.decode(val), //default is a=>a
    stopNodes: ["parse-me-as-string"],
  };

  private static generateFakeStationData(): Train {
    let d: Train = {
      Servertime: new Date(),
      Traincode: null,
      Stationfullname: null,
      Stationcode: null,
      Querytime: null,
      Traindate: null,
      Origin: null,
      Destination: null,
      Origintime: null,
      Destinationtime: null,
      Status: null,
      Lastlocation: null,
      Duein: 0,
      Late: 0,
      Exparrival: null,
      Expdepart: null,
      Scharrival: null,
      Schdepart: null,
      Direction: null,
      Traintype: null,
      Locationtype: null,
    };

    for (const key in d) {
      if (["Duein", "Late"].includes(key)) {
        d[key] = 0;
      } else if (
        [
          "Origintime",
          "Destinationtime",
          "Exparrival",
          "Expdepart",
          "Scharrival",
          "Schdepart",
        ].includes(key)
      ) {
        d[key] = `${(Math.random() * 24 + 100).toString().substring(1, 3)}:${(
          Math.random() * 60 +
          100
        )
          .toString()
          .substring(1, 3)}`;
      } else {
        d[key] = Math.random().toString(36).slice(2);
      }
    }
    return d;
  }

  private static parseXmlStationData(xml: string): Train[] {
    if (!xml) return [];
    const parsedXml = parser.parse(xml, this.XML_OPTIONS);
    if (!parsedXml || !parsedXml.ArrayOfObjStationData) return [];

    return parsedXml.ArrayOfObjStationData[0].objStationData;
  }

  private static parseXmlAllStations(xml: string): Station[] {
    if (!xml) return [];
    const parsedXml = parser.parse(xml, this.XML_OPTIONS);
    if (!parsedXml || !parsedXml.ArrayOfObjStation) return null;

    const removedDuplicates = new Map<string, Station>();
    for (const station of parsedXml.ArrayOfObjStation[0].objStation) {
      removedDuplicates.set(station.StationDesc, station);
    }
    return Array.from(removedDuplicates.values());
  }

  private static parseXmlTrainJourney(xml: string): Journey {
    if (!xml) return null;
    const parsedXml = parser.parse(xml, this.XML_OPTIONS);
    if (parsedXml.ArrayOfObjTrainMovements[0]) {
      let movements: Movement[] =
        parsedXml.ArrayOfObjTrainMovements[0].objTrainMovements;

      movements = movements
        .filter((loc) => loc.LocationType !== "T")
        .map((m) => {
          stopDateProps.forEach((prop) => {
            if (m[prop]) {
              m[prop] = moment(
                `${m.TrainDate} ${m[prop]}`,
                "DD MMM YYYY HH:mm:SS"
              );
            }
          });
          return m;
        });
      return { stops: movements };
    }
    return { stops: null };
  }

  public static async getTrainsForStation(
    station: Station,
    lookahead: number
  ): Promise<Train[]> {
    const endpoint = `${this.API}${this.STATIONDATA}${station.StationCode}&NumMins=${lookahead}&format=xml`;
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) reject(response);
        const stationData = this.parseXmlStationData(await response.text()).map(
          this.cleanTrainData
        );

        resolve(stationData);
      } catch (error) {
        reject(error);
      }
    });
  }

  public static async getTrainJourney(
    trainCode: string,
    trainDate: string
  ): Promise<Journey> {
    const endpoint = `${this.API}${this.TRAINJOURNEY}${trainCode}&TrainDate=${trainDate}`;
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) reject(response);
        const journeyData = this.parseXmlTrainJourney(await response.text());
        resolve(journeyData);
      } catch (error) {
        reject(error);
      }
    });
  }

  private static cleanTrainData(train: Train) {
    if (train.Destination === train.Stationfullname) {
      train.Expdepart = train.Exparrival;
    }
    if (train.Origin === train.Stationfullname) {
      train.Exparrival = train.Expdepart;
    }

    trainDateProps.forEach((prop) => {
      if (train.hasOwnProperty(prop)) {
        const date = moment(
          `${train.Traindate} ${train[prop]}`,
          "DD MMM YYYY HH:mm"
        );
        if (date.hour() < 3) date.add(1, "days");
        train[prop] = date;
      }
    });

    train.Lastlocation = smallify(train.Lastlocation);
    return train;
  }

  public static getStations(): Promise<Station[]> {
    const endpoint = `${this.API}${this.ALLSTATIONS}`;
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) reject(response);
        const parsedXml = this.parseXmlAllStations(await response.text());
        resolve(parsedXml);
      } catch (error) {
        reject(error);
      }
    });
  }
}

export interface Train {
  Servertime: Date;
  Traincode: string;
  Stationfullname: string;
  Stationcode: string;
  Querytime: string;
  Traindate: string;
  Origin: string;
  Destination: string;
  Origintime: moment.Moment;
  Destinationtime: moment.Moment;
  Status: string;
  Lastlocation: string;
  Duein: number;
  Late: number;
  Exparrival: moment.Moment;
  Expdepart: moment.Moment;
  Scharrival: moment.Moment;
  Schdepart: moment.Moment;
  Direction: string;
  Traintype: string;
  Locationtype: string;
}

export interface Journey {
  stops: Movement[];
}

export interface Movement {
  TrainCode: string;
  TrainDate: string;
  LocationCode: string;
  LocationFullName: string;
  LocationOrder: number;
  LocationType: string;
  TrainOrigin: string;
  TrainDestination: string;
  ScheduledArrival: moment.Moment;
  ScheduledDeparture: moment.Moment;
  ExpectedArrival: moment.Moment;
  ExpectedDeparture: moment.Moment;
  Arrival: moment.Moment;
  Departure: moment.Moment;
  AutoArrival: number;
  AutoDepart: number;
  StopType: string;
}

export interface Station {
  StationDesc: string;
  StationCode: string;
  StationAlias: string;
  StationLatitude: number;
  StationLongitude: number;
  StationId: number;
}

const trainDateProps = [
  "Exparrival",
  "Expdepart",
  "Destinationtime",
  "Origintime",
  "Scharrival",
  "Schdepart",
];

const stopDateProps = [
  "ExpectedArrival",
  "ExpectedDeparture",
  "Arrival",
  "Departure",
  "ScheduledArrival",
  "ScheduledDeparture",
];
