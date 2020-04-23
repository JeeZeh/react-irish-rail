import * as parser from "fast-xml-parser";
import * as he from "he";

export default class IrishRailApi {
  private static API = "/";
  private static STATIONDATA =
    "getStationDataByCodeXML_WithNumMins?StationCode=";
  private static TRAINJOURNEY = "/getTrainMovementsXML?TrainId=";
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
    const parsedXml = parser.parse(xml, this.XML_OPTIONS);
    if (!parsedXml.ArrayOfObjStationData) {
      // let fakeData = new Array<Train>();
      // for (let i = 0; i < 10; i++) {
      //   fakeData.push(this.generateFakeStationData());
      // }
      // return fakeData;
      return [];
    }
    return parsedXml.ArrayOfObjStationData[0].objStationData;
  }

  private static parseXmlAllStations(xml: string): Station[] {
    const parsedXml = parser.parse(xml, this.XML_OPTIONS);
    return parsedXml.ArrayOfObjStation[0].objStation;
  }
  
  private static parseXmlTrainJourney(xml: string): Journey {
    const parsedXml = parser.parse(xml, this.XML_OPTIONS);
    if (parsedXml.ArrayOfObjTrainMovements[0]) {
      const movements: Movement[] = parsedXml.ArrayOfObjTrainMovements[0].objTrainMovements;
      return {stops: movements.filter(loc => loc.LocationType                !== "T")};
    }
    return {stops: []}
  }

  public static async getTrainsForStation(station: Station, lookahead: number): Promise<Train[]> {
    const endpoint = `${this.API}${this.STATIONDATA}${station.StationCode}&NumMins=${lookahead}&format=xml`;
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(endpoint);
        const stationData = this.parseXmlStationData(await response.text()).map(
          this.cleanData
        );
        resolve(stationData);
      } catch (error) {
        reject(error);
      }
    });
  }

  public static async getTrainJourney(trainCode: string, trainDate: string): Promise<Journey> {
    const endpoint = `${this.API}${this.TRAINJOURNEY}${trainCode}&TrainDate=${trainDate}`;
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(endpoint);
        const journeyData = this.parseXmlTrainJourney(await response.text());
        resolve(journeyData);
      } catch (error) {
        reject(error);
      }
    });
  }

  private static cleanData(train: Train) {
    if (train.Destination === train.Stationfullname) {
      train.Expdepart = "";
    }
    if (train.Origin === train.Stationfullname) {
      train.Exparrival = "";
    }
    return train;
  }

  public static getStations(): Promise<Station[]> {
    const endpoint = `${this.API}${this.ALLSTATIONS}`;
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(endpoint);
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
  Origintime: string;
  Destinationtime: string;
  Status: string;
  Lastlocation: string;
  Duein: number;
  Late: number;
  Exparrival: string;
  Expdepart: string;
  Scharrival: string;
  Schdepart: string;
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
  ScheduledArrival: string;
  ScheduledDeparture: string;
  ExpectedArrival: string;
  ExpectedDeparture: string;
  Arrival: string;
  Departure: string;
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
