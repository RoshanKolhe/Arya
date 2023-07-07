export const FETCH_LEDGER_ACCOUNTS_XML = () => {
  return `<ENVELOPE>
  <HEADER>
      <VERSION>1</VERSION>
      <TALLYREQUEST>Export</TALLYREQUEST>
      <TYPE>Collection</TYPE>
      <ID>Ledgers</ID>
  </HEADER>
  <BODY>
      <DESC>
          <STATICVARIABLES>
              <SVEXPORTFORMAT>SysName:XML</SVEXPORTFORMAT>
          </STATICVARIABLES>
          <TDL>
              <TDLMESSAGE>
                  <COLLECTION ISMODIFY="No" ISFIXED="No" ISINITIALIZE="No" ISOPTION="No" ISINTERNAL="No" NAME="Ledgers">
                      <TYPE>Ledger</TYPE>
                      <CHILDOF>$$GroupSundryDebtors</CHILDOF>
                      <BELONGSTO>Yes</BELONGSTO>
                      <FETCH>NAME,OPENINGBALANCE,GUID,PARENT</FETCH>
                  </COLLECTION>
              </TDLMESSAGE>
          </TDL>
      </DESC>
  </BODY>
</ENVELOPE>`;
};
