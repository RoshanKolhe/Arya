/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/prefer-for-of */
import http from 'http';
import {parseString, parseStringPromise} from 'xml2js';
import {
  Ledger,
  ParsedObject,
  ParsedResponse,
  Product,
  Voucher,
} from '../utils/constants';

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

  parseSuccessSyncVoucherData(xmlData: string): Promise<any> {
    return new Promise((resolve, reject) => {
      parseString(xmlData, (err, result) => {
        if (err) {
          reject(err);
        } else {
          // Extract the relevant information from the parsed XML
          const parsedResponse: ParsedResponse = {
            HEADER: result.ENVELOPE.HEADER[0],
            IMPORTRESULT: result.ENVELOPE.BODY[0].DATA[0].IMPORTRESULT[0],
            CMPINFO: result.ENVELOPE.BODY[0].DESC[0].CMPINFO[0],
            // Add other properties from the XML if needed...
          };

          // You can return an array of objects if you expect multiple responses in the future
          resolve(parsedResponse);
        }
      });
    });
  }

  parseXmlUomToObjectArray(xml: string): Promise<any> {
    return new Promise((resolve, reject) => {
      parseString(xml, (err, result) => {
        if (err) {
          reject(err);
        } else {
          const envelope = result.ENVELOPE;
          const uomArray = [];

          const numUoms = envelope.GUID.length;

          for (let i = 0; i < numUoms; i++) {
            const obj: ParsedObject = {
              GUID: result.ENVELOPE.GUID[i],
              ALTERID: result.ENVELOPE.ALTERID[i],
              NAME: result.ENVELOPE.NAME[i],
              FORMALNAME: result.ENVELOPE.FORMALNAME[i],
              ISSIMPLEUNIT: result.ENVELOPE.ISSIMPLEUNIT[i],
              BASEUNITS: result.ENVELOPE.BASEUNITS[i],
              ADDITIONALUNITS: result.ENVELOPE.ADDITIONALUNITS[i],
              CONVERSION: result.ENVELOPE.CONVERSION[i],
            };
            uomArray.push(obj);
          }
          resolve(uomArray);
        }
      });
    });
  }

  parseExtraStockXmlToObjects(xmlData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      parseString(xmlData, (err, result) => {
        if (err) {
          reject(err);
        } else {
          const envelope = result.ENVELOPE;
          const productArray = [];
          const data = envelope.BODY[0].DATA[0].TALLYMESSAGE;
          const filteredData = data.filter((item: any) => 'STOCKITEM' in item);
          const numProducts = filteredData.length;
          for (let i = 0; i < numProducts; i++) {
            const stateWiseGst =
              filteredData[i].STOCKITEM[0]['GSTDETAILS.LIST'][
                filteredData[i].STOCKITEM[0]['GSTDETAILS.LIST'].length - 1
              ]['STATEWISEDETAILS.LIST'];
            const batchDetails =
              filteredData[i].STOCKITEM[0]['BATCHALLOCATIONS.LIST'];
            const mainLocationBatchObject =
              batchDetails && batchDetails.length === 2
                ? batchDetails.filter(
                    (item: any) => item.GODOWNNAME[0] === 'Main Location',
                  )
                : null;

            const retailerMargin = filteredData[i].STOCKITEM[0][
              'UDF:_UDF_671088731.LIST'
            ]
              ? filteredData[i].STOCKITEM[0]['UDF:_UDF_671088731.LIST'][0][
                  'UDF:_UDF_671088731'
                ][0]['_']
              : 0;
            const distributorMargin = filteredData[i].STOCKITEM[0][
              'UDF:_UDF_671088732.LIST'
            ]
              ? filteredData[i].STOCKITEM[0]['UDF:_UDF_671088732.LIST'][0][
                  'UDF:_UDF_671088732'
                ][0]['_']
              : 0;
            const cgst = stateWiseGst
              ? stateWiseGst[0]['RATEDETAILS.LIST'][0]['GSTRATE'][0]
              : '0';
            const sgstOrUtgst = stateWiseGst
              ? stateWiseGst[0]['RATEDETAILS.LIST'][1]['GSTRATE'][0]
              : '0';
            const igst = stateWiseGst
              ? stateWiseGst[0]['RATEDETAILS.LIST'][2]['GSTRATE'][0]
              : '0';
            const cess = stateWiseGst
              ? stateWiseGst[0]['RATEDETAILS.LIST'][3]['GSTRATE'][0]
              : '0';
            const stateCess = stateWiseGst
              ? stateWiseGst[0]['RATEDETAILS.LIST'][3]['GSTRATE'][0]
              : '0';
            const productExtra: any = {
              guid: filteredData[i].STOCKITEM[0].GUID[0],
              cgst: cgst.trim(),
              sgstOrUtgst: sgstOrUtgst.trim(),
              igst: igst.trim(),
              cess: cess.trim(),
              stateCess: stateCess.trim(),
              retailerMargin: retailerMargin ? retailerMargin.trim() : '0',
              distributorMargin: distributorMargin
                ? distributorMargin.trim()
                : '0',
              batchName: mainLocationBatchObject
                ? mainLocationBatchObject[0].BATCHNAME[0]
                : 0,
            };
            productArray.push(productExtra);
          }
          resolve(productArray);
        }
      });
    });
  }
}
