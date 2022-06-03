import { XMLParser } from "fast-xml-parser";
import he from "he";
import { smallify } from "../components/JourneyStop";
import { calcTrainPositionV2 } from "../components/JourneyMap";
const moment = require("moment");
moment.locale("en-ie");

const parser = new XMLParser();

export default class IrishRailApi {
  private static API = window.location.host.includes("localhost")
    ? "http://localhost:3000"
    : "";
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

  private static localRouteCache = new Map<string, IRoute>();

  private static parseXmlStationData(xml: string): ITrain[] {
    if (!xml) return [];
    const parsedXml = parser.parse(xml, IrishRailApi.XML_OPTIONS);
    if (!parsedXml || !parsedXml.ArrayOfObjStationData) return [];

    let arrayOfObjStationData = parsedXml.ArrayOfObjStationData;

    let objStationData = Array.isArray(arrayOfObjStationData)
      ? arrayOfObjStationData[0].objStationData
      : arrayOfObjStationData.objStationData;

    // If the parsed response has one entry, it is not parsed as an array so we must wrap it.
    if (Array.isArray(objStationData)) {
      return objStationData;
    }
    return [objStationData];
  }

  private static parseXmlAllStations(xml: string): IStation[] {
    if (!xml) return [];
    const parsedXml = parser.parse(xml, IrishRailApi.XML_OPTIONS);
    if (!parsedXml || !parsedXml.ArrayOfObjStation) return [];

    const removedDuplicates = new Map<string, IStation>();
    for (const station of parsedXml.ArrayOfObjStation.objStation) {
      removedDuplicates.set(station.StationDesc, station);
    }
    return Array.from(removedDuplicates.values());
  }

  private static parseXmlTrainJourney(xml: string): IJourney {
    if (!xml) return null;
    const parsedXml = parser.parse(xml, IrishRailApi.XML_OPTIONS);

    if (Array.isArray(parsedXml.ArrayOfObjTrainMovements.objTrainMovements)) {
      let movements: IMovement[] =
        parsedXml.ArrayOfObjTrainMovements.objTrainMovements;

      movements = movements
        .filter((loc) => loc.LocationType !== "T")
        .map((m) => {
          stopDateProps.forEach((prop) => {
            const currentHour = moment(moment.now()).hour();

            if (m[prop]) {
              if (
                m[prop] === "00:00:00" &&
                currentHour >= 2 &&
                currentHour <= 22
              ) {
                m[prop] = null;
              } else {
                m[prop] = moment(
                  `${m.TrainDate} ${m[prop]}`,
                  "DD MMM YYYY HH:mm:SS"
                );
              }
            }
          });
          return m;
        });
      return {
        stops: movements,
        trainPosition: calcTrainPositionV2(movements),
      };
    }
    return { stops: null, trainPosition: null };
  }

  public static async getTrainsForStation(
    station: IStation,
    lookahead: number
  ): Promise<ITrain[]> {
    const endpoint = `${IrishRailApi.API}/proxy/${IrishRailApi.STATIONDATA}${station.StationCode}&NumMins=${lookahead}&format=xml`;
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) reject(response);
        const stationData = IrishRailApi.parseXmlStationData(
          await response.text()
        ).map(IrishRailApi.cleanTrainData);

        resolve(stationData);
      } catch (error) {
        reject(error);
      }
    });
  }

  public static async getTrainJourney(trainCode: string): Promise<IJourney> {
    const endpoint = `${IrishRailApi.API}/proxy/${IrishRailApi.TRAINJOURNEY}${trainCode}&TrainDate=0`;
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) reject(response);
        const journeyData = IrishRailApi.parseXmlTrainJourney(
          await response.text()
        );
        resolve(journeyData);
      } catch (error) {
        reject(error);
      }
    });
  }

  private static cleanTrainData(train: ITrain) {
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

  public static getStations(): Promise<IStation[]> {
    const endpoint = `${IrishRailApi.API}/proxy/${IrishRailApi.ALLSTATIONS}`;
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) reject(response);
        const parsedXml = IrishRailApi.parseXmlAllStations(
          await response.text()
        );
        resolve(parsedXml);
      } catch (error) {
        reject(error);
      }
    });
  }

  public static getRouteInfo(train: ITrain): Promise<IRoute> {
    if (!train && !train.Traincode) return null;
    return new Promise(async (resolve, reject) => {
      const localRouteCacheEntry = IrishRailApi.localRouteCache.get(
        train.Traincode
      );

      if (localRouteCacheEntry) {
        resolve(localRouteCacheEntry);
        return;
      }

      const endpoint = `${IrishRailApi.API}/route?trainCode=${train.Traincode}&trainDate=${train.Traindate}`;
      try {
        const response = await fetch(endpoint);
        if (!response.ok) reject(response);
        const parsedXml = IrishRailApi.parseXmlTrainJourney(
          await response.text()
        );

        const route = {
          origin: parsedXml.stops[0].TrainOrigin,
          destination: parsedXml.stops[0].TrainDestination,
          stops: parsedXml.stops
            .filter((s) => s.StopType != "T")
            .map((s) => s.LocationFullName),
          trainCode: parsedXml.stops[0].TrainCode,
          trainPosition: parsedXml.trainPosition,
        };
        IrishRailApi.localRouteCache.set(train.Traincode, route);
        resolve(route);
      } catch (error) {
        reject(error);
      }
    });
  }
}

export interface IRoute {
  origin: string;
  destination: string;
  stops: Array<string>;
  trainCode: string;
  trainPosition: number;
}

export interface ITrain {
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

export interface IJourney {
  stops: IMovement[];
  trainPosition: number;
}

export interface IMovement {
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

export interface IStation {
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
