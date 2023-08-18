export const MASTER_UOM_XML = () => {
  return `<?xml version="1.0" encoding="utf-8"?>
    <ENVELOPE>
        <HEADER>
            <VERSION>1</VERSION>
            <TALLYREQUEST>Export</TALLYREQUEST>
            <TYPE>Data</TYPE>
            <ID>MyReportLedgerTable</ID>
        </HEADER>
        <BODY>
            <DESC>
                <STATICVARIABLES>
                    <SVEXPORTFORMAT>XML (Data Interchange)</SVEXPORTFORMAT>
                    <SVFROMDATE>{fromDate}</SVFROMDATE>
                    <SVTODATE>{toDate}</SVTODATE>
                </STATICVARIABLES>
                <TDL>
                    <TDLMESSAGE>
                        <REPORT NAME="MyReportLedgerTable">
                            <FORMS>MyForm</FORMS>
                        </REPORT>
                        <FORM NAME="MyForm">
                            <PARTS>MyPart01</PARTS>
                        </FORM>
                        <PART NAME="MyPart01">
                            <LINES>MyLine01</LINES>
                            <REPEAT>MyLine01 : MyCollection</REPEAT>
                            <SCROLLED>Vertical</SCROLLED>
                        </PART>
                        <LINE NAME="MyLine01">
                            <FIELDS>Fld01,Fld02,Fld03,Fld04,Fld05,Fld06,Fld07,Fld08</FIELDS>
                        </LINE>
                        <FIELD NAME="Fld01">
                            <SET>$Guid</SET>
                            <XMLTAG>Guid</XMLTAG>
                        </FIELD>
                        <FIELD NAME="Fld02">
                            <SET>if $$IsEmpty:$AlterId then "0" else $$String:$AlterId</SET>
                            <XMLTAG>AlterId</XMLTAG>
                        </FIELD>
                        <FIELD NAME="Fld03">
                            <SET>$Symbol</SET>
                            <XMLTAG>Name</XMLTAG>
                        </FIELD>
                        <FIELD NAME="Fld04">
                            <SET>$FormalName</SET>
                            <XMLTAG>FormalName</XMLTAG>
                        </FIELD>
                        <FIELD NAME="Fld05">
                            <SET>if $IsSimpleUnit then 1 else 0</SET>
                            <XMLTAG>IsSimpleUnit</XMLTAG>
                        </FIELD>
                        <FIELD NAME="Fld06">
                            <SET>$BaseUnits</SET>
                            <XMLTAG>BaseUnits</XMLTAG>
                        </FIELD>
                        <FIELD NAME="Fld07">
                            <SET>$AdditionalUnits</SET>
                            <XMLTAG>AdditionalUnits</XMLTAG>
                        </FIELD>
                        <FIELD NAME="Fld08">
                            <SET>if $$IsEmpty:$Conversion then "0" else $$String:$Conversion</SET>
                            <XMLTAG>Conversion</XMLTAG>
                        </FIELD>
                        <FIELD NAME="FldBlank">
                            <SET>""</SET>
                        </FIELD>
                        <COLLECTION NAME="MyCollection">
                            <TYPE>Unit</TYPE>
                        </COLLECTION>
                    </TDLMESSAGE>
                </TDL>
            </DESC>
        </BODY>
    </ENVELOPE>`;
};
