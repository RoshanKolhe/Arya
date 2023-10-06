export const SYNC_VOUCHERS_DATA_XML = (voucherData: any) => {
  console.log(voucherData);
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
                      <PRICELEVEL>PRICE LIST</PRICELEVEL>
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
                      <LEDGERENTRIES.LIST>
                      <LEDGERNAME>CGST</LEDGERNAME>
                      <METHODTYPE>GST</METHODTYPE>
                      <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                      <AMOUNT>${voucherData.cgst}</AMOUNT>
                  </LEDGERENTRIES.LIST>
                  <LEDGERENTRIES.LIST>
                      <ROUNDTYPE/>
                      <LEDGERNAME>SGST</LEDGERNAME>
                      <METHODTYPE>GST</METHODTYPE>
                      <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                      <AMOUNT>${voucherData.sgst}</AMOUNT>
                  </LEDGERENTRIES.LIST>
                  <LEDGERENTRIES.LIST>
                      <LEDGERNAME>Cess</LEDGERNAME>
                      <METHODTYPE>GST</METHODTYPE>
                      <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                      <AMOUNT>${voucherData.cess}</AMOUNT>
                  </LEDGERENTRIES.LIST>
                  <LEDGERENTRIES.LIST>
                  <OLDAUDITENTRYIDS.LIST TYPE="Number">
                   <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
                  </OLDAUDITENTRYIDS.LIST>
                  <ROUNDTYPE>Normal Rounding</ROUNDTYPE>
                  <LEDGERNAME>Round Off</LEDGERNAME>
                  <METHODTYPE>As Total Amount Rounding</METHODTYPE>
                  <GSTCLASS/>
                  <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                  <LEDGERFROMITEM>No</LEDGERFROMITEM>
                  <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
                  <ISPARTYLEDGER>No</ISPARTYLEDGER>
                  <ISLASTDEEMEDPOSITIVE>No</ISLASTDEEMEDPOSITIVE>
                  <ISCAPVATTAXALTERED>No</ISCAPVATTAXALTERED>
                  <ISCAPVATNOTCLAIMED>No</ISCAPVATNOTCLAIMED>
                  <ROUNDLIMIT> 1</ROUNDLIMIT>
                  <AMOUNT>0.49</AMOUNT>
                  <VATEXPAMOUNT>0.49</VATEXPAMOUNT>
                 </LEDGERENTRIES.LIST>
                  </VOUCHER>
              </TALLYMESSAGE>
          </DATA>
      </BODY>
  </ENVELOPE>`;
};

function getVoucherItems(items: any) {
  const voucherProducts = items.map((item: any) => {
    console.log(item);
    return `<ALLINVENTORYENTRIES.LIST>
                         <STOCKITEMNAME>${item.productName}</STOCKITEMNAME>
                         <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                         <RATE>${item.total}/Pcs</RATE>
                         <AMOUNT>${item.total}</AMOUNT>
                         <ACTUALQTY>0 Box ${item.quantity} Pcs</ACTUALQTY>
                         <BILLEDQTY>0 Box ${item.quantity} Pcs</BILLEDQTY>
                         <BATCHALLOCATIONS.LIST>
                             <GODOWNNAME>Main Location</GODOWNNAME>
                             <BATCHNAME>${item.rate}</BATCHNAME>
                             <AMOUNT>${item.total}</AMOUNT>
                             <ACTUALQTY>0 Box ${item.quantity} Pcs</ACTUALQTY>
                             <BILLEDQTY>0 Box ${item.quantity} Pcs</BILLEDQTY>
                         </BATCHALLOCATIONS.LIST>
                         <ACCOUNTINGALLOCATIONS.LIST>
                         <OLDAUDITENTRYIDS.LIST TYPE="Number">
                                <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
                            </OLDAUDITENTRYIDS.LIST>
                             <LEDGERNAME>Aarya Sales GST</LEDGERNAME>
                            <CLASSRATE>100.00000</CLASSRATE>
                             <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                             <AMOUNT>${item.total}</AMOUNT>
                         </ACCOUNTINGALLOCATIONS.LIST>
                         <UDF:NOSQTY.LIST DESC="\`NosQty\`" ISLIST="YES" TYPE="Number" INDEX="901">
                            <UDF:NOSQTY DESC="\`NosQty\`"> ${item.quantity}</UDF:NOSQTY>
                        </UDF:NOSQTY.LIST>
                        <UDF:ITEMLED.LIST DESC="\`ItemLed\`" ISLIST="YES" TYPE="String" INDEX="909">
                            <UDF:ITEMLED DESC="\`ItemLed\`">Aarya Sales GST</UDF:ITEMLED>
                        </UDF:ITEMLED.LIST>
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
