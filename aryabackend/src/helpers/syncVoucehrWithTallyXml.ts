export const SYNC_VOUCHERS_DATA_XML = (voucherData: any) => {
  return `<ENVELOPE>
      <HEADER>
          <VERSION>1</VERSION>
          <TALLYREQUEST>Import</TALLYREQUEST>
          <TYPE>Data</TYPE>
          <ID>Vouchers</ID>
      </HEADER>
      <BODY>
          <DESC></DESC>
          <DATA>
              <TALLYMESSAGE>
                  <VOUCHER>
                      <DATE>${convertDateFormat(voucherData.date)}</DATE>
                      <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
                      <PERSISTEDVIEW>Invoice Voucher View</PERSISTEDVIEW>
                      <ISINVOICE>Yes</ISINVOICE>
                      <OBJVIEW>Invoice Voucher View</OBJVIEW>
                      <LEDGERENTRIES.LIST>
                          <LEDGERNAME>${voucherData.party_name}</LEDGERNAME>
                          <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
                          <ISPARTYLEDGER>Yes</ISPARTYLEDGER>
                          <ISLASTDEEMEDPOSITIVE>Yes</ISLASTDEEMEDPOSITIVE>
                          <AMOUNT>-${voucherData.totalAmount}</AMOUNT>
                      </LEDGERENTRIES.LIST>
                      ${getVoucherItems(voucherData.products).join('')}
                  </VOUCHER>
              </TALLYMESSAGE>
          </DATA>
      </BODY>
  </ENVELOPE>`;
};

function getVoucherItems(items: any) {
  const voucherProducts = items.map((item: any) => {
    return `<ALLINVENTORYENTRIES.LIST>
                         <STOCKITEMNAME>${item.productName}</STOCKITEMNAME>
                         <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                         <RATE>${item.rate}</RATE>
                         <AMOUNT>${item.amount}</AMOUNT>
                         <ACTUALQTY>${item.quantity}</ACTUALQTY>
                         <BILLEDQTY>${item.quantity}</BILLEDQTY>
                         <BATCHALLOCATIONS.LIST>
                             <GODOWNNAME>Main Location</GODOWNNAME>
                             <BATCHNAME>145</BATCHNAME>
                             <AMOUNT>${item.amount}</AMOUNT>
                             <ACTUALQTY>${item.quantity}</ACTUALQTY>
                             <BILLEDQTY>${item.quantity}</BILLEDQTY>
                         </BATCHALLOCATIONS.LIST>
                         <ACCOUNTINGALLOCATIONS.LIST>
                             <LEDGERNAME>Aarya Sales GST</LEDGERNAME>
                             <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                             <AMOUNT>${item.amount}</AMOUNT>
                         </ACCOUNTINGALLOCATIONS.LIST>
                     </ALLINVENTORYENTRIES.LIST>`;
  });

  return voucherProducts;
}

function convertDateFormat(inputDate: any) {
  const dateParts = inputDate.split('-');

  if (dateParts.length !== 3) {
    throw new Error(
      'Invalid date format. Please provide date in the format "YYYY-MM-DD".',
    );
  }

  const [year, month, day] = dateParts;
  const yearNum = parseInt(year, 10);
  const monthNum = parseInt(month, 10);
  const dayNum = parseInt(day, 10);

  if (isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum)) {
    throw new Error('Invalid date format. Date parts must be valid numbers.');
  }

  const formattedDate = `${yearNum}${monthNum
    .toString()
    .padStart(2, '0')}${dayNum.toString().padStart(2, '0')}`;
  return formattedDate;
}
