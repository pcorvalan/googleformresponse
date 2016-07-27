function sendEmail(){
  
  
  var toAddress = "pablo.corvalan@intraway.com";
  var subject = "Esto es una prueba";
  
  var lastPost = getLastResponse();

  
  var template = HtmlService.createTemplateFromFile('emailBody');
  template.data = lastPost ;

  var body = template.evaluate().getContent();
  

 GmailApp.sendEmail(
     toAddress,         // recipient
    subject,                 // subject 
    'test', {                        // body
      htmlBody: body               // advanced options
    }
  ); 

   
  

}

function getLastResponse() {


  var sheet = SpreadsheetApp.getActiveSpreadsheet()
         .getSheetByName("Form Responses 1");
  
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  
  var header = sheet.getRange(1, 1, 1, lastCol).getValues();
  var lastPost =  sheet.getRange(lastRow, 1, 1, lastCol).getValues();
   
  var index = DataObj.indexifyHeaders ( header[0] );
  
  var objectPost = DataObj.objectifyData(index, lastPost)

  return objectPost;
  
  }
