/* eslint-disable @typescript-eslint/prefer-for-of */
const http = require('http');
import {parseString} from 'xml2js';

interface Product {
  GUID: string;
  ALTERID: string;
  NAME: string;
  PARENT: string;
  _PARENT: string;
  ALIAS: string;
  UOM: string;
  _UOM: string;
  OPENINGBALANCE: string;
  OPENINGRATE: string;
  OPENINGVALUE: string;
  NATUREOFGOODS: string;
  HSNCODE: string;
  TAXABILITY: string;
}

export class TallyHttpCallService {
  constructor() {}

  postTallyXML(msg: any) {
    return new Promise((resolve, reject) => {
      try {
        const req = http.request(
          {
            hostname: process.env.TALLY_HOST,
            port: process.env.TALLY_PORT,
            path: '',
            method: 'POST',
            headers: {
              'Content-Length': Buffer.byteLength(msg, 'utf16le'),
              'Content-Type': 'text/xml;charset=utf-16',
            },
          },
          (res: any) => {
            let data = '';
            res
              .setEncoding('utf16le')
              .on('data', (chunk: any) => {
                const result = chunk.toString() || '';
                data += result;
              })
              .on('end', () => {
                resolve(data);
              })
              .on('error', (httpErr: any) => {
                reject(httpErr);
              });
          },
        );
        req.on('error', (reqError: any) => {
          reject(reqError);
        });
        req.write(msg, 'utf16le');
        req.end();
      } catch (err) {
        reject(err);
      }
    });
  }

 parseXmlToObjects(xmlData: string): Promise<Product[]> {
    return new Promise((resolve, reject) => {
      parseString(xmlData, (err, result) => {
        if (err) {
          reject(err);
        } else {
  
          const envelope = result.ENVELOPE;
          const productArray = [];
  
          const numProducts = envelope.GUID.length;
          for (let i = 0; i < numProducts; i++) {
            const product: Product = {
              GUID: envelope.GUID[i],
              ALTERID: envelope.ALTERID[i],
              NAME: envelope.NAME[i],
              PARENT: envelope.PARENT[i],
              _PARENT: envelope._PARENT[i],
              ALIAS: envelope.ALIAS[i],
              UOM: envelope.UOM[i],
              _UOM: envelope._UOM[i],
              OPENINGBALANCE: envelope.OPENINGBALANCE[i],
              OPENINGRATE: envelope.OPENINGRATE[i],
              OPENINGVALUE: envelope.OPENINGVALUE[i],
              NATUREOFGOODS: envelope.NATUREOFGOODS[i],
              HSNCODE: envelope.HSNCODE[i],
              TAXABILITY: envelope.TAXABILITY[i],
            };
            productArray.push(product);
          }
  
          resolve(productArray);
        }
      });
    });
  }
}
