import * as parser from "fast-xml-parser";
import * as he from "he";
import { parse } from "querystring";

export default class IrishRailApi {
  private static CORS = "https://cors-anywhere.herokuapp.com/";
  private static API = "http://api.irishrail.ie/realtime/realtime.asmx/";
  private static EP_STATIONDATA =
    "getStationDataByCodeXML_WithNumMins?StationCode=";
  private static EP_ALLSTATIONS = "getAllStationsXML";
  private static SFX_NINETYXML = "&NumMins=90&format=xml";
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

  public static parseXmlStationData(xml: string): Train[] {
    const parsedXml = parser.parse(xml, this.XML_OPTIONS);
    return parsedXml.ArrayOfObjStationData[0].objStationData;
  }

  public static parseXmlAllStations(xml: string): Station[] {
    const parsedXml = parser.parse(xml, this.XML_OPTIONS);
    return parsedXml.ArrayOfObjStation[0].objStation;
  }

  public static async getTrainsForStation(station: Station): Promise<Train[]> {
    const endpoint = `${this.CORS}${this.API}${this.EP_STATIONDATA}${station.StationCode}${this.SFX_NINETYXML}`;
    console.log(endpoint);

    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(endpoint);
        const stationData = this.parseXmlStationData(await response.text());
        resolve(stationData);
      } catch (error) {
        reject(error);
      }
    });
  }

  public static getStations(): Promise<Station[]> {
    const endpoint = `${this.CORS}${this.API}${this.EP_ALLSTATIONS}`;
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

export interface Station {
  StationDesc: string,
  StationCode: string,
  StationAlias: string,
  StationLatitude: number,
  StationLongitude: number,
  StationId: number,
}
