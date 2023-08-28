export const STOCK_ITEM_EXTRA_XML = () => {
  return `
      <ENVELOPE>
    
      <HEADER>
    
      <VERSION>1</VERSION>
    
      <TALLYREQUEST>Export</TALLYREQUEST>
    
      <TYPE>Data</TYPE>
    
      <ID>List of Accounts</ID>
    
      </HEADER>
    
      <BODY>
    
      <DESC>
    
      <STATICVARIABLES>
    
               <AccountType>Stock Items</AccountType>
    
      </STATICVARIABLES>
    
      </DESC>
    
      </BODY>
    
      </ENVELOPE>`;
};
