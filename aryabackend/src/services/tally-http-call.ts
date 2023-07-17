/* eslint-disable @typescript-eslint/prefer-for-of */
import http from 'http';
import {parseString, parseStringPromise} from 'xml2js';

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

interface Voucher {
  GUID: string;
  ALTERID: string;
  DATE: string;
  VOUCHER_TYPE: string;
  _VOUCHER_TYPE: string;
  VOUCHER_NUMBER: string;
  REFERENCE_NUMBER: string;
  REFERENCE_DATE: string;
  NARRATION: string;
  PARTY_NAME: string;
  _PARTY_NAME: string;
  PLACE_OF_SUPPLY: string;
  IS_INVOICE: string;
  IS_ACCOUNTING_VOUCHER: string;
  IS_INVENTORY_VOUCHER: string;
  IS_ORDER_VOUCHER: string;
}

interface Ledger {
  name: string;
  guid: string;
  openingBalance: number;
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

  async parseLedgerData(xmlData: string): Promise<Ledger[]> {
    const parsedData = await parseStringPromise(xmlData, {
      explicitArray: false,
    });
    const collection = parsedData.ENVELOPE.BODY.DATA.COLLECTION;

    if (!collection) {
      return [];
    }

    const ledgersData = collection.LEDGER;
    const ledgers: Ledger[] = [];

    if (!Array.isArray(ledgersData)) {
      // If there is only one ledger, convert it to an array
      ledgers.push(this.convertLedgerToObject(ledgersData));
    } else {
      ledgersData.forEach((ledgerData: any) => {
        ledgers.push(this.convertLedgerToObject(ledgerData));
      });
    }

    return ledgers;
  }

  convertLedgerToObject(ledger: any): Ledger {
    return {
      name: ledger.$.NAME,
      guid: ledger.GUID._,
      openingBalance: parseFloat(ledger.OPENINGBALANCE._),
    };
  }

  parseActiveCompany(xmlData: string): Promise<any> {
    return new Promise((resolve, reject) => {
      parseString(xmlData, (err, result) => {
        if (err) {
          reject(err);
        } else {
          const envelope =
            result.ENVELOPE.BODY[0].DATA[0].COLLECTION[0].COMPANY[0];
          const finalActiveCompanyData = {
            name: envelope.NAME[0]._,
            guid: envelope.GUID[0]._,
            companyNo: envelope.COMPANYNUMBER[0]._,
            booksFrom: envelope.BOOKSFROM[0]._,
            startingFrom: envelope.STARTINGFROM[0]._,
            endAt: envelope.ENDINGAT[0]._,
          };
          resolve(finalActiveCompanyData);
        }
      });
    });
  }

  parseVoucherToObjects(xmlData: string): Promise<Voucher[]> {
    return new Promise((resolve, reject) => {
      parseString(xmlData, (err, result) => {
        if (err) {
          reject(err);
        } else {
          const envelope = result.ENVELOPE;
          const voucherArray = [];

          const numVouchers = envelope.GUID.length;
          for (let i = 0; i < numVouchers; i++) {
            const voucher: Voucher = {
              GUID: envelope.GUID[i],
              ALTERID: envelope.ALTERID[i],
              DATE: envelope.DATE[i],
              VOUCHER_TYPE: envelope.VOUCHER_TYPE[i],
              _VOUCHER_TYPE: envelope._VOUCHER_TYPE[i],
              VOUCHER_NUMBER: envelope.VOUCHER_NUMBER[i],
              REFERENCE_NUMBER: envelope.REFERENCE_NUMBER[i],
              REFERENCE_DATE: envelope.REFERENCE_DATE[i],
              NARRATION: envelope.NARRATION[i],
              PARTY_NAME: envelope.PARTY_NAME[i],
              _PARTY_NAME: envelope._PARTY_NAME[i],
              PLACE_OF_SUPPLY: envelope.PLACE_OF_SUPPLY[i],
              IS_INVOICE: envelope.IS_INVOICE[i],
              IS_ACCOUNTING_VOUCHER: envelope.IS_ACCOUNTING_VOUCHER[i],
              IS_INVENTORY_VOUCHER: envelope.IS_INVENTORY_VOUCHER[i],
              IS_ORDER_VOUCHER: envelope.IS_ORDER_VOUCHER[i],
            };
            voucherArray.push(voucher);
          }

          resolve(voucherArray);
        }
      });
    });
  }
}
